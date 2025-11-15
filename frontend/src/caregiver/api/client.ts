import axios, { type AxiosRequestHeaders } from 'axios';

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
      const headers: AxiosRequestHeaders = (config.headers ??
        {}) as AxiosRequestHeaders;
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface CaregiverSeniorUser {
  userId: string;
  username: string;
  role: string;
  profile?: {
    name?: string;
    age?: number;
    email?: string;
    contact?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CaregiverSeniorItem {
  seniorId: string;
  relation: string;
  senior: CaregiverSeniorUser;
}

export interface CaregiverSeniorsResponse {
  caregiverId: string;
  seniors: CaregiverSeniorItem[];
}

export interface EngagementTask {
  type?: string;
  points?: number;
  _id?: string;
}

export interface EngagementEntry {
  _id: string;
  userId: string;
  date: string;
  session?: 'morning' | 'afternoon' | 'evening';
  mood?: 'great' | 'okay' | 'not-well';
  checkIn?: boolean;
  tasksCompleted?: EngagementTask[];
  totalScore?: number;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeniorSummaryResponse {
  seniorId: string;
  today: string;
  totalPoints: number;
  todayEngagements: EngagementEntry[];
  lastActiveAt: string | null;
}

export interface SeniorRelationsResponse {
  seniorId: string;
  relations: Array<{
    relation: string;
    familyUser: CaregiverSeniorUser | null;
  }>;
}

export interface Activity {
  id: string;
  activityId: string;
  title: string;
  senior: string;
  seniorId: string;
  seniorInitials: string;
  date: string;
  time: string;
  type: 'video-call' | 'phone-call' | 'visit' | 'exercise' | 'hobby' | 'social';
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
}

export interface ReminderItem {
  id: string;
  reminderId: string;
  title: string;
  senior: string;
  seniorId: string;
  seniorInitials: string;
  time: string;
  type: 'call' | 'task' | 'medication';
  description?: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RemindersResponse {
  reminders: ReminderItem[];
}

export interface SeniorWithStats {
  seniorId: string;
  name: string;
  initials: string;
  engagement: number;
  totalPoints: number;
  checkInsCount: number;
  tasksCount: number;
}

export interface AnalyticsDataPoint {
  week?: string;
  month?: string;
  checkIns: number;
  calls: number;
  tasks: number;
}

export interface AnalyticsResponse {
  seniors: SeniorWithStats[];
  weeklyData: AnalyticsDataPoint[];
  monthlyData: AnalyticsDataPoint[];
}

export interface NotificationEvent {
  _id: string;
  eventType: string;
  payload: {
    type: string;
    userId?: string;
    seniorId?: string;
    seniorName?: string;
    userName?: string;
    mood?: string;
    timestamp?: string;
    message?: string;
    severity?: string;
    gameType?: string;
    gameName?: string;
    points?: number;
    session?: string;
    [key: string]: any;
  };
  receivedAt?: string;
  [key: string]: any;
}

export interface NotificationHistoryResponse {
  ok: boolean;
  items: NotificationEvent[];
}

const extractData = <T>(promise: Promise<{ data: T }>): Promise<T> =>
  promise.then((response) => response.data);

export const caregiverApi = {
  // Seniors
  getSeniors: (): Promise<CaregiverSeniorsResponse> =>
    extractData(apiClient.get('/caregiver/seniors')),

  getSeniorSummary: (seniorId: string): Promise<SeniorSummaryResponse> =>
    extractData(apiClient.get(`/caregiver/seniors/${seniorId}/summary`)),

  getSeniorRelations: (seniorId: string): Promise<SeniorRelationsResponse> =>
    extractData(apiClient.get(`/relations/${seniorId}`)),

  // Activities
  getActivities: (): Promise<ActivitiesResponse> =>
    extractData(apiClient.get('/caregiver/activities')),

  createActivity: (activity: {
    seniorId: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    type?: string;
  }): Promise<{ message: string; activity: Activity }> =>
    extractData(apiClient.post('/caregiver/activities', activity)),

  updateActivity: (
    activityId: string,
    updates: Partial<Activity>
  ): Promise<{ message: string; activity: Activity }> =>
    extractData(apiClient.put(`/caregiver/activities/${activityId}`, updates)),

  deleteActivity: (activityId: string): Promise<{ message: string }> =>
    extractData(apiClient.delete(`/caregiver/activities/${activityId}`)),

  // Reminders
  getReminders: (): Promise<RemindersResponse> =>
    extractData(apiClient.get('/caregiver/reminders')),

  createReminder: (reminder: {
    seniorId: string;
    title: string;
    description?: string;
    time: string;
    type: string;
    frequency?: string;
  }): Promise<{ message: string; reminder: ReminderItem }> =>
    extractData(apiClient.post('/caregiver/reminders', reminder)),

  updateReminder: (
    reminderId: string,
    updates: Partial<ReminderItem>
  ): Promise<{ message: string; reminder: ReminderItem }> =>
    extractData(apiClient.put(`/caregiver/reminders/${reminderId}`, updates)),

  deleteReminder: (reminderId: string): Promise<{ message: string }> =>
    extractData(apiClient.delete(`/caregiver/reminders/${reminderId}`)),

  // Analytics
  getAnalytics: (): Promise<AnalyticsResponse> =>
    extractData(apiClient.get('/caregiver/analytics')),

  // Notifications
  getNotifications: (limit: number = 50, page: number = 1): Promise<NotificationHistoryResponse> =>
    extractData(apiClient.get('/notification/dashboard/history', { params: { limit, page } })),
};

export default caregiverApi;

