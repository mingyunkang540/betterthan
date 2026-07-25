import type { DailyRecord } from '../models/daily-record';
import { calculateMonthlyStatistics } from './statistics';

function record(
  id: string,
  date: string,
  mood: 1 | 2 | 3 | 4 | 5,
  activity: string,
): DailyRecord {
  return {
    id,
    date,
    mood,
    energy: mood,
    focus: mood,
    activities: [activity],
    blocker: '피곤함',
    improvement: '일단 시작했다',
    createdAt: date,
    updatedAt: date,
  };
}

describe('calculateMonthlyStatistics', () => {
  it('선택한 달만 집계하고 평균과 최빈값을 계산한다', () => {
    const stats = calculateMonthlyStatistics(
      [
        record('1', '2026-07-01', 2, '업무'),
        record('2', '2026-07-02', 4, '업무'),
        record('3', '2026-06-30', 5, '운동'),
      ],
      '2026-07',
    );
    expect(stats.recordCount).toBe(2);
    expect(stats.averageMood).toBe(3);
    expect(stats.topActivity).toBe('업무');
    expect(stats.topBlocker).toBe('피곤함');
  });

  it('기록이 없으면 평균과 패턴이 없다', () => {
    expect(calculateMonthlyStatistics([], '2026-07')).toEqual({
      recordCount: 0,
      averageMood: undefined,
      averageEnergy: undefined,
      averageFocus: undefined,
      topActivity: undefined,
      topBlocker: undefined,
      topImprovement: undefined,
    });
  });

  it('동률인 패턴은 이름순으로 일관되게 선택하고 평균은 소수 첫째 자리로 반올림한다', () => {
    const stats = calculateMonthlyStatistics(
      [
        record('1', '2026-07-01', 1, '운동'),
        record('2', '2026-07-02', 2, '업무'),
        record('3', '2026-07-03', 2, '운동'),
        record('4', '2026-07-04', 2, '업무'),
      ],
      '2026-07',
    );
    expect(stats.averageMood).toBe(1.8);
    expect(stats.topActivity).toBe('업무');
  });
});
