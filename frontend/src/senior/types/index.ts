export interface Contact {
  id: string;
  name: string;
  initials: string;
  relationship: string;
  lastCall: string;
  phoneNumber: string;
  isFavorite?: boolean;
}

export type Tab = "check-in" | "circle" | "activities";
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
