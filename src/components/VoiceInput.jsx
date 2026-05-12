import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import { Mic, X, ChevronUp, Square } from 'lucide-react';

import { useVoiceInput } from '../hooks/VoiceInput';
import { getTextByVoice } from '../api/chat';

const CANCEL_THRESHOLD_PX = 60; // slide up this far to cancel (WeChat-style)
const MIN_DURATION_MS = 500;
const MAX_DURATION_MS = 30_000;

/**
 * Detect touch-capable devices. We use this to pick the interaction model:
 *  - Touch devices  → press-and-hold, swipe-up to cancel (WeChat style)
 *  - Desktop        → click to start, click again to stop, ESC to cancel
 *
 * `matchMedia('(hover: none) and (pointer: coarse)')` is the reliable check
 * (it tracks primary input mechanism, not just whether touch events exist).
 */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(hover: none) and (pointer: coarse)');
    const handler = e => setIsTouch(e.matches);
    mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler);
    return () =>
      mql.removeEventListener
        ? mql.removeEventListener('change', handler)
        : mql.removeListener(handler);
  }, []);
  return isTouch;
}

/**
 * Voice input button — adapts interaction model to the device:
 *  - Touch: press-and-hold + swipe-up-to-cancel
 *  - Desktop: click to start, click to stop, ESC to cancel
 *
 * Both modes share:
 *  - Best-effort mimeType detection per browser (iOS mp4, Chrome webm)
 *  - Live waveform + timer + permission error handling
 *  - Min 500ms / max 60s duration filters
 */
