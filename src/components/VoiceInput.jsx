import { useVoiceInput } from '../hooks/VoiceInput';
import { getTextByVoice } from '../api/chat';
import { message } from 'antd';

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
      // 发送给后端
      try {
        const res = await getTextByVoice({ audioData: base64Audio, format: 'webm' });
        console.log('res', res);
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
    <button onMouseDown={startRecording} onMouseUp={handleSendVoice} onMouseLeave={stopRecording}>
      {isRecording ? '🎙️ Recording...' : '🎤 Hold to talk'}
    </button>
  );
}

export default VoiceInputButton;
