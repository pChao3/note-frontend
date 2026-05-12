import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Pick the best MediaRecorder mimeType supported by the current browser.
 * Returns `{ mimeType, format }` where `format` is the short extension the
 * backend expects (webm / mp4 / ogg / wav).
 */
function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return { mimeType: '', format: 'webm' };

  const candidates = [
    { mimeType: 'audio/webm;codecs=opus', format: 'webm' },
    { mimeType: 'audio/webm', format: 'webm' },
    { mimeType: 'audio/ogg;codecs=opus', format: 'ogg' },
    { mimeType: 'audio/mp4;codecs=mp4a.40.2', format: 'mp4' }, // iOS Safari
    { mimeType: 'audio/mp4', format: 'mp4' },
    { mimeType: 'audio/aac', format: 'aac' },
    { mimeType: 'audio/wav', format: 'wav' },
  ];

  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c.mimeType)) return c;
    } catch {
      /* ignore */
    }
  }
  return { mimeType: '', format: 'webm' };
}

// Max payload size the backend accepts (in bytes, before base64).
// base64 inflates by ~33%, so if backend limit is 1MB, raw audio max ~750KB.
const MAX_BLOB_SIZE_BYTES = 750 * 1024;

/**
 * Voice input hook.
 * Exposes start / stop / cancel plus live `duration`, `volume` and `status`.
 */
export function useVoiceInput({ maxDurationMs = 60_000 } = {}) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const formatRef = useRef('webm');

  // Live-duration tracking
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);

  // Live-volume (for waveform) tracking via Web Audio API
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const maxTimeoutRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | recording | processing | error
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0); // ms
  const [volume, setVolume] = useState(0); // 0 - 1

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      audioCtxRef.current?.close();
    } catch {
      /* ignore */
    }
    audioCtxRef.current = null;
    analyserRef.current = null;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    setVolume(0);
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    // Guard: ignore duplicate starts (important on mobile where touch can double-fire)
    if (status === 'recording' || status === 'processing') return;
    setError(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setError('当前浏览器不支持录音,请使用最新的 Chrome / Safari');
      setStatus('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const { mimeType, format } = pickMimeType();
      formatRef.current = format;
      // Use a low bitrate (32kbps) to keep the payload small and avoid the
      // backend's "request entity too large" error. Speech is intelligible
      // well below what MediaRecorder defaults to (~128kbps).
      const recorderOptions = { audioBitsPerSecond: 32000 };
      if (mimeType) recorderOptions.mimeType = mimeType;
      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      // ---------- Live duration ----------
      startedAtRef.current = Date.now();
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(Date.now() - startedAtRef.current);
      }, 100);

      // ---------- Live volume (for waveform) ----------
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;
          const buf = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i += 1) {
              const v = (buf[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / buf.length);
            setVolume(Math.min(1, rms * 2.5));
            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
        }
      } catch {
        /* volume analyser is best-effort */
      }

      // ---------- Hard stop at maxDuration ----------
      maxTimeoutRef.current = setTimeout(() => {
        try {
          recorder.state === 'recording' && recorder.stop();
        } catch {
          /* ignore */
        }
      }, maxDurationMs);

      recorder.start();
      setStatus('recording');
    } catch (err) {
      console.error('[voice] getUserMedia failed', err);
      let msg = '无法访问麦克风';
      if (err && err.name === 'NotAllowedError') msg = '麦克风权限被拒绝,请在系统设置中允许';
      else if (err && err.name === 'NotFoundError') msg = '未检测到麦克风设备';
      else if (err && err.name === 'NotReadableError') msg = '麦克风被其他应用占用';
      setError(msg);
      setStatus('error');
      cleanup();
    }
  }, [status, maxDurationMs, cleanup]);

  /**
   * Stop recording and return a Blob + meta, or null if nothing was recorded
   * / duration was too short.
   */
  const stopRecording = useCallback(
    ({ minDurationMs = 300 } = {}) => {
      return new Promise(resolve => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
          cleanup();
          setStatus('idle');
          resolve(null);
          return;
        }

        const elapsed = Date.now() - startedAtRef.current;
        recorder.onstop = () => {
          setStatus('processing');
          const mimeType = recorder.mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: mimeType });
          cleanup();

          if (elapsed < minDurationMs || blob.size === 0) {
            setStatus('idle');
            resolve({ tooShort: true, blob: null, format: formatRef.current, durationMs: elapsed });
            return;
          }

          // Guard: reject blobs that would exceed the backend payload limit,
          // so we never even attempt to send "request entity too large".
          if (blob.size > MAX_BLOB_SIZE_BYTES) {
            setStatus('idle');
            resolve({
              tooShort: false,
              tooLarge: true,
              blob: null,
              format: formatRef.current,
              durationMs: elapsed,
              blobSize: blob.size,
            });
            return;
          }

          resolve({
            tooShort: false,
            tooLarge: false,
            blob,
            format: formatRef.current,
            mimeType,
            durationMs: elapsed,
          });
        };

        try {
          recorder.stop();
        } catch {
          cleanup();
          setStatus('idle');
          resolve(null);
        }
      });
    },
    [cleanup]
  );

  /** Cancel without producing audio. Safe to call any time. */
  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {
        cleanup();
        setStatus('idle');
      };
      try {
        recorder.stop();
      } catch {
        cleanup();
        setStatus('idle');
      }
    } else {
      cleanup();
      setStatus('idle');
    }
  }, [cleanup]);

  const markIdle = useCallback(() => setStatus('idle'), []);

  return {
    status,
    error,
    duration,
    volume,
    isRecording: status === 'recording',
    isProcessing: status === 'processing',
    startRecording,
    stopRecording,
    cancelRecording,
    markIdle,
  };
}
