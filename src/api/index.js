// Centralized API base URL and re-exports.
// export const url = 'http://localhost:3000';
export const url = 'https://note-express-v30c.onrender.com';

export {
  getNotes,
  searchNote,
  deleteNote,
  addNote,
  changeNote,
  getStatistic,
  getAllMonthes,
  getAllMoods,
  queryNote,
  getNotesByDate,
  getUserInfo,
  setUserInfo,
  uploadAvatar,
  getNotesNumber,
} from './note.js';

// Back-compat: Notes.jsx imports `makePoint` from `./index.js`.
// It was not present in note.js — re-implement here against the same endpoint.
import request from './request.js';
export const makePoint = id => {
  return request.put(`${url}/api/notes/${id}`);
};
