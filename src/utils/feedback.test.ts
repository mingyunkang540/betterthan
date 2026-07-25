import type { DailyRecord } from '../models/daily-record';
import { createFeedback } from './feedback';

const record: DailyRecord = {
  id: '1',
  date: '2026-07-17',
  mood: 2,
  energy: 2,
  focus: 2,
  activities: [],
  blocker: '피곤함',
  improvement: '일단 시작했다',
  createdAt: '',
  updatedAt: '',
};

describe('createFeedback', () => {
  it('낮은 에너지에도 시작한 날을 평가 없이 격려한다', () => {
    expect(createFeedback(record)).toBe(
      '에너지는 낮았지만 해야 할 일을 시작했어요.',
    );
  });

  it('특별히 막히지 않은 날을 안정적으로 표현한다', () => {
    expect(createFeedback({ ...record, blocker: '특별히 막히지 않음' })).toBe(
      '오늘은 특별히 막히지 않고 안정적으로 흘러갔어요.',
    );
  });

  it('충분히 쉰 날에는 휴식을 변화로 인정한다', () => {
    expect(createFeedback({ ...record, improvement: '충분히 쉬었다' })).toBe(
      '충분히 쉬는 것도 앞으로 나아가는 방법이에요.',
    );
  });

  it('선택 항목이 없는 날에도 평가하지 않는 기본 피드백을 제공한다', () => {
    expect(
      createFeedback({
        ...record,
        blocker: undefined,
        improvement: undefined,
      }),
    ).toBe('오늘을 있는 그대로 남긴 것만으로 충분해요.');
  });
});
