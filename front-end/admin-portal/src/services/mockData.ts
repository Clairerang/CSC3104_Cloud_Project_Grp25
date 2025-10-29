import { User, DashboardStats, ActivityLog, ServiceHealth, UserEngagement } from '../types';

// ==================== MOCK USERS ====================
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Margaret Chen',
    email: 'margaret.c@email.com',
    role: 'senior',
    status: 'active',
    createdAt: '2024-01-15',
    lastActive: new Date(Date.now() - 2 * 3600000).toISOString(),
    phoneNumber: '+65 9123 4567',
    avatar: 'MC',
  },
  {
    id: '2',
    name: 'Robert Tan',
    email: 'robert.t@email.com',
    role: 'senior',
    status: 'active',
    createdAt: '2024-02-20',
    lastActive: new Date(Date.now() - 5 * 3600000).toISOString(),
    phoneNumber: '+65 9234 5678',
    avatar: 'RT',
  },
  {
    id: '3',
    name: 'Sarah Lim',
    email: 'sarah.l@email.com',
    role: 'family',
    status: 'active',
    createdAt: '2024-01-10',
    lastActive: new Date(Date.now() - 1 * 3600000).toISOString(),
    phoneNumber: '+65 9345 6789',
    avatar: 'SL',
  },
  {
    id: '4',
    name: 'John Wong',
    email: 'john.w@email.com',
    role: 'senior',
    status: 'active',
    createdAt: '2024-03-05',
    lastActive: new Date(Date.now() - 24 * 3600000).toISOString(),
    phoneNumber: '+65 9456 7890',
    avatar: 'JW',
  },
  {
    id: '5',
    name: 'Linda Ng',
    email: 'linda.n@email.com',
    role: 'family',
    status: 'active',
    createdAt: '2024-02-14',
    lastActive: new Date(Date.now() - 3 * 3600000).toISOString(),
    phoneNumber: '+65 9567 8901',
    avatar: 'LN',
  },
  {
    id: '6',
    name: 'David Lee',
    email: 'david.l@email.com',
    role: 'senior',
    status: 'active',
    createdAt: '2024-01-20',
    lastActive: new Date(Date.now() - 6 * 3600000).toISOString(),
    phoneNumber: '+65 9678 9012',
    avatar: 'DL',
  },
  {
    id: '7',
    name: 'Emily Koh',
    email: 'emily.k@email.com',
    role: 'family',
    status: 'active',
    createdAt: '2024-03-01',
    lastActive: new Date(Date.now() - 0.5 * 3600000).toISOString(),
    phoneNumber: '+65 9789 0123',
    avatar: 'EK',
  },
  {
    id: '8',
    name: 'Admin User',
    email: 'admin@seniorconnect.com',
    role: 'admin',
    status: 'active',
    createdAt: '2023-12-01',
    lastActive: new Date().toISOString(),
    phoneNumber: '+65 9890 1234',
    avatar: 'AU',
  },
];

// ==================== MOCK DASHBOARD STATS ====================
export const mockDashboardStats: DashboardStats = {
  users: {
    totalUsers: 485,
    totalSeniors: 195,
    totalFamilies: 280,
    totalAdmins: 10,
    activeToday: 142,
    newThisWeek: 18,
    newThisMonth: 67,
  },
  engagement: {
    totalCheckIns: 3847,
    checkInsToday: 152,
    missedCheckIns: 8,
    averageStreak: 12.5,
    activeUsers: 178,
    engagementRate: 87.3,
  },
  gamification: {
    totalPoints: 45820,
    totalBadges: 342,
    activeChallenges: 23,
    completedChallenges: 156,
  },
  alerts: {
    total: 12,
    unresolved: 5,
    highPriority: 2,
  },
  systemHealth: {
    servicesOnline: 4,
    servicesTotal: 4,
    averageResponseTime: 48,
  },
};

// ==================== MOCK ACTIVITY LOG ====================
export const mockActivityLog: ActivityLog[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Margaret Chen',
    action: 'Completed daily check-in',
    type: 'checkin',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Robert Tan',
    action: 'Earned "7-Day Streak" badge',
    type: 'badge',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Sarah Lim',
    action: 'Completed memory quiz',
    type: 'task',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'John Wong',
    action: 'Made voice call to family',
    type: 'social',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Linda Ng',
    action: 'Completed daily check-in',
    type: 'checkin',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: '6',
    userId: 'user6',
    userName: 'David Lee',
    action: 'Completed stretching exercise',
    type: 'task',
    timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
  },
  {
    id: '7',
    userId: 'user7',
    userName: 'Emily Koh',
    action: 'Shared recipe with community',
    type: 'social',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
  },
];

// ==================== MOCK SERVICE HEALTH ====================
export const mockServiceHealth: ServiceHealth[] = [
  {
    name: 'user-service',
    displayName: 'User Service',
    status: 'online',
    uptime: 99.8,
    responseTime: 45,
    lastChecked: new Date().toISOString(),
    endpoint: 'http://localhost:3001',
    version: 'v1.2.0',
  },
  {
    name: 'engagement-service',
    displayName: 'Engagement Service',
    status: 'online',
    uptime: 99.5,
    responseTime: 52,
    lastChecked: new Date().toISOString(),
    endpoint: 'http://localhost:3002',
    version: 'v1.1.3',
  },
  {
    name: 'gamification-service',
    displayName: 'Gamification Service',
    status: 'online',
    uptime: 99.9,
    responseTime: 38,
    lastChecked: new Date().toISOString(),
    endpoint: 'http://localhost:3003',
    version: 'v1.0.5',
  },
  {
    name: 'notification-service',
    displayName: 'Notification Service',
    status: 'online',
    uptime: 98.7,
    responseTime: 65,
    lastChecked: new Date().toISOString(),
    endpoint: 'http://localhost:3004',
    version: 'v1.1.0',
  },
];

// ==================== MOCK USER ENGAGEMENT ====================
export const mockUserEngagement: UserEngagement = {
  userId: '1',
  userName: 'Margaret Chen',
  totalCheckIns: 45,
  currentStreak: 7,
  longestStreak: 15,
  engagementScore: 85,
  lastCheckIn: new Date().toISOString(),
  missedCheckIns: 3,
  tasksCompleted: 32,
  socialInteractions: 18,
};

// Helper function to simulate API delay
export const simulateDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};