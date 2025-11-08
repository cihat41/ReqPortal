import axios from 'axios';

// API base URL - Vite proxy kullanıyoruz
const API_BASE_URL = '/api';

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

// Form Templates API
export const formTemplatesAPI = {
  getAll: (params) =>
    api.get('/formtemplates', { params }),

  getById: (id) =>
    api.get(`/formtemplates/${id}`),

  create: (templateData) =>
    api.post('/formtemplates', templateData),

  update: (id, templateData) =>
    api.put(`/formtemplates/${id}`, templateData),

  delete: (id) =>
    api.delete(`/formtemplates/${id}`),

  activate: (id) =>
    api.post(`/formtemplates/${id}/activate`),

  deactivate: (id) =>
    api.post(`/formtemplates/${id}/deactivate`),
};

// Users API
export const usersAPI = {
  getAll: (params) =>
    api.get('/users', { params }),

  getById: (id) =>
    api.get(`/users/${id}`),

  create: (userData) =>
    api.post('/users', userData),

  update: (id, userData) =>
    api.put(`/users/${id}`, userData),

  delete: (id) =>
    api.delete(`/users/${id}`),

  getRoles: () =>
    api.get('/users/roles'),

  assignRole: (userId, roleId) =>
    api.post(`/users/${userId}/roles/${roleId}`),

  removeRole: (userId, roleId) =>
    api.delete(`/users/${userId}/roles/${roleId}`),
};

// Comments API
export const commentsAPI = {
  getByRequestId: (requestId) =>
    api.get(`/comments/request/${requestId}`),

  create: (commentData) =>
    api.post('/comments', commentData),

  delete: (id) =>
    api.delete(`/comments/${id}`),
};

// Attachments API
export const attachmentsAPI = {
  getByRequestId: (requestId) =>
    api.get(`/attachments/request/${requestId}`),

  upload: (requestId, formData) =>
    api.post(`/attachments/upload/${requestId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  download: (id) =>
    api.get(`/attachments/${id}/download`, {
      responseType: 'blob',
    }),

  delete: (id) =>
    api.delete(`/attachments/${id}`),
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: (params) =>
    api.get('/auditlogs', { params }),

  getByEntity: (entityType, entityId) =>
    api.get(`/auditlogs/${entityType}/${entityId}`),
};

// Approval Workflows API
export const workflowsAPI = {
  getAll: (params) =>
    api.get('/approvalworkflows', { params }),

  getById: (id) =>
    api.get(`/approvalworkflows/${id}`),

  create: (workflowData) =>
    api.post('/approvalworkflows', workflowData),

  update: (id, workflowData) =>
    api.put(`/approvalworkflows/${id}`, workflowData),

  delete: (id) =>
    api.delete(`/approvalworkflows/${id}`),

  activate: (id) =>
    api.post(`/approvalworkflows/${id}/activate`),

  deactivate: (id) =>
    api.post(`/approvalworkflows/${id}/deactivate`),
};

// Email Templates API
export const emailTemplatesAPI = {
  getAll: (params) =>
    api.get('/emailtemplates', { params }),

  getById: (id) =>
    api.get(`/emailtemplates/${id}`),

  create: (templateData) =>
    api.post('/emailtemplates', templateData),

  update: (id, templateData) =>
    api.put(`/emailtemplates/${id}`, templateData),

  delete: (id) =>
    api.delete(`/emailtemplates/${id}`),

  getVariables: () =>
    api.get('/emailtemplates/variables'),

  preview: (id, data) =>
    api.post(`/emailtemplates/${id}/preview`, data),
};

// Settings API
export const settingsAPI = {
  getEmailSettings: () =>
    api.get('/settings/email'),

  updateEmailSettings: (settings) =>
    api.put('/settings/email', settings),

  testEmail: (email) =>
    api.post('/settings/email/test', { email }),
};

// Reports API
export const reportsAPI = {
  getOverview: (params) =>
    api.get('/reports/overview', { params }),

  getByStatus: (params) =>
    api.get('/reports/by-status', { params }),

  getByCategory: (params) =>
    api.get('/reports/by-category', { params }),

  getByUser: (params) =>
    api.get('/reports/by-user', { params }),

  getSlaCompliance: (params) =>
    api.get('/reports/sla-compliance', { params }),

  getApprovalPerformance: (params) =>
    api.get('/reports/approval-performance', { params }),

  getTimeSeries: (params) =>
    api.get('/reports/time-series', { params }),

  exportToExcel: (params) =>
    api.get('/reports/export/excel', {
      params,
      responseType: 'blob',
    }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) =>
    api.get('/notifications', { params }),

  getUnreadCount: () =>
    api.get('/notifications/unread-count'),

  markAsRead: (id) =>
    api.post(`/notifications/${id}/mark-read`),

  markAllAsRead: () =>
    api.post('/notifications/mark-all-read'),

  delete: (id) =>
    api.delete(`/notifications/${id}`),

  clearAll: () =>
    api.delete('/notifications/clear-all'),
};

export default api;

