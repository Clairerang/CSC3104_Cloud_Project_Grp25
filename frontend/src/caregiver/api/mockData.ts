// Mock Data API for Senior Care Dashboard
export interface Senior {
  id: string;
  name: string;
  initials: string;
  status: 'Active' | 'Missed Check-In' | 'Inactive';
  lastCheckIn: string;
  isOnline: boolean;
  engagement: number;
}

export interface Alert {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Reminder {
  id: string;
  message: string;
  type: 'call' | 'task';
}

export interface Activity {
  id: string | number;
  title: string;
  senior: string;
  seniorInitials: string;
  date: string;
  time: string;
  type: 'video-call' | 'phone-call' | 'visit' | 'exercise' | 'hobby' | 'social';
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
}

export interface ReminderItem {
  id: string | number;
  title: string;
  senior: string;
  seniorInitials: string;
  time: string;
  type: 'call' | 'task' | 'medication';
  description?: string;
  isActive: boolean;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
}

export interface AnalyticsData {
  weeklyData: Array<{
    week: string;
    checkIns: number;
    calls: number;
    tasks: number;
  }>;
  monthlyData: Array<{
    month: string;
    checkIns: number;
    calls: number;
    tasks: number;
  }>;
  seniorDataMap: Record<string, {
    name: string;
    initials: string;
    weeklyData: Array<{
      week: string;
      checkIns: number;
      calls: number;
      tasks: number;
    }>;
    monthlyData: Array<{
      month: string;
      checkIns: number;
      calls: number;
      tasks: number;
    }>;
    stats: {
      checkIns: number;
      calls: number;
      tasks: number;
      engagement: number;
    };
    activityBreakdown: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    communicationPreference?: string;
  }>;
}

export interface RecentActivity {
  id: string;
  seniorId: string;
  iconType: 'schedule' | 'phone' | 'medication';
  text: string;
  timestamp: string;
}

export interface SeniorDetails {
  seniorId: string;
  healthStatus: string;
  medications: string;
  medicationCount: number;
}

export interface Profile {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  address: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  missedCheckIn: boolean;
}

export interface OverallAnalyticsStats {
  checkIns: number;
  calls: number;
  tasks: number;
  checkInsChange: string;
  callsChange: string;
  tasksChange: string;
}

// Mock Data (Reflecting actual database users)
export const mockSeniors: Senior[] = [
  {
    id: '1',
    name: 'Mary Smith',
    initials: 'MS',
    status: 'Active',
    lastCheckIn: '2 hours ago',
    isOnline: true,
    engagement: 95,
  },
  {
    id: '2',
    name: 'Joe Tan',
    initials: 'JT',
    status: 'Active',
    lastCheckIn: '1 hour ago',
    isOnline: true,
    engagement: 85,
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    message: '✅ Mary Smith checked in feeling great this morning.',
    severity: 'low',
  },
  {
    id: '2',
    message: '✅ Joe Tan logged in successfully at 9:45 AM.',
    severity: 'low',
  },
  {
    id: '3',
    message: '💊 Medication reminder scheduled for Mary Smith at 3 PM.',
    severity: 'medium',
  },
];

export const mockReminders: Reminder[] = [
  {
    id: '1',
    message: 'Call Mary Smith – daily wellness check.',
    type: 'call',
  },
  {
    id: '2',
    message: 'Remind Joe Tan about afternoon medication.',
    type: 'task',
  },
];

export const mockActivities: Activity[] = [
  {
    id: 1,
    title: 'Weekly Video Call',
    senior: 'Mary Smith',
    seniorInitials: 'MS',
    date: '2025-01-24',
    time: '14:00',
    type: 'video-call',
    description: 'Regular catch-up video call with daughter',
    status: 'pending',
  },
  {
    id: 2,
    title: 'Morning Exercise',
    senior: 'Joe Tan',
    seniorInitials: 'JT',
    date: '2025-01-23',
    time: '08:00',
    type: 'exercise',
    description: 'Daily morning stretching routine',
    status: 'accepted',
  },
  {
    id: 3,
    title: 'Check-in Call',
    senior: 'Mary Smith',
    seniorInitials: 'MS',
    date: '2025-01-22',
    time: '16:00',
    type: 'phone-call',
    description: 'Daily afternoon wellness check',
    status: 'completed',
  },
  {
    id: 4,
    title: 'Family Visit',
    senior: 'Joe Tan',
    seniorInitials: 'JT',
    date: '2025-01-21',
    time: '18:00',
    type: 'visit',
    description: 'Weekly family visit with son',
    status: 'completed',
  },
];

export const mockReminderItems: ReminderItem[] = [
  {
    id: 1,
    title: 'Call Mary Smith',
    senior: 'Mary Smith',
    seniorInitials: 'MS',
    time: '15:00',
    type: 'call',
    description: 'Daily wellness check-in call',
    isActive: true,
    frequency: 'daily',
  },
  {
    id: 2,
    title: 'Medication check for Joe Tan',
    senior: 'Joe Tan',
    seniorInitials: 'JT',
    time: '09:00',
    type: 'medication',
    description: 'Morning medication reminder',
    isActive: true,
    frequency: 'daily',
  },
  {
    id: 3,
    title: 'Weekly video call with Mary Smith',
    senior: 'Mary Smith',
    seniorInitials: 'MS',
    time: '18:00',
    type: 'call',
    description: 'Weekly family video call with daughter Anna',
    isActive: true,
    frequency: 'weekly',
  },
];

export const mockAnalyticsData: AnalyticsData = {
  weeklyData: [
    { week: 'Week 1', checkIns: 24, calls: 15, tasks: 32 },
    { week: 'Week 2', checkIns: 28, calls: 18, tasks: 35 },
    { week: 'Week 3', checkIns: 22, calls: 12, tasks: 28 },
    { week: 'Week 4', checkIns: 30, calls: 20, tasks: 38 },
  ],
  monthlyData: [
    { month: 'Jan', checkIns: 95, calls: 65, tasks: 125 },
    { month: 'Feb', checkIns: 102, calls: 70, tasks: 133 },
    { month: 'Mar', checkIns: 88, calls: 58, tasks: 115 },
    { month: 'Apr', checkIns: 110, calls: 75, tasks: 142 },
  ],
  seniorDataMap: {
    'mary-smith': {
      name: 'Mary Smith',
      initials: 'MS',
      weeklyData: [
        { week: 'Week 1', checkIns: 7, calls: 5, tasks: 10 },
        { week: 'Week 2', checkIns: 7, calls: 6, tasks: 11 },
        { week: 'Week 3', checkIns: 6, calls: 4, tasks: 9 },
        { week: 'Week 4', checkIns: 7, calls: 6, tasks: 12 },
      ],
      monthlyData: [
        { month: 'Jan', checkIns: 28, calls: 20, tasks: 42 },
        { month: 'Feb', checkIns: 30, calls: 22, tasks: 45 },
        { month: 'Mar', checkIns: 27, calls: 19, tasks: 40 },
        { month: 'Apr', checkIns: 30, calls: 23, tasks: 47 },
      ],
      stats: { checkIns: 85, calls: 62, tasks: 128, engagement: 95 },
      activityBreakdown: [
        { name: 'Morning', value: 35, color: '#2563EB' },
        { name: 'Afternoon', value: 45, color: '#22C55E' },
        { name: 'Evening', value: 20, color: '#FACC15' },
      ],
      communicationPreference: 'Video calls preferred',
    },
    'grandpa-joe': {
      name: 'Grandpa Joe',
      initials: 'GJ',
      weeklyData: [
        { week: 'Week 1', checkIns: 5, calls: 3, tasks: 7 },
        { week: 'Week 2', checkIns: 6, calls: 4, tasks: 8 },
        { week: 'Week 3', checkIns: 4, calls: 2, tasks: 6 },
        { week: 'Week 4', checkIns: 6, calls: 4, tasks: 9 },
      ],
      monthlyData: [
        { month: 'Jan', checkIns: 20, calls: 12, tasks: 28 },
        { month: 'Feb', checkIns: 22, calls: 14, tasks: 30 },
        { month: 'Mar', checkIns: 18, calls: 10, tasks: 25 },
        { month: 'Apr', checkIns: 23, calls: 15, tasks: 32 },
      ],
      stats: { checkIns: 62, calls: 38, tasks: 85, engagement: 45 },
      activityBreakdown: [
        { name: 'Morning', value: 50, color: '#2563EB' },
        { name: 'Afternoon', value: 30, color: '#22C55E' },
        { name: 'Evening', value: 20, color: '#FACC15' },
      ],
      communicationPreference: 'Phone calls preferred',
    },
    'aunt-margaret': {
      name: 'Aunt Margaret',
      initials: 'AM',
      weeklyData: [
        { week: 'Week 1', checkIns: 6, calls: 4, tasks: 8 },
        { week: 'Week 2', checkIns: 7, calls: 5, tasks: 9 },
        { week: 'Week 3', checkIns: 6, calls: 3, tasks: 7 },
        { week: 'Week 4', checkIns: 7, calls: 5, tasks: 10 },
      ],
      monthlyData: [
        { month: 'Jan', checkIns: 25, calls: 16, tasks: 32 },
        { month: 'Feb', checkIns: 27, calls: 18, tasks: 35 },
        { month: 'Mar', checkIns: 23, calls: 15, tasks: 30 },
        { month: 'Apr', checkIns: 28, calls: 19, tasks: 37 },
      ],
      stats: { checkIns: 75, calls: 52, tasks: 98, engagement: 88 },
      activityBreakdown: [
        { name: 'Morning', value: 25, color: '#2563EB' },
        { name: 'Afternoon', value: 50, color: '#22C55E' },
        { name: 'Evening', value: 25, color: '#FACC15' },
      ],
      communicationPreference: 'Mixed communication',
    },
    'uncle-frank': {
      name: 'Uncle Frank',
      initials: 'UF',
      weeklyData: [
        { week: 'Week 1', checkIns: 6, calls: 3, tasks: 7 },
        { week: 'Week 2', checkIns: 8, calls: 3, tasks: 7 },
        { week: 'Week 3', checkIns: 6, calls: 3, tasks: 6 },
        { week: 'Week 4', checkIns: 10, calls: 5, tasks: 7 },
      ],
      monthlyData: [
        { month: 'Jan', checkIns: 22, calls: 17, tasks: 23 },
        { month: 'Feb', checkIns: 23, calls: 16, tasks: 23 },
        { month: 'Mar', checkIns: 20, calls: 14, tasks: 20 },
        { month: 'Apr', checkIns: 29, calls: 18, tasks: 26 },
      ],
      stats: { checkIns: 42, calls: 26, tasks: 31, engagement: 20 },
      activityBreakdown: [
        { name: 'Morning', value: 40, color: '#2563EB' },
        { name: 'Afternoon', value: 35, color: '#22C55E' },
        { name: 'Evening', value: 25, color: '#FACC15' },
      ],
      communicationPreference: 'Limited communication',
    },
  },
};

export const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    seniorId: '1',
    iconType: 'schedule',
    text: 'Checked in via app - 2 hours ago',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    seniorId: '1',
    iconType: 'phone',
    text: 'Phone call with family - Yesterday',
    timestamp: 'Yesterday',
  },
  {
    id: '3',
    seniorId: '1',
    iconType: 'medication',
    text: 'Took morning medication - Today',
    timestamp: 'Today',
  },
  {
    id: '4',
    seniorId: '2',
    iconType: 'schedule',
    text: 'Missed check-in - 1 day ago',
    timestamp: '1 day ago',
  },
  {
    id: '5',
    seniorId: '2',
    iconType: 'phone',
    text: 'Phone call with caregiver - 2 days ago',
    timestamp: '2 days ago',
  },
  {
    id: '6',
    seniorId: '3',
    iconType: 'schedule',
    text: 'Checked in via app - 30 mins ago',
    timestamp: '30 mins ago',
  },
  {
    id: '7',
    seniorId: '3',
    iconType: 'medication',
    text: 'Took afternoon medication - Today',
    timestamp: 'Today',
  },
  {
    id: '8',
    seniorId: '4',
    iconType: 'schedule',
    text: 'Last check-in - 3 days ago',
    timestamp: '3 days ago',
  },
];

