import type { DailyRecord } from '../models/daily-record';

export interface MonthlyStatistics {
  recordCount: number;
  averageMood?: number;
  averageEnergy?: number;
  averageFocus?: number;
  topActivity?: string;
  topBlocker?: string;
  topImprovement?: string;
}

function mostFrequent(values: string[]): string | undefined {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0]?.[0];
}

function average(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return (
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
    ) / 10
  );
}

export function calculateMonthlyStatistics(
  records: DailyRecord[],
  monthKey: string,
): MonthlyStatistics {
  const monthly = records.filter((record) => record.date.startsWith(monthKey));
  return {
    recordCount: monthly.length,
    averageMood: average(monthly.map((record) => record.mood)),
    averageEnergy: average(monthly.map((record) => record.energy)),
    averageFocus: average(monthly.map((record) => record.focus)),
    topActivity: mostFrequent(monthly.flatMap((record) => record.activities)),
    topBlocker: mostFrequent(
      monthly.flatMap((record) => (record.blocker ? [record.blocker] : [])),
    ),
    topImprovement: mostFrequent(
      monthly.flatMap((record) =>
        record.improvement ? [record.improvement] : [],
      ),
    ),
  };
}
