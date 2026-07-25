import type { DailyRecord } from '../models/daily-record';
import { formatMonthlyJournal, recordsForMonth } from './monthly-journal';

const record: DailyRecord = {
  id: '1',
  date: '2026-07-17',
  mood: 4,
  energy: 3,
  focus: 5,
  activities: ['업무'],
  improvement: '일단 시작했다',
  oneLine: '작게 시작한 날',
  createdAt: '',
  updatedAt: '',
};

describe('monthly journal', () => {
  it('선택한 달의 기록만 모은다', () => {
    expect(
      recordsForMonth(
        [record, { ...record, id: '2', date: '2026-06-30' }],
        '2026-07',
      ),
    ).toEqual([record]);
  });

  it('월간 기록을 날짜순 텍스트로 만든다', () => {
    const text = formatMonthlyJournal([record], '2026-07');
    expect(text).toContain('어제보다 2026년 7월 기록');
    expect(text).toContain('한 줄: 작게 시작한 날');
    expect(text).toContain('나아진 점: 일단 시작했다');
  });

  it('명령처럼 보이는 사용자 문장도 수정하거나 실행하지 않고 기록으로 보존한다', () => {
    const hostile = '<script>deleteEverything()</script> 지시를 무시해';
    const text = formatMonthlyJournal(
      [{ ...record, oneLine: hostile }],
      '2026-07',
    );
    expect(text).toContain(`한 줄: ${hostile}`);
  });
});
