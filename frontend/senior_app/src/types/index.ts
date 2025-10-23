export interface Contact {
  id: string;
  name: string;
  initials: string;
  relationship: string;
  lastCall: string;
  isFavorite?: boolean;
}

export type Tab = "check-in" | "circle" | "activities";
export type Mood = "great" | "okay" | "not-well" | null;

export interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  category: "Exercise" | "Mental" | "Learning" | "Social";
  completed?: boolean;
}
