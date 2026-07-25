export type Score = 1 | 2 | 3 | 4 | 5;

export interface DailyRecord {
  id: string;
  date: string;
  mood: Score;
  energy: Score;
  focus: Score;
  activities: string[];
  blocker?: string;
  improvement?: string;
  experimentCategory?: string;
  experiment?: string;
  oneLine?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInDraft {
  date: string;
  mood?: Score;
  energy?: Score;
  focus?: Score;
  activities: string[];
  blocker?: string;
  improvement?: string;
  experimentCategory?: string;
  experiment?: string;
  oneLine: string;
  step: number;
}

export function createEmptyDraft(date: string): CheckInDraft {
  return { date, activities: [], oneLine: '', step: 0 };
}
