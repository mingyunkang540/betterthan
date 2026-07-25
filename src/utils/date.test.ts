import {
  formatDateKey,
  formatLocalDate,
  toLocalDateKey,
  toLocalMonthKey,
} from './date';

describe('formatLocalDate', () => {
  it('로컬 날짜와 요일을 한국어로 표시한다', () => {
    expect(formatLocalDate(new Date(2026, 6, 17))).toBe('2026.07.17 금요일');
  });

  it('로컬 저장용 날짜와 월 키를 만든다', () => {
    const date = new Date(2026, 6, 7, 23, 59);
    expect(toLocalDateKey(date)).toBe('2026-07-07');
    expect(toLocalMonthKey(date)).toBe('2026-07');
    expect(formatDateKey('2026-07-07')).toBe('2026.07.07');
  });
});
