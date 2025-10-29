export interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  category: "Exercise" | "Mental" | "Learning" | "Social";
  completed?: boolean;
}
