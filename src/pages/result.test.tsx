import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { DailyRecord } from '../models/daily-record';
import { ResultPage } from './result';

const mockNavigate = jest.fn();
const mockEditTodayRecord = jest.fn();
const mockRecord: DailyRecord = {
  id: 'record-1',
  date: '2026-07-26',
  mood: 4,
  energy: 3,
  focus: 4,
  activities: [],
  oneLine: '오늘의 기록',
  createdAt: '2026-07-26T00:00:00.000Z',
  updatedAt: '2026-07-26T00:00:00.000Z',
};

jest.mock('@granite-js/react-native', () => ({
  createRoute: () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
    useParams: () => ({ id: 'record-1' }),
  }),
}));

jest.mock('../state/app-context', () => ({
  useApp: () => ({
    records: [mockRecord],
    rewardTransactions: [],
    editTodayRecord: mockEditTodayRecord,
  }),
}));

describe('ResultPage editing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEditTodayRecord.mockResolvedValue(undefined);
  });

  it('저장 결과에서 오늘 기록을 Draft로 복원해 수정 화면으로 이동한다', async () => {
    const screen = render(<ResultPage />);
    fireEvent.press(screen.getByText('오늘 기록 수정하기'));

    await waitFor(() => {
      expect(mockEditTodayRecord).toHaveBeenCalledWith(mockRecord);
      expect(mockNavigate).toHaveBeenCalledWith('/check-in');
    });
  });
});
