import { render } from '@testing-library/react-native';
import type { DailyRecord } from '../models/daily-record';
import { RecordView } from './record-view';

const record: DailyRecord = {
  id: 'record-1',
  date: '2026-07-26',
  mood: 4,
  energy: 3,
  focus: 4,
  activities: ['업무', '운동'],
  blocker: '피곤함',
  improvement: '일단 시작했다',
  experiment: '자기 전 화면 끄기',
  oneLine: '작게라도 시작한 하루',
  createdAt: '2026-07-26T00:00:00.000Z',
  updatedAt: '2026-07-26T00:00:00.000Z',
};

describe('RecordView', () => {
  it('한 줄과 회고를 일기 문장으로 보여주고 실험을 별도 카드로 표시한다', () => {
    const screen = render(<RecordView record={record} />);

    expect(screen.getByText('“작게라도 시작한 하루”')).toBeTruthy();
    expect(
      screen.getByText('피곤함 때문에 잠시 막혔지만, 그래도 일단 시작했다.'),
    ).toBeTruthy();
    expect(screen.getByText('자기 전 화면 끄기')).toBeTruthy();
    expect(screen.queryByText('선택하지 않았어요')).toBeNull();
  });

  it('선택하지 않은 선택 항목은 반복 문구 없이 숨긴다', () => {
    const screen = render(
      <RecordView
        record={{
          ...record,
          activities: [],
          blocker: undefined,
          improvement: undefined,
          experiment: undefined,
          oneLine: undefined,
        }}
      />,
    );

    expect(screen.queryByText('오늘 한 일')).toBeNull();
    expect(screen.queryByText('오늘의 회고')).toBeNull();
    expect(screen.queryByText('내일의 작은 실험')).toBeNull();
    expect(screen.queryByText('선택하지 않았어요')).toBeNull();
  });
});
