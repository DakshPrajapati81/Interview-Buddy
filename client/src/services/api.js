import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on landing page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  googleLogin: (data) => api.post('/auth/google', data),
  getProfile: () => api.get('/auth/profile')
};

// Resume APIs
export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  get: () => api.get('/resume'),
  delete: () => api.delete('/resume')
};

// Interview APIs
export const interviewAPI = {
  start: (data) => api.post('/interview/start', data),
  submitAnswer: (id, data) => api.post(`/interview/${id}/answer`, data),
  complete: (id) => api.post(`/interview/${id}/complete`),
  getById: (id) => api.get(`/interview/${id}`),
  getHistory: (page = 1, limit = 10) => api.get(`/interview/history?page=${page}&limit=${limit}`)
};

export default api;
