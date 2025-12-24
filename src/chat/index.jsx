import { useState, useEffect } from 'react';
import { getAnswer } from '../api/chat';
import { Button, Input } from 'antd';
function Chat() {
  const [content, setContent] = useState('');
  const [ques, setQues] = useState('');
  const handle = async () => {
    if (ques.trim()) {
      const res = await getAnswer({
        content: ques,
      });
      console.log('res', res);
      setContent(res.data);
    }
  };
  return (
    <>
      <div>{content}</div>
      <div>
        <Input value={ques} onChange={e => setQues(e.target.value)} />
        <Button onClick={handle}>click</Button>
      </div>
    </>
  );
}

export default Chat;
