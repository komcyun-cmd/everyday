
export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  description: string;
  sources?: { title: string; uri: string }[];
}

export interface HistoryEvent {
  year: string;
  event: string;
  description: string;
  sources: { title: string; uri: string }[];
}

export interface Quote {
  text: string;
  author: string;
}

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  recurrence: Recurrence;
  completedDates: string[]; // Store YYYY-MM-DD
}

export interface Memo {
  id: string;
  content: string;
  updatedAt: number;
}

export interface GoalEntry {
  date: string;
  value: number;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  unit: string;
  entries: GoalEntry[];
}

export interface AppState {
  schedules: ScheduleItem[];
  memos: Memo[];
  goals: Goal[];
}
