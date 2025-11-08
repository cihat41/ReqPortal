import axios from 'axios';

// API base URL - backend port 7225'da çalışıyor
const API_BASE_URL = 'https://localhost:7225/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT token ekle
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

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz veya süresi dolmuş
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
};

// Requests API
export const requestsAPI = {
  getAll: (params) =>
    api.get('/requests', { params }),

  getById: (id) =>
    api.get(`/requests/${id}`),

  create: (requestData) =>
    api.post('/requests', requestData),

  update: (id, requestData) =>
    api.put(`/requests/${id}`, requestData),

  delete: (id) =>
    api.delete(`/requests/${id}`),
};

// Approvals API
export const approvalsAPI = {
  getPending: () =>
    api.get('/approvals/pending'),

  getHistory: () =>
    api.get('/approvals/history'),

  approve: (id, data) =>
    api.post(`/approvals/${id}/approve`, data),

  reject: (id, data) =>
    api.post(`/approvals/${id}/reject`, data),

  return: (id, data) =>
    api.post(`/approvals/${id}/return`, data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard/stats'),
};

export default api;

