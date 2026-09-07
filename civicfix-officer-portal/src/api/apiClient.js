import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically catch 401 and global network drops
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please log in again.');
      // Delay navigation briefly so the toast is visible
      setTimeout(() => {
        window.location.href = '/login';
      }, 800);
    } else if (!error.response) {
      toast.error('Network error. Check your server connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;