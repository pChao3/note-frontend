import { useVoiceInput } from '../hooks/VoiceInput';
import { getTextByVoice } from '../api/chat';
import { message } from 'antd';
import { Mic, Square } from 'lucide-react';

function VoiceInputButton({ onSend, setPageStatus }) {
  const { startRecording, stopRecording, isRecording, status } = useVoiceInput();

  const handleSendVoice = async () => {
    setPageStatus(true);
    const audioBlob = await stopRecording();
    if (!audioBlob) return;

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result;
      try {
        const res = await getTextByVoice({ audioData: base64Audio, format: 'webm' });
        if (res.msg !== 'ok') {
          message.info(res.msg);
        } else {
          onSend(res.data);
        }
      } catch (err) {
        console.error('语音识别请求失败', err);
        message.info(err.message);
      } finally {
        setPageStatus(false);
      }
    };
  };

  return (
    <button
      onMouseDown={startRecording}
      onMouseUp={handleSendVoice}
      onMouseLeave={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={handleSendVoice}
      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        isRecording
          ? 'bg-red-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {isRecording ? (
        <>
          <Square className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">录音中...</span>
        </>
      ) : (
        <>
          <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">语音</span>
        </>
      )}
    </button>
  );
}

export default VoiceInputButton;
