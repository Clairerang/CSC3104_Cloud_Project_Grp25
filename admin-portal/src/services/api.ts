import axios, { AxiosInstance } from 'axios';
import {
  mockUsers,
  mockDashboardStats,
  mockActivityLog,
  mockServiceHealth,
  mockUserEngagement,
  simulateDelay,
} from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_GATEWAY || 'http://localhost:4000';
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API helper
const mockApiCall = async <T,>(data: T): Promise<{ data: T }> => {
  await simulateDelay();
  return { data };
};

// API Methods
export const api = {
  // ==================== AUTH ====================
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      if (USE_MOCK_DATA) {
        await simulateDelay();
        return {
          data: {
            token: 'mock-token-' + Date.now(),
            user: {
              id: 'admin-1',
              name: 'Admin User',
              email: credentials.email,
              role: 'admin',
            },
          },
        };
      }
      return apiClient.post('/api/v1/auth/login', credentials);
    },
    logout: () => apiClient.post('/api/v1/auth/logout'),
    verifyToken: () => apiClient.get('/api/v1/auth/verify'),
  },

  // ==================== USERS ====================
  users: {
    getAll: async (params?: any) => {
      if (USE_MOCK_DATA) {
        return mockApiCall(mockUsers);
      }
      return apiClient.get('/api/v1/users', { params });
    },
    getById: async (id: string) => {
      if (USE_MOCK_DATA) {
        const user = mockUsers.find((u) => u.id === id) || mockUsers[0];
        return mockApiCall(user);
      }
      return apiClient.get(`/api/v1/users/${id}`);
    },
    create: (data: any) => apiClient.post('/api/v1/users', data),
    update: async (id: string, data: any) => {
      if (USE_MOCK_DATA) {
        return mockApiCall({ success: true, message: 'User updated' });
      }
      return apiClient.put(`/api/v1/users/${id}`, data);
    },
    delete: (id: string) => apiClient.delete(`/api/v1/users/${id}`),
    updateStatus: (id: string, status: 'active' | 'inactive') =>
      apiClient.patch(`/api/v1/users/${id}/status`, { status }),
    resetPassword: (id: string) => apiClient.post(`/api/v1/users/${id}/reset-password`),
    getStats: () => apiClient.get('/api/v1/users/stats'),
  },

  // ==================== ENGAGEMENT ====================
  engagement: {
    getStats: async () => {
      if (USE_MOCK_DATA) {
        return mockApiCall(mockDashboardStats.engagement);
      }
      return apiClient.get('/api/v1/engagement/stats');
    },
    getByUser: async (userId: string, params?: any) => {
      if (USE_MOCK_DATA) {
        return mockApiCall(mockUserEngagement);
      }
      return apiClient.get(`/api/v1/engagement/user/${userId}`, { params });
    },
    getCheckIns: (params?: any) =>
      apiClient.get('/api/v1/engagement/checkins', { params }),
    getRecentActivity: async (limit: number = 10) => {
      if (USE_MOCK_DATA) {
        return mockApiCall(mockActivityLog.slice(0, limit));
      }
      return apiClient.get('/api/v1/engagement/recent', { params: { limit } });
    },
    getTrends: (period: 'day' | 'week' | 'month') =>
      apiClient.get('/api/v1/engagement/trends', { params: { period } }),
  },

  // ==================== GAMIFICATION ====================
  gamification: {
    getLeaderboard: (limit: number = 10) =>
      apiClient.get('/api/v1/gamification/leaderboard', { params: { limit } }),
    getUserBadges: (userId: string) =>
      apiClient.get(`/api/v1/gamification/users/${userId}/badges`),
    getStats: async () => {
      if (USE_MOCK_DATA) {
        return mockApiCall(mockDashboardStats.gamification);
      }
      return apiClient.get('/api/v1/gamification/stats');
    },
    createChallenge: (data: any) =>
      apiClient.post('/api/v1/gamification/challenges', data),
    getChallenges: () => apiClient.get('/api/v1/gamification/challenges'),
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    getAll: (params?: any) => apiClient.get('/api/v1/notifications', { params }),
    getById: (id: string) => apiClient.get(`/api/v1/notifications/${id}`),
    markAsRead: (id: string) =>
      apiClient.patch(`/api/v1/notifications/${id}/read`),
    getAlerts: () => apiClient.get('/api/v1/notifications/alerts'),
    sendBulk: (data: any) => apiClient.post('/api/v1/notifications/bulk', data),
  },

  // ==================== SYSTEM HEALTH ====================
  system: {
    getHealth: () => apiClient.get('/health'),
    getServiceHealth: (service: string) => apiClient.get(`/health/${service}`),
    getAllServices: async () => {
      if (USE_MOCK_DATA) {
        return mockApiCall(mockServiceHealth);
      }
      return apiClient.get('/health/services');
    },
    getLogs: (params?: any) =>
      apiClient.get('/api/v1/system/logs', { params }),
    getMetrics: async () => {
      if (USE_MOCK_DATA) {
        return mockApiCall({
          cpu: 35 + Math.random() * 10,
          memory: 60 + Math.random() * 10,
          disk: 48,
          activeConnections: 145,
          requestsPerMinute: 850,
          averageResponseTime: 48,
          errorRate: 0.02,
        });
      }
      return apiClient.get('/api/v1/system/metrics');
    },
  },

  // ==================== ANALYTICS ====================
  analytics: {
    getDashboard: async () => {
      if (USE_MOCK_DATA) {
        return mockApiCall(mockDashboardStats);
      }
      return apiClient.get('/api/v1/analytics/dashboard');
    },
    getUserEngagement: (params?: any) =>
      apiClient.get('/api/v1/analytics/user-engagement', { params }),
    getSystemUsage: () => apiClient.get('/api/v1/analytics/system-usage'),
    exportData: (type: string, params?: any) =>
      apiClient.get(`/api/v1/analytics/export/${type}`, {
        params,
        responseType: 'blob',
      }),
  },

  // ==================== SETTINGS ====================
  settings: {
    getAll: () => apiClient.get('/api/v1/settings'),
    update: async (data: any) => {
      if (USE_MOCK_DATA) {
        return mockApiCall({ success: true, message: 'Settings updated' });
      }
      return apiClient.put('/api/v1/settings', data);
    },
    getEmailConfig: () => apiClient.get('/api/v1/settings/email'),
    updateEmailConfig: async (data: any) => {
      if (USE_MOCK_DATA) {
        return mockApiCall({ success: true, message: 'Email config updated' });
      }
      return apiClient.put('/api/v1/settings/email', data);
    },
  },
};

export default apiClient;