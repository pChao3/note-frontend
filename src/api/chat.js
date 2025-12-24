import request from './request.js';
const url = 'http://localhost:3000';
export const getAnswer = data => {
  return request.post(`${url}/chat/completions`, data);
};
