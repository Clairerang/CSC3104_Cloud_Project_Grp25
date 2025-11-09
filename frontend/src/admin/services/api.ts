import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // assign Authorization header without changing the headers type
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// High-level API object used across the admin UI
export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/api/v1/auth/login', credentials),
    logout: () => apiClient.post('/api/v1/auth/logout'),
    verifyToken: () => apiClient.get('/api/v1/auth/verify'),
  },

  users: {
    getAll: (params?: any) => apiClient.get('/api/v1/users', { params }),
    getById: (id: string) => apiClient.get(`/api/v1/users/${id}`),
    create: (data: any) => apiClient.post('/api/v1/users', data),
    update: (id: string, data: any) => apiClient.put(`/api/v1/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/v1/users/${id}`),
    updateStatus: (id: string, status: 'active' | 'inactive') =>
      apiClient.patch(`/api/v1/users/${id}/status`, { status }),
    resetPassword: (id: string) => apiClient.post(`/api/v1/users/${id}/reset-password`),
    getStats: () => apiClient.get('/api/v1/users/stats'),
  },

  engagement: {
    getStats: () => apiClient.get('/api/v1/engagement/stats'),
    getByUser: (userId: string, params?: any) =>
      apiClient.get(`/api/v1/engagement/user/${userId}`, { params }),
    getCheckIns: (params?: any) => apiClient.get('/api/v1/engagement/checkins', { params }),
    getRecentActivity: (limit: number = 10) =>
      apiClient.get('/api/v1/engagement/recent', { params: { limit } }),
    getTrends: (period: 'day' | 'week' | 'month') =>
      apiClient.get('/api/v1/engagement/trends', { params: { period } }),
  },

  gamification: {
    getLeaderboard: (limit: number = 10) =>
      apiClient.get('/api/v1/gamification/leaderboard', { params: { limit } }),
    getUserBadges: (userId: string) => apiClient.get(`/api/v1/gamification/users/${userId}/badges`),
    getStats: () => apiClient.get('/api/v1/gamification/stats'),
    createChallenge: (data: any) => apiClient.post('/api/v1/gamification/challenges', data),
    getChallenges: () => apiClient.get('/api/v1/gamification/challenges'),
  },

  notifications: {
    getAll: (params?: any) => apiClient.get('/api/v1/notifications', { params }),
    getById: (id: string) => apiClient.get(`/api/v1/notifications/${id}`),
    markAsRead: (id: string) => apiClient.patch(`/api/v1/notifications/${id}/read`),
    getAlerts: () => apiClient.get('/api/v1/notifications/alerts'),
    sendBulk: (data: any) => apiClient.post('/api/v1/notifications/bulk', data),
  },

  system: {
    getHealth: () => apiClient.get('/health'),
    getServiceHealth: (service: string) => apiClient.get(`/health/${service}`),
    getAllServices: () => apiClient.get('/health/services'),
    getLogs: (params?: any) => apiClient.get('/api/v1/system/logs', { params }),
    getMetrics: () => apiClient.get('/api/v1/system/metrics'),
  },

  analytics: {
    getDashboard: () => apiClient.get('/api/v1/analytics/dashboard'),
    getUserEngagement: (params?: any) => apiClient.get('/api/v1/analytics/user-engagement', { params }),
    getSystemUsage: () => apiClient.get('/api/v1/analytics/system-usage'),
    exportData: (type: string, params?: any) =>
      apiClient.get(`/api/v1/analytics/export/${type}`, { params, responseType: 'blob' }),
  },

  settings: {
    getAll: () => apiClient.get('/api/v1/settings'),
    update: (data: any) => apiClient.put('/api/v1/settings', data),
    getEmailConfig: () => apiClient.get('/api/v1/settings/email'),
    updateEmailConfig: (data: any) => apiClient.put('/api/v1/settings/email', data),
  },
};

export default apiClient;
