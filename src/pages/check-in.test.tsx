import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { type CheckInDraft, createEmptyDraft } from '../models/daily-record';
import { CheckInPage } from './check-in';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockUpdateDraft = jest.fn();
const mockSaveCurrentDraft = jest.fn();
const mockDraft = {
  ...createEmptyDraft('2026-07-18'),
  mood: 3 as const,
  energy: 4 as const,
  focus: 2 as const,
};
let mockAppValue: {
  draft: CheckInDraft;
  updateDraft: typeof mockUpdateDraft;
  saveCurrentDraft: typeof mockSaveCurrentDraft;
} = {
  draft: mockDraft,
  updateDraft: mockUpdateDraft,
  saveCurrentDraft: mockSaveCurrentDraft,
};

jest.mock('@granite-js/react-native', () => ({
  createRoute: () => ({
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  }),
}));

jest.mock('../state/app-context', () => ({
  useApp: () => mockAppValue,
}));

describe('check-in screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveCurrentDraft.mockResolvedValue({ id: 'record-1' });
    mockAppValue = {
      draft: mockDraft,
      updateDraft: mockUpdateDraft,
      saveCurrentDraft: mockSaveCurrentDraft,
    };
  });

  it('키보드 입력 없이 6단계와 결과 미리보기를 거쳐 저장한다', async () => {
    const screen = render(<CheckInPage />);
    expect(screen.getByText('오늘 상태는 어땠나요?')).toBeTruthy();

    for (let step = 0; step < 5; step += 1) {
      fireEvent.press(screen.getByText('다음'));
    }
    expect(screen.getByLabelText('오늘의 한 줄').props.maxLength).toBe(40);
    expect(screen.getByLabelText('오늘의 한 줄').props.multiline).toBe(false);
    fireEvent.press(screen.getByText('결과 확인'));
    expect(screen.getByText('이렇게 남길까요?')).toBeTruthy();
    fireEvent.press(screen.getByText('기록 완료'));

    await waitFor(() => {
      expect(mockSaveCurrentDraft).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/result', {
        id: 'record-1',
      });
    });
  });

  it('첫 단계 필수 점수가 없으면 다음 단계로 이동하지 않는다', () => {
    mockAppValue = {
      draft: { ...mockDraft, mood: undefined },
      updateDraft: mockUpdateDraft,
      saveCurrentDraft: mockSaveCurrentDraft,
    };
    const screen = render(<CheckInPage />);
    fireEvent.press(screen.getByText('다음'));
    expect(
      screen.getByText('기분, 에너지, 집중도를 모두 선택해 주세요.'),
    ).toBeTruthy();
    expect(screen.getByText('1 / 6')).toBeTruthy();
  });
});
