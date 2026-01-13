import axios from 'axios';

const request = axios.create({});

// ------------------------
// 请求拦截器
// ------------------------
request.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// ------------------------
// 响应拦截器
// ------------------------
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      const status = error.response.status;
      // Token 失效
      if (status === 401) {
        sessionStorage.removeItem('token');
        window.location.href = '/login'; // 自动跳到登录
      }
    }
    return Promise.reject(error);
  }
);

export default request;
