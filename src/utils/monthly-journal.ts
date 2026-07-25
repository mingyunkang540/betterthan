import { MOODS } from '../constants/check-in-options';
import type { DailyRecord } from '../models/daily-record';
import { formatDateKey } from './date';

export function recordsForMonth(records: DailyRecord[], monthKey: string) {
  return records.filter((record) => record.date.startsWith(monthKey));
}

export function formatMonthlyJournal(
  records: DailyRecord[],
  monthKey: string,
): string {
  const monthly = recordsForMonth(records, monthKey).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const [year, month] = monthKey.split('-');
  const lines = [`어제보다 ${year}년 ${Number(month)}월 기록`, ''];
  for (const record of monthly) {
    const mood = MOODS.find((item) => item.value === record.mood);
    lines.push(`[${formatDateKey(record.date)}]`);
    lines.push(
      `기분 ${mood?.label ?? record.mood} · 에너지 ${record.energy}/5 · 집중 ${record.focus}/5`,
    );
    if (record.activities.length)
      lines.push(`한 일: ${record.activities.join(', ')}`);
    if (record.blocker) lines.push(`막힌 것: ${record.blocker}`);
    if (record.improvement) lines.push(`나아진 점: ${record.improvement}`);
    if (record.experiment) lines.push(`작은 실험: ${record.experiment}`);
    if (record.oneLine) lines.push(`한 줄: ${record.oneLine}`);
    lines.push('');
  }
  return lines.join('\n').trim();
}
