// Shared types for the unified platform

// Senior app types
export interface Contact {
  id: string;
  name: string;
  initials: string;
  relationship: string;
  lastCall: string;
  phoneNumber: string;
  isFavorite?: boolean;
}

export type SeniorTab = "check-in" | "circle" | "activities";
export type Mood = "great" | "okay" | "not-well" | null;

export interface CheckIn {
  id: string;
  timestamp: string;
  mood: Mood;
  session: "morning" | "afternoon" | "evening";
}

export interface DailyProgress {
  date: string;
  checkIns: CheckIn[];
  totalCheckIns: number;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  category: "Exercise" | "Mental" | "Learning" | "Casual";
  completed?: boolean;
}

// Caregiver dashboard types
export type CaregiverTab = "dashboard" | "analytics" | "activities" | "reminders" | "settings";

// Admin portal types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'caregiver' | 'senior' | 'family';
  status: 'active' | 'inactive';
  createdAt?: string;
  lastActive?: string;
  phoneNumber?: string;
}

export interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
}

export interface ServiceHealth {
  id: string;
  name: string;
  displayName?: string;
  status: 'healthy' | 'warning' | 'error' | 'online';
  uptime: number;
  responseTime?: number;
  lastCheck?: string;
  lastChecked?: string;
  version?: string;
  endpoint?: string;
}

export interface SystemMetrics {
  timestamp?: string;
  cpu: number;
  memory: number;
  requests?: number;
  disk?: number;
  activeConnections?: number;
  requestsPerMinute?: number;
  averageResponseTime?: number;
  errorRate?: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCheckIns: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  users?: {
    totalSeniors: number;
    totalFamilies: number;
    totalAdmins: number;
    activeToday: number;
  };
  engagement?: {
    checkInsToday: number;
  };
  alerts?: {
    unresolved: number;
  };
}

export interface ActivityLog {
  id: string;
  type: string;
  user: string;
  userId?: string;
  userName?: string;
  action?: string;
  timestamp: string;
  description: string;
}

export interface UserEngagement {
  date?: string;
  checkIns?: number;
  activities?: number;
  socialConnections?: number;
  userId?: string;
  userName?: string;
  totalCheckIns?: number;
  currentStreak?: number;
  longestStreak?: number;
  engagementScore?: number;
  lastCheckIn?: string;
  missedCheckIns?: number;
  tasksCompleted?: number;
  socialInteractions?: number;
}
