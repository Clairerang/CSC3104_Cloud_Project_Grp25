import { EngagementEntry } from '../api/client';

export type SeniorStatus = 'Active' | 'Missed Check-In' | 'Inactive';

export interface CaregiverSeniorCard {
  id: string;
  userId: string;
  name: string;
  initials: string;
  status: SeniorStatus;
  lastCheckIn: string;
  isOnline: boolean;
  engagement: number;
  relation: string;
  email?: string;
  contact?: string;
  totalPoints: number;
  lastActiveAt: string | null;
  todayEngagements: EngagementEntry[];
  latestMood?: 'great' | 'okay' | 'not-well';
}

