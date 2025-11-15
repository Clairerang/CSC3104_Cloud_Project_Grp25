import axios from 'axios';

const DEFAULT_BASE_URL = '/api';

const baseURL =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_URL ||
  DEFAULT_BASE_URL;

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface ScheduledActivity {
  id: string;
  activityId: string;
  title: string;
  caregiver: string;
  caregiverId: string;
  date: string;
  time: string;
  type: 'video-call' | 'phone-call' | 'visit' | 'exercise' | 'hobby' | 'social';
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivitiesResponse {
  activities: ScheduledActivity[];
}

export interface CaregiverContact {
  caregiverId: string;
  relation: string;
  role: string;
  name: string;
  email?: string;
  contact?: string;
}

export interface CaregiversResponse {
  seniorId: string;
  caregivers: CaregiverContact[];
}

export const seniorApi = {
  // Get all scheduled activities for the senior
  async getActivities(): Promise<ScheduledActivity[]> {
    const response = await apiClient.get<ActivitiesResponse>('/senior/activities');
    return response.data.activities;
  },

  // Update activity status (accept/reject)
  async updateActivityStatus(activityId: string, status: 'accepted' | 'rejected'): Promise<void> {
    await apiClient.patch(`/senior/activities/${activityId}/status`, { status });
  },

  // Get all caregivers/family linked to the senior
  async getCaregivers(): Promise<CaregiverContact[]> {
    const response = await apiClient.get<CaregiversResponse>('/senior/caregivers');
    return response.data.caregivers;
  },

  // Get notifications for the senior user
  async getNotifications(limit: number = 20): Promise<{ items: any[] }> {
    try {
      const response = await apiClient.get(`/engagements/recent`, {
        params: { limit }
      });
      return { items: response.data };
    } catch (error) {
      console.error('[Senior API] Error fetching notifications:', error);
      return { items: [] };
    }
  },
};

export default seniorApi;
