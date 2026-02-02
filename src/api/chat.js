import request from './request.js';
// const url = 'http://localhost:3000';
import { url } from './index.js';
const token = sessionStorage.getItem('token');
export const getAnswer = data => {
  return request.post(`${url}/chat/completions`, data);
};

export const fetchAnswer = (options, messages, askARG) => {
  return fetch(`${url}/chat/completions`, {
    method: 'POST',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, askARG }),
  });
};

export const getTextByVoice = data => {
  return request.post(`${url}/chat/asr`, data);
};
