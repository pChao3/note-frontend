import request from './request.js';
import { url } from './index.js';

export const getAnswer = data => {
  return request.post(`${url}/chat/completions`, data);
};

export const fetchAnswer = (options, messages, askRAG) => {
  // Read token at call-time so it reflects the current session.
  const token = sessionStorage.getItem('token');
  return fetch(`${url}/chat/completions`, {
    method: 'POST',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, askRAG }),
  });
};

export const getTextByVoice = data => {
  return request.post(`${url}/chat/asr`, data);
};
