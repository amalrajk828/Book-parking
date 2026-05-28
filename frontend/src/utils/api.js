import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return '/api';
  }
  // If the envUrl is a relative path (like '/api'), use it directly
  if (envUrl.startsWith('/')) {
    return envUrl;
  }
  // Trim trailing slash
  const cleanedUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  // If it already ends with /api, use it; otherwise append it
  if (cleanedUrl.endsWith('/api')) {
    return cleanedUrl;
  }
  return `${cleanedUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Token into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
