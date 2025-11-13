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

const extractData = <T>(promise: Promise<{ data: T }>): Promise<T> =>
  promise.then((response) => response.data);

export const caregiverApi = {
  getSeniors: (): Promise<CaregiverSeniorsResponse> =>
    extractData(apiClient.get('/caregiver/seniors')),

  getSeniorSummary: (seniorId: string): Promise<SeniorSummaryResponse> =>
    extractData(apiClient.get(`/caregiver/seniors/${seniorId}/summary`)),

  getSeniorRelations: (seniorId: string): Promise<SeniorRelationsResponse> =>
    extractData(apiClient.get(`/relations/${seniorId}`)),
};

export default caregiverApi;

