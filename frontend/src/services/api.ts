import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 429) {
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: {
            message: 'Too many requests. Please wait a moment and refresh.',
            type: 'error',
          },
        })
      );
    }
    return Promise.reject(error);
  }
);
