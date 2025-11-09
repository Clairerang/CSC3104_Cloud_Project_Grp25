// ==================== USER TYPES ====================
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'senior' | 'family' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  lastActive?: string;
  phoneNumber?: string;
  avatar?: string;
  profileComplete?: boolean;
}

export interface UserStats {
  totalUsers: number;
  totalSeniors: number;
  totalFamilies: number;
  totalAdmins: number;
  activeToday: number;
  newThisWeek: number;
  newThisMonth: number;
}

// ==================== ENGAGEMENT TYPES ====================
export interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  status: 'completed' | 'missed';
  streakCount?: number;
}

export interface EngagementStats {
  totalCheckIns: number;
  checkInsToday: number;
  missedCheckIns: number;
  averageStreak: number;
  activeUsers: number;
  engagementRate: number;
}

export interface UserEngagement {
  userId: string;
  userName: string;
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  engagementScore: number;
  lastCheckIn: string;
  missedCheckIns: number;
  tasksCompleted: number;
  socialInteractions: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  type: 'checkin' | 'task' | 'social' | 'badge';
  timestamp: string;
  details?: any;
}

// ==================== GAMIFICATION TYPES ====================
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: string;
}

export interface UserBadge {
  badgeId: string;
  badge: Badge;
  earnedAt: string;
  progress?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  points: number;
  badgeCount: number;
  level: number;
}

export interface GamificationStats {
  totalPoints: number;
  totalBadges: number;
  activeChallenges: number;
  completedChallenges: number;
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'reminder' | 'achievement';
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
}

export interface Alert {
  id: string;
  seniorId: string;
  seniorName: string;
  familyId: string;
  type: 'missed_checkin' | 'low_engagement' | 'inactive' | 'system';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

// ==================== SYSTEM HEALTH TYPES ====================
export interface ServiceHealth {
  name: string;
  displayName: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  responseTime: number;
  lastChecked: string;
  endpoint: string;
  version?: string;
  error?: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  activeConnections: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

// ==================== ANALYTICS TYPES ====================
export interface DashboardStats {
  users: UserStats;
  engagement: EngagementStats;
  gamification: GamificationStats;
  alerts: {
    total: number;
    unresolved: number;
    highPriority: number;
  };
  systemHealth: {
    servicesOnline: number;
    servicesTotal: number;
    averageResponseTime: number;
  };
}

export interface EngagementTrend {
  date: string;
  checkIns: number;
  activeUsers: number;
  newUsers: number;
  missedCheckIns: number;
}

export interface UserGrowth {
  date: string;
  totalUsers: number;
  seniors: number;
  families: number;
  activeUsers: number;
}

// ==================== SETTINGS TYPES ====================
export interface SystemSettings {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  checkInReminderTime: string;
  alertThreshold: number;
  sessionTimeout: number;
}

export interface EmailConfig {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

// ==================== FORM TYPES ====================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserForm {
  email: string;
  name: string;
  password: string;
  role: 'senior' | 'family' | 'admin';
  phoneNumber?: string;
}

export interface UpdateUserForm {
  name?: string;
  email?: string;
  phoneNumber?: string;
  status?: 'active' | 'inactive';
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== CHART DATA TYPES ====================
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface TimeSeriesData {
  timestamp: string;
  [key: string]: string | number;
}