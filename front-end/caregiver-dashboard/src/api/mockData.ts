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
  id: number;
  title: string;
  senior: string;
  seniorInitials: string;
  date: string;
  time: string;
  type: 'video-call' | 'phone-call' | 'visit' | 'exercise' | 'hobby' | 'social';
  description: string;
  status: 'upcoming' | 'completed' | 'missed';
}

export interface ReminderItem {
  id: number;
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
  }>;
}

// Mock Data
export const mockSeniors: Senior[] = [
  {
    id: '1',
    name: 'Grandma Rose',
    initials: 'GR',
    status: 'Active',
    lastCheckIn: '2 hours ago',
    isOnline: true,
    engagement: 95,
  },
  {
    id: '2',
    name: 'Grandpa Joe',
    initials: 'GJ',
    status: 'Missed Check-In',
    lastCheckIn: '1 day ago',
    isOnline: false,
    engagement: 45,
  },
  {
    id: '3',
    name: 'Aunt Margaret',
    initials: 'AM',
    status: 'Active',
    lastCheckIn: '30 mins ago',
    isOnline: true,
    engagement: 88,
  },
  {
    id: '4',
    name: 'Uncle Frank',
    initials: 'UF',
    status: 'Inactive',
    lastCheckIn: '3 days ago',
    isOnline: false,
    engagement: 20,
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    message: '⚠ Grandpa Joe missed check-in today. Last seen online 1 day ago.',
    severity: 'high',
  },
  {
    id: '2',
    message: '🚨 Uncle Frank has been inactive for 3 days - no online activity detected.',
    severity: 'high',
  },
  {
    id: '3',
    message: '💊 Automated medication alert sent to Grandma Rose for 3 PM dose.',
    severity: 'medium',
  },
  {
    id: '4',
    message: "⏰ Grandpa Joe hasn't responded to medication reminder (2 PM).",
    severity: 'high',
  },
  {
    id: '5',
    message: 'Weekly wellness check scheduled for tomorrow.',
    severity: 'low',
  },
];

export const mockReminders: Reminder[] = [
  {
    id: '1',
    message: 'Call Grandma Rose – no social call in 3 days.',
    type: 'call',
  },
  {
    id: '2',
    message: 'Check in with Uncle Frank – missed last appointment.',
    type: 'task',
  },
  {
    id: '3',
    message: 'Schedule video call with Aunt Margaret this weekend.',
    type: 'call',
  },
];

export const mockActivities: Activity[] = [
  {
    id: 1,
    title: 'Weekly Video Call',
    senior: 'Grandma Rose',
    seniorInitials: 'GR',
    date: '2025-01-24',
    time: '14:00',
    type: 'video-call',
    description: 'Regular catch-up video call to discuss the week',
    status: 'upcoming',
  },
  {
    id: 2,
    title: 'Morning Walk',
    senior: 'Aunt Margaret',
    seniorInitials: 'AM',
    date: '2025-01-23',
    time: '08:00',
    type: 'exercise',
    description: 'Daily morning walk in the park',
    status: 'upcoming',
  },
  {
    id: 3,
    title: 'Gardening Session',
    senior: 'Grandma Rose',
    seniorInitials: 'GR',
    date: '2025-01-25',
    time: '10:00',
    type: 'hobby',
    description: 'Help with garden maintenance',
    status: 'upcoming',
  },
  {
    id: 4,
    title: 'Check-in Call',
    senior: 'Grandpa Joe',
    seniorInitials: 'GJ',
    date: '2025-01-22',
    time: '16:00',
    type: 'phone-call',
    description: 'Daily afternoon check-in',
    status: 'completed',
  },
  {
    id: 5,
    title: 'Family Dinner',
    senior: 'Uncle Frank',
    seniorInitials: 'UF',
    date: '2025-01-21',
    time: '18:00',
    type: 'visit',
    description: 'Weekly family dinner at home',
    status: 'completed',
  },
  {
    id: 6,
    title: 'Book Club Meeting',
    senior: 'Aunt Margaret',
    seniorInitials: 'AM',
    date: '2025-01-20',
    time: '15:00',
    type: 'social',
    description: 'Monthly book club discussion',
    status: 'completed',
  },
];

export const mockReminderItems: ReminderItem[] = [
  {
    id: 1,
    title: 'Call Grandma Rose',
    senior: 'Grandma Rose',
    seniorInitials: 'GR',
    time: '15:00',
    type: 'call',
    description: 'Daily check-in call',
    isActive: true,
    frequency: 'daily',
  },
  {
    id: 2,
    title: 'Medication check for Grandpa Joe',
    senior: 'Grandpa Joe',
    seniorInitials: 'GJ',
    time: '09:00',
    type: 'medication',
    description: 'Morning medication reminder',
    isActive: true,
    frequency: 'daily',
  },
  {
    id: 3,
    title: 'Weekly video call with Aunt Margaret',
    senior: 'Aunt Margaret',
    seniorInitials: 'AM',
    time: '18:00',
    type: 'call',
    description: 'Weekly family video call',
    isActive: true,
    frequency: 'weekly',
  },
  {
    id: 4,
    title: 'Exercise reminder for Uncle Frank',
    senior: 'Uncle Frank',
    seniorInitials: 'UF',
    time: '10:00',
    type: 'task',
    description: 'Daily walk reminder',
    isActive: false,
    frequency: 'daily',
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
    'grandma-rose': {
      name: 'Grandma Rose',
      initials: 'GR',
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
    },
  },
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
    const newReminder: ReminderItem = {
      ...reminder,
      id: Date.now(),
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
