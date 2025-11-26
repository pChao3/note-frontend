import { useState, useEffect } from 'react';
import { getNotes, addNote, deleteNote, makePoint } from './api/index';
import { message, Input, Button } from 'antd';
import './App.css';

function App() {
  const [list, setList] = useState([]);
  const [contentValue, setContentValue] = useState('');
  const getAllNotes = async () => {
    const data = await getNotes();
    if (data.status === 200) {
      setList(data.data);
    } else {
      message.error('发生错误！');
    }
  };

  const saveNote = async () => {
    const params = {
      content: contentValue,
    };
    const res = await addNote(params);
    console.log('res', res);
    if (res.data.isSaved) {
      message.success(res.data.msg);
      getAllNotes();
      setContentValue('');
    }
  };

  const Del = async id => {
    console.log('res', id);

    const res = await deleteNote(id);
    if (res.data.isDeleted) {
      message.success(res.data.msg);
      getAllNotes();
    }
  };

  const changeMark = async id => {
    const res = await makePoint(id);
    if (res.data.status) {
      message.success(res.data.msg);
      getAllNotes();
    }
  };

  useEffect(() => {
    getAllNotes();
  }, []);
  return (
    <>
      <div>
        {list.map(i => (
          <h3>
            <span>{i.content}</span>
            <Button onClick={() => changeMark(i.id)}>
              {i.important ? 'make not important' : 'make important'}
            </Button>
            <span style={{ color: 'red', cursor: 'pointer' }} onClick={() => Del(i.id)}>
              X
            </span>
          </h3>
        ))}
        <Input
          placeholder="plase write something"
          value={contentValue}
          onChange={e => setContentValue(e.target.value)}
        />
        <Button type="primary" onClick={saveNote}>
          save
        </Button>
      </div>
    </>
  );
}

export default App;
