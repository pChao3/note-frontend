import request from './request';
// const url = 'http://localhost:3000';
import { url } from './index';

export const goLogin = params => {
  return request.post(`${url}/api/users/login`, params);
};

export const goRegistry = params => {
  return request.post(`${url}/api/users/registry`, params);
};
