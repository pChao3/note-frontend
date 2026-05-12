import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { Mic, X, ChevronUp } from 'lucide-react';

import { useVoiceInput } from '../hooks/VoiceInput';
import { getTextByVoice } from '../api/chat';

const CANCEL_THRESHOLD_PX = 60; // slide up this far to cancel (WeChat-style)
const MIN_DURATION_MS = 500;
const MAX_DURATION_MS = 60_000;

/**
 * Press-and-hold voice input button. Optimized for mobile:
 *  - Uses pointer events (unifies mouse + touch), avoids double-firing
 *  - Slide-up-to-cancel gesture
 *  - Haptic-style visual feedback + live waveform + timer
 *  - Picks the best supported mime-type per browser (iOS records mp4, not webm)
 *  - Filters out taps shorter than 500ms to avoid accidental sends
 */
function VoiceInputButton({ onSend, setPageStatus }) {
  const {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isProcessing,
    duration,
    volume,
    error,
  } = useVoiceInput({ maxDurationMs: MAX_DURATION_MS });

  const btnRef = useRef(null);
  const activePointerRef = useRef(null);
  const startYRef = useRef(0);
  const [cancelHover, setCancelHover] = useState(false);
  const cancelHoverRef = useRef(false);
  const [uploading, setUploading] = useState(false);

  // Keep ref in sync so event handlers read fresh value without re-binding
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
      try {
        const base64Audio = await blobToBase64(blob);
        const res = await getTextByVoice({ audioData: base64Audio, format });
        if (res.msg !== 'ok') {
          message.info(res.msg || '识别失败');
        } else {
          onSend?.(res.data);
        }
      } catch (err) {
        console.error('语音识别请求失败', err);
        message.error(err?.message || '语音识别请求失败');
      } finally {
        setUploading(false);
        setPageStatus?.(false);
      }
    },
    [onSend, setPageStatus]
  );

  // ---------- Pointer lifecycle ----------
  const onPointerDown = async e => {
    // Only react to the first pointer
    if (activePointerRef.current !== null) return;
    if (e.button && e.button !== 0) return; // left-click only on mouse
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
  };

  const onPointerMove = e => {
    if (activePointerRef.current !== e.pointerId) return;
    const dy = startYRef.current - e.clientY; // upward movement is positive
    setCancelHover(dy > CANCEL_THRESHOLD_PX);
  };

  const finishPointer = async (e, { forceCancel = false } = {}) => {
    if (activePointerRef.current !== e.pointerId) return;
    activePointerRef.current = null;
    try {
      btnRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }

    if (forceCancel || cancelHoverRef.current) {
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
    sendAudio(result);
  };

  const onPointerUp = e => finishPointer(e);
  const onPointerCancel = e => finishPointer(e, { forceCancel: true });

  // Safety: release pointer if component unmounts while recording
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

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="按住说话"
        disabled={busy}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={e => e.preventDefault()}
        className={`no-select tap-feedback inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-10 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          isRecording
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <Mic className="w-4 h-4" />
        <span className="hidden sm:inline">
          {busy ? '识别中...' : isRecording ? '松开发送' : '按住说话'}
        </span>
        {isRecording && (
          <span className={`text-xs tabular-nums ${nearLimit ? 'animate-pulse' : ''}`}>
            {seconds}s
          </span>
        )}
      </button>

      {/* Full-screen overlay while recording — shows waveform + cancel zone */}
      {isRecording && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none safe-pb"
          aria-hidden
        >
          {/* Dim backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Cancel hint zone (top) */}
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

          {/* Card with waveform + timer */}
          <div className="relative mb-32 w-72 max-w-[80vw] rounded-3xl bg-white/95 dark:bg-gray-800/95 shadow-2xl px-6 py-5 text-center">
            <div className="flex items-center justify-center h-12 text-red-500">
              <span
                className="voice-bar"
                style={{ transform: `scaleY(${0.3 + volume * 1.4})` }}
              />
              <span
                className="voice-bar"
                style={{ transform: `scaleY(${0.3 + volume * 1.2})` }}
              />
              <span
                className="voice-bar"
                style={{ transform: `scaleY(${0.3 + volume * 1.6})` }}
              />
              <span
                className="voice-bar"
                style={{ transform: `scaleY(${0.3 + volume * 1.2})` }}
              />
              <span
                className="voice-bar"
                style={{ transform: `scaleY(${0.3 + volume * 1.4})` }}
              />
            </div>
            <p className="mt-2 text-sm tabular-nums text-gray-700 dark:text-gray-200">
              {seconds}s
              {nearLimit && (
                <span className="ml-2 text-red-500">剩余 {remaining}s</span>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500 flex items-center justify-center gap-1">
              <ChevronUp className="w-3 h-3" /> 上滑取消
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default VoiceInputButton;
