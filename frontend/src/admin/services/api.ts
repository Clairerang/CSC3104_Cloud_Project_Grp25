import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    console.log('API Interceptor: Request to', config.url);
    console.log('API Interceptor: Token found:', token ? token.substring(0, 20) + '...' : 'NONE');
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
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API object used across the admin UI
export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/api/login', credentials),
    logout: () => apiClient.post('/api/logout'),
    verifyToken: () => apiClient.get('/api/verify'),
  },

  users: {
    getAll: (params?: any) => apiClient.get('/api/admin/users', { params }),
    getById: (id: string) => apiClient.get(`/api/users/${id}`),
    create: (data: any) => apiClient.post('/api/register', data),
    update: (id: string, data: any) => apiClient.put(`/api/admin/update-user/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/admin/users/${id}`),
    updateStatus: (id: string, status: 'active' | 'inactive') =>
      apiClient.patch(`/api/admin/users/${id}/status`, { status }),
    resetPassword: (id: string) => apiClient.post(`/api/admin/users/${id}/reset-password`),
    getStats: () => apiClient.get('/api/admin/stats/usercount'),
  },

  engagement: {
    getStats: () => apiClient.get('/api/admin/stats/today'),
    getByUser: (userId: string, params?: any) =>
      apiClient.get(`/api/engagements/user/${userId}`, { params }),
    getCheckIns: (params?: any) => apiClient.get('/api/engagements/today', { params }),
    getRecentActivity: (limit: number = 10) =>
      apiClient.get('/api/engagements/recent', { params: { limit } }),
    getTrends: (period: 'day' | 'week' | 'month') =>
      apiClient.get('/api/admin/stats/weekly-engagement', { params: { period } }),
  },

  gamification: {
    getLeaderboard: (limit: number = 10) =>
      apiClient.get('/api/leaderboard', { params: { limit } }),
    getUserBadges: (userId: string) => apiClient.get(`/api/users/${userId}/badges`),
    getStats: () => apiClient.get('/api/gamification/stats'),
    createChallenge: (data: any) => apiClient.post('/api/challenges', data),
    getChallenges: () => apiClient.get('/api/challenges'),
  },

  notifications: {
    getAll: (params?: any) => apiClient.get('/api/notifications', { params }),
    getById: (id: string) => apiClient.get(`/api/notifications/${id}`),
    markAsRead: (id: string) => apiClient.patch(`/api/notifications/${id}/read`),
    getAlerts: () => apiClient.get('/api/notifications/alerts'),
    sendBulk: (data: any) => apiClient.post('/api/notifications/bulk', data),
  },

  health: {
    getOverall: () => apiClient.get('/api/health'),
    getService: (service: string) => apiClient.get(`/api/health/${service}`),
    getAllServices: () => apiClient.get('/api/health/services'),
  },

  system: {
    getHealth: () => apiClient.get('/api/health'),
    getServiceHealth: (service: string) => apiClient.get(`/api/health/${service}`),
    getAllServices: () => apiClient.get('/api/health/services'),
    getLogs: (params?: any) => apiClient.get('/api/system/logs', { params }),
    getMetrics: () => apiClient.get('/api/system/metrics'),
  },

  analytics: {
    getDashboard: () => apiClient.get('/api/admin/stats/today'),
    getUserEngagement: (params?: any) => apiClient.get('/api/admin/stats/weekly-engagement', { params }),
    getSystemUsage: () => apiClient.get('/api/admin/stats/usercount'),
    exportData: (type: string, params?: any) =>
      apiClient.get(`/api/analytics/export/${type}`, { params, responseType: 'blob' }),
  },

  settings: {
    getAll: () => apiClient.get('/api/settings'),
    update: (data: any) => apiClient.put('/api/settings', data),
    getEmailConfig: () => apiClient.get('/api/settings/email'),
    updateEmailConfig: (data: any) => apiClient.put('/api/settings/email', data),
  },
};

export default apiClient;
