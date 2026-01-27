import { useCallback, useRef, useState } from 'react';

export function useVoiceInput() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | recording | processing | error
  const [error, setError] = useState(null);

  // 🎙️ 开始录音
  const startRecording = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setStatus('recording');
    } catch (err) {
      console.error(err);
      setError('Microphone permission denied');
      setStatus('error');
    }
  }, []);

  // ⏹️ 停止录音，返回 audioBlob
  const stopRecording = useCallback(() => {
    return new Promise(resolve => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        setStatus('processing');

        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType,
        });

        cleanup();
        resolve(audioBlob);
      };

      recorder.stop();
    });
  }, []);

  // ❌ 取消录音（不返回音频）
  const cancelRecording = useCallback(() => {
    cleanup();
    setStatus('idle');
  }, []);

  // 🧹 清理资源
  const cleanup = () => {
    mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());

    mediaRecorderRef.current = null;
    streamRef.current = null;
    chunksRef.current = [];
  };

  return {
    status, // idle | recording | processing | error
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording: status === 'recording',
  };
}
