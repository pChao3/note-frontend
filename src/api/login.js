import request from './request';
// const url = 'http://localhost:3000';
const url = 'https://note-express.vercel.app';

export const goLogin = params => {
  return request.post(`${url}/api/users/login`, params);
};

export const goRegistry = params => {
  return request.post(`${url}/api/users/registry`, params);
};
