import type { DailyRecord } from '../models/daily-record';

export function createFeedback(record: DailyRecord): string {
  if (record.blocker === '특별히 막히지 않음')
    return '오늘은 특별히 막히지 않고 안정적으로 흘러갔어요.';
  if (record.improvement === '충분히 쉬었다')
    return '충분히 쉬는 것도 앞으로 나아가는 방법이에요.';
  if (record.energy <= 2 && record.improvement === '일단 시작했다')
    return '에너지는 낮았지만 해야 할 일을 시작했어요.';
  if (record.improvement === '일단 시작했다')
    return '오늘은 완료보다 시작에 의미가 있었어요.';
  if (record.focus <= 2 && record.improvement === '새로운 것을 시도했다')
    return '집중이 쉽지 않았지만 새로운 시도를 남겼어요.';
  if (record.improvement && record.improvement !== '특별히 없음')
    return `오늘은 “${record.improvement}”라는 변화를 남겼어요.`;
  return '오늘을 있는 그대로 남긴 것만으로 충분해요.';
}
