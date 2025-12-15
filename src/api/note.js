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
