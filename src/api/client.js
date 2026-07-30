import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('studiora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (formData) => apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  getMe: () => apiClient.get('/auth/me'),
};

export const analyticsAPI = {
  getSummary: () => apiClient.get('/analytics/summary'),
};

export const checkinAPI = {
  submitCheckin: (data) => apiClient.post('/checkin', data),
  getLatest: () => apiClient.get('/checkin/latest'),
};

export const chatbotAPI = {
  askFlora: (message) => apiClient.post('/chatbot/ask', { message }),
};