export const mockSeniorDetails: Record<string, SeniorDetails> = {
  '1': {
    seniorId: '1',
    healthStatus: 'Good - No concerns',
    medications: '3 daily medications',
    medicationCount: 3,
  },
  '2': {
    seniorId: '2',
    healthStatus: 'Fair - Monitor closely',
    medications: '2 daily medications',
    medicationCount: 2,
  },
  '3': {
    seniorId: '3',
    healthStatus: 'Good - No concerns',
    medications: '4 daily medications',
    medicationCount: 4,
  },
  '4': {
    seniorId: '4',
    healthStatus: 'Needs attention - Follow up required',
    medications: '1 daily medication',
    medicationCount: 1,
  },
};

export const mockProfile: Profile = {
  fullName: 'Sarah Johnson',
  email: 'sarah.j@email.com',
  phone: '+1 (555) 123-4567',
  username: 'sarahjohnson',
  address: '123 Main Street, City, State 12345',
};

export const mockNotificationSettings: NotificationSettings = {
  email: true,
  push: true,
  missedCheckIn: true,
};

export const mockOverallAnalyticsStats: OverallAnalyticsStats = {
  checkIns: 264,
  calls: 178,
  tasks: 342,
  checkInsChange: '+12% from last month',
  callsChange: '+8% from last month',
  tasksChange: '+15% from last month',
};

