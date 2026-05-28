import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || '';
if (baseUrl) {
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`;
  }
} else {
  baseUrl = '/api';
}

const api = axios.create({
  baseURL: baseUrl,
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

// Automatically handle JWT Token expiration & 401 Unauthorized states
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized request. Purging auth tokens and performing auto-logout redirection.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Avoid redirecting repeatedly if already on the login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
