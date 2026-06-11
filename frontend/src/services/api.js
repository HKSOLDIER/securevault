import axios from 'axios';

// const BASE_URL = 'http://localhost:8080';

// const BASE_URL = 'https://securevault-ics5.onrender.com';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};