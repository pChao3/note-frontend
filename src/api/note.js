import request from './request.js';
// const url = 'http://localhost:3000';
const url = 'https://note-express.vercel.app';

export const getNotes = () => {
  return request.get(`${url}/api/notes`);
};

export const searchNote = id => {
  return request.get(`${url}/api/notes/${id}`);
};

export const deleteNote = id => {
  return request.delete(`${url}/api/notes/${id}`);
};

export const addNote = params => {
  return request.post(`${url}/api/notes`, params);
};

export const makePoint = id => {
  return request.put(`${url}/api/notes/${id}`);
};

//  infos
export const getStatistic = () => {
  return request.get(`${url}/api/infos/statistic`);
};

export const getAllMonthes = () => {
  return request.get(`${url}/api/infos/allMonthes`);
};

export const getAllMoods = () => {
  return request.get(`${url}/api/infos/moods`);
};

export const queryNote = params => {
  return request.post(`${url}/api/infos/searchNotes`, params);
};
// import { getNotesByMonth, getNotesByDate } from '../api/note';

export const getNotesByMonth = month => {
  return request.get(`${url}/api/infos/month-active/${month}`);
};

export const getNotesByDate = data => {
  return request.get(`${url}/api/infos/by-date/${data}`);
};

export const getUserInfo = () => {
  return request.get(`${url}/api/infos/getUserInfo`);
};

export const setUserInfo = params => {
  return request.post(`${url}/api/infos/setUserInfo`, params);
};

// 上传头像（文件流）
export const uploadAvatar = formData => {
  return request.post(`${url}/api/infos/upload-avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