// API Functions (Mock)
export const mockApi = {
  // Seniors
  getSeniors: (): Promise<Senior[]> => {
    return Promise.resolve(mockSeniors);
  },

  // Alerts
  getAlerts: (): Promise<Alert[]> => {
    return Promise.resolve(mockAlerts);
  },

  dismissAlert: (id: string): Promise<void> => {
    const index = mockAlerts.findIndex(alert => alert.id === id);
    if (index > -1) {
      mockAlerts.splice(index, 1);
    }
    return Promise.resolve();
  },

  // Reminders (Dashboard)
  getReminders: (): Promise<Reminder[]> => {
    return Promise.resolve(mockReminders);
  },

  // Activities
  getActivities: (): Promise<Activity[]> => {
    return Promise.resolve(mockActivities);
  },

  addActivity: (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now(),
    };
    mockActivities.push(newActivity);
    return Promise.resolve(newActivity);
  },

  updateActivity: (id: number, updates: Partial<Activity>): Promise<Activity> => {
    const index = mockActivities.findIndex(activity => activity.id === id);
    if (index > -1) {
      mockActivities[index] = { ...mockActivities[index], ...updates };
      return Promise.resolve(mockActivities[index]);
    }
    throw new Error('Activity not found');
  },

  deleteActivity: (id: number): Promise<void> => {
    const index = mockActivities.findIndex(activity => activity.id === id);
    if (index > -1) {
      mockActivities.splice(index, 1);
    }
    return Promise.resolve();
  },

  // Reminder Items
  getReminderItems: (): Promise<ReminderItem[]> => {
    return Promise.resolve(mockReminderItems);
  },

  addReminderItem: (reminder: Omit<ReminderItem, 'id'>): Promise<ReminderItem> => {
    // Generate a unique ID using timestamp + random number to avoid duplicates
    const newId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const newReminder: ReminderItem = {
      ...reminder,
      id: newId,
    };
    mockReminderItems.push(newReminder);
    return Promise.resolve(newReminder);
  },

  updateReminderItem: (id: number, updates: Partial<ReminderItem>): Promise<ReminderItem> => {
    const index = mockReminderItems.findIndex(reminder => reminder.id === id);
    if (index > -1) {
      mockReminderItems[index] = { ...mockReminderItems[index], ...updates };
      return Promise.resolve(mockReminderItems[index]);
    }
    throw new Error('Reminder not found');
  },

  deleteReminderItem: (id: number): Promise<void> => {
    const index = mockReminderItems.findIndex(reminder => reminder.id === id);
    if (index > -1) {
      mockReminderItems.splice(index, 1);
    }
    return Promise.resolve();
  },

  // Analytics
  getAnalyticsData: (): Promise<AnalyticsData> => {
    return Promise.resolve(mockAnalyticsData);
  },

  getOverallAnalyticsStats: (): Promise<OverallAnalyticsStats> => {
    return Promise.resolve(mockOverallAnalyticsStats);
  },

  // Profile
  getProfile: (): Promise<Profile> => {
    return Promise.resolve(mockProfile);
  },

  updateProfile: (updates: Partial<Profile>): Promise<Profile> => {
    Object.assign(mockProfile, updates);
    return Promise.resolve(mockProfile);
  },

  // Notification Settings
  getNotificationSettings: (): Promise<NotificationSettings> => {
    return Promise.resolve(mockNotificationSettings);
  },

  updateNotificationSettings: (updates: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    Object.assign(mockNotificationSettings, updates);
    return Promise.resolve(mockNotificationSettings);
  },
};

// Utility functions
export const getSeniorById = (id: string): Senior | undefined => {
  return mockSeniors.find(senior => senior.id === id);
};

export const getSeniorByName = (name: string): Senior | undefined => {
  return mockSeniors.find(senior => senior.name === name);
};

export const getSeniorsList = () => {
  return mockSeniors.map(senior => ({
    name: senior.name,
    initials: senior.initials,
  }));
};

export const getRecentActivitiesBySeniorId = (seniorId: string): RecentActivity[] => {
  return mockRecentActivities.filter(activity => activity.seniorId === seniorId);
};

export const getSeniorDetails = (seniorId: string): SeniorDetails | undefined => {
  return mockSeniorDetails[seniorId];
};

export const getSeniorIdFromName = (name: string): string | undefined => {
  const senior = mockSeniors.find(s => s.name === name);
  return senior?.id;
};

export const getSeniorNameToIdMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  mockSeniors.forEach(senior => {
    // Convert name to kebab-case for consistency with analytics data
    const key = senior.name.toLowerCase().replace(/\s+/g, '-');
    map[key] = senior.id;
    // Also add direct name mapping
    map[senior.name] = senior.id;
  });
  return map;
};