function VoiceInputButton({ onSend, onClear, setPageStatus }) {
  const isTouch = useIsTouchDevice();
  const {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isProcessing,
    duration,
    volume,
    error,
    markIdle,
  } = useVoiceInput({ maxDurationMs: MAX_DURATION_MS });

  const btnRef = useRef(null);
  const activePointerRef = useRef(null);
  const startYRef = useRef(0);
  const [cancelHover, setCancelHover] = useState(false);
  const cancelHoverRef = useRef(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    cancelHoverRef.current = cancelHover;
  }, [cancelHover]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const blobToBase64 = blob =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const sendAudio = useCallback(
    async ({ blob, format }) => {
      setUploading(true);
      setPageStatus?.(true);
      onClear?.();   // 请求前先清空上一次的内容
      try {
        const base64Audio = await blobToBase64(blob);
        const res = await getTextByVoice({ audioData: base64Audio, format });

        // Business-level error responses (HTTP 200, shape: { status, message })
        if (res?.status === 'error') {
          const errMsg = String(res.message || '').toLowerCase();
          if (errMsg.includes('too large') || errMsg.includes('entity too large')) {
            message.error('录音文件过大,请缩短录音时长后重试（建议 15 秒以内）');
          } else if (errMsg.includes('timeout') || errMsg.includes('timed out')) {
            message.error('语音识别超时,请重试');
          } else {
            message.error(res.message || '语音识别失败,请重试');
          }
          return;
        }

        if (res.msg !== 'ok') {
          message.info(res.msg || '识别失败,请重试');
        } else {
          onSend?.(res.data);
        }
      } catch (err) {
        console.error('语音识别请求失败', err);
        // HTTP-level errors (413 Payload Too Large, timeouts, offline, ...)
        const httpStatus = err?.response?.status;
        const serverMsg = String(err?.response?.data?.message || '').toLowerCase();
        if (httpStatus === 413 || serverMsg.includes('too large')) {
          message.error('录音文件过大,请缩短录音时长后重试（建议 15 秒以内）');
        } else if (httpStatus === 408 || err?.code === 'ECONNABORTED') {
          message.error('请求超时,请检查网络后重试');
        } else if (!navigator.onLine) {
          message.error('网络已断开,请恢复网络后重试');
        } else {
          message.error(err?.response?.data?.message || err?.message || '语音识别请求失败');
        }
      } finally {
        setUploading(false);
        setPageStatus?.(false);
        markIdle();
      }
    },
    [onSend, setPageStatus, markIdle, onClear]
  );

  const finishAndSend = useCallback(
    async ({ forceCancel = false } = {}) => {
      if (forceCancel) {
        cancelRecording();
        setCancelHover(false);
        return;
      }
      const result = await stopRecording({ minDurationMs: MIN_DURATION_MS });
      setCancelHover(false);
      if (!result) return;
      if (result.tooShort) {
        message.warning('说话时间太短');
        return;
      }
      if (result.tooLarge) {
        message.error('录音文件过大,请缩短录音时长（建议 15 秒以内）');
        return;
      }
      sendAudio(result);
    },
    [cancelRecording, stopRecording, sendAudio]
  );

  // ---------- Touch: pointer lifecycle ----------
  const onPointerDown = useCallback(
    async e => {
      if (activePointerRef.current !== null) return;
      if (e.button && e.button !== 0) return;
      e.preventDefault();
      activePointerRef.current = e.pointerId;
      startYRef.current = e.clientY;
      setCancelHover(false);
      try {
        btnRef.current?.setPointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
      await startRecording();
    },
    [startRecording]
  );

  const onPointerMove = useCallback(e => {
    if (activePointerRef.current !== e.pointerId) return;
    const dy = startYRef.current - e.clientY;
    setCancelHover(dy > CANCEL_THRESHOLD_PX);
  }, []);

  const finishPointer = useCallback(
    async (e, { forceCancel = false } = {}) => {
      if (activePointerRef.current !== e.pointerId) return;
      activePointerRef.current = null;
      try {
        btnRef.current?.releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
      await finishAndSend({
        forceCancel: forceCancel || cancelHoverRef.current,
      });
    },
    [finishAndSend]
  );

  const onPointerUp = useCallback(e => finishPointer(e), [finishPointer]);
  const onPointerCancel = useCallback(
    e => finishPointer(e, { forceCancel: true }),
    [finishPointer]
  );

  // ---------- Desktop: click to toggle ----------
  const onDesktopClick = useCallback(async () => {
    if (isRecording) {
      await finishAndSend();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, finishAndSend]);

  // ESC key cancels desktop recording. Also works on touch if a keyboard is connected.
  useEffect(() => {
    if (!isRecording) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelRecording();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRecording, cancelRecording]);

  // Safety: stop recording if the component unmounts while active
  useEffect(
    () => () => {
      if (isRecording) cancelRecording();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const seconds = (duration / 1000).toFixed(1);
  const remaining = Math.max(0, Math.ceil((MAX_DURATION_MS - duration) / 1000));
  const nearLimit = duration > MAX_DURATION_MS - 10_000;
  const busy = uploading || isProcessing;

  // Pick handlers based on device type
  const pointerHandlers = useMemo(
    () =>
      isTouch
        ? {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
          }
        : {
            onClick: onDesktopClick,
          },
    [isTouch, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onDesktopClick]
  );

  const label = (() => {
    if (isRecording) {
      return isTouch ? '松开发送' : '点击停止';
    }
    return isTouch ? '按住说话' : '点击录音';
  })();

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-pressed={isRecording}
        onContextMenu={e => e.preventDefault()}
        {...pointerHandlers}
        className={`no-select tap-feedback inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-10 rounded-xl text-sm font-medium transition-colors ${
          isRecording
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : busy
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {isRecording && !isTouch ? (
          <Square className="w-4 h-4" />
        ) : busy ? (
          <Mic className="w-4 h-4 animate-pulse" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{busy ? '识别中...' : label}</span>
        {isRecording && (
          <span className={`text-xs tabular-nums ${nearLimit ? 'animate-pulse' : ''}`}>
            {seconds}s
          </span>
        )}
      </button>

      {/* ---------- Touch overlay ---------- */}
      {isRecording && isTouch && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none safe-pb"
          aria-hidden
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Cancel hint zone */}
          <div
            className={`absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all ${
              cancelHover ? 'scale-110' : ''
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                cancelHover ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700'
              }`}
            >
              <X className="w-7 h-7" />
            </div>
            <p className="mt-3 text-white text-sm font-medium">
              {cancelHover ? '松开手指,取消发送' : '上滑取消'}
            </p>
          </div>

          {/* Waveform card */}
          <div className="relative mb-32 w-72 max-w-[80vw] rounded-3xl bg-white/95 dark:bg-gray-800/95 shadow-2xl px-6 py-5 text-center">
            <Waveform volume={volume} />
            <p className="mt-2 text-sm tabular-nums text-gray-700 dark:text-gray-200">
              {seconds}s
              {nearLimit && <span className="ml-2 text-red-500">剩余 {remaining}s</span>}
            </p>
            <p className="mt-1 text-xs text-gray-500 flex items-center justify-center gap-1">
              <ChevronUp className="w-3 h-3" /> 上滑取消
            </p>
          </div>
        </div>
      )}

      {/* ---------- Desktop inline indicator ---------- */}
      {isRecording && !isTouch && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl px-4 py-3 min-w-[260px]"
        >
          <span
            className="inline-flex w-2.5 h-2.5 rounded-full bg-red-500 voice-pulse"
            aria-hidden
          />
          <div className="flex-1 text-red-500">
            <Waveform volume={volume} />
          </div>
          <div className="text-right">
            <p className="text-sm tabular-nums text-gray-700 dark:text-gray-200">{seconds}s</p>
            {nearLimit && (
              <p className="text-[11px] text-red-500 leading-tight">剩余 {remaining}s</p>
            )}
          </div>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              cancelRecording();
            }}
            title="取消 (Esc)"
            aria-label="取消录音"
            className="tap-feedback p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

function Waveform({ volume }) {
  // A 5-bar equalizer that modulates by the mic RMS volume.
  const scales = [1.4, 1.2, 1.6, 1.2, 1.4];
  return (
    <div className="flex items-center justify-center h-10 text-red-500">
      {scales.map((s, i) => (
        <span
          key={i}
          className="voice-bar"
          style={{ transform: `scaleY(${0.3 + volume * s})` }}
        />
      ))}
    </div>
  );
}

export default VoiceInputButton;
