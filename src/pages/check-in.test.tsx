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

  it('5단계를 거쳐 미리보기 없이 바로 저장한다', async () => {
    const screen = render(<CheckInPage />);
    expect(screen.getByText('오늘 상태는 어땠나요?')).toBeTruthy();

    for (let step = 0; step < 4; step += 1) {
      fireEvent.press(screen.getByText('다음'));
    }
    expect(screen.getByLabelText('오늘의 한 줄').props.maxLength).toBe(40);
    expect(screen.getByLabelText('오늘의 한 줄').props.multiline).toBe(false);
    fireEvent.press(screen.getByText('오늘 기록 완료'));

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
    expect(screen.getByText('1 / 5')).toBeTruthy();
  });

  it('활동을 선택하지 않아도 회고 단계로 이동한다', () => {
    const screen = render(<CheckInPage />);
    fireEvent.press(screen.getByText('다음'));
    expect(screen.getByText('오늘 어떤 일을 했나요?')).toBeTruthy();
    fireEvent.press(screen.getByText('다음'));
    expect(screen.getByText('오늘 하루를 돌아볼까요?')).toBeTruthy();
  });

  it('활동은 세 개를 선택한 상태에서 네 번째 선택을 무시한다', () => {
    mockAppValue = {
      draft: {
        ...mockDraft,
        step: 1,
        activities: ['업무', '공부', '운동'],
      },
      updateDraft: mockUpdateDraft,
      saveCurrentDraft: mockSaveCurrentDraft,
    };
    const screen = render(<CheckInPage />);
    fireEvent.press(screen.getByText('정리'));
    expect(mockUpdateDraft).not.toHaveBeenCalled();
  });

  it('회고 화면에서 blocker와 improvement를 각각 선택한다', () => {
    mockAppValue = {
      draft: { ...mockDraft, step: 2 },
      updateDraft: mockUpdateDraft,
      saveCurrentDraft: mockSaveCurrentDraft,
    };
    const screen = render(<CheckInPage />);

    expect(screen.getByText('오늘 나를 가장 막은 것은?')).toBeTruthy();
    expect(screen.getByText('그래도 오늘 나아진 점은?')).toBeTruthy();
    fireEvent.press(screen.getByText('피곤함'));
    fireEvent.press(screen.getByText('일단 시작했다'));

    expect(mockUpdateDraft).toHaveBeenCalledWith({ blocker: '피곤함' });
    expect(mockUpdateDraft).toHaveBeenCalledWith({
      improvement: '일단 시작했다',
    });
  });

  it('회고를 선택하지 않고도 다음 단계로 이동한다', () => {
    mockAppValue = {
      draft: { ...mockDraft, step: 2 },
      updateDraft: mockUpdateDraft,
      saveCurrentDraft: mockSaveCurrentDraft,
    };
    const screen = render(<CheckInPage />);
    fireEvent.press(screen.getByText('다음'));
    expect(screen.getByText('내일 딱 하나만 바꾼다면?')).toBeTruthy();
  });

  it('저장 중 연속 클릭을 한 번의 요청으로 제한한다', async () => {
    let resolveSave: (value: { id: string }) => void = () => undefined;
    mockSaveCurrentDraft.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
    );
    mockAppValue = {
      draft: { ...mockDraft, step: 5 },
      updateDraft: mockUpdateDraft,
      saveCurrentDraft: mockSaveCurrentDraft,
    };
    const screen = render(<CheckInPage />);
    const button = screen.getByText('오늘 기록 완료');
    fireEvent.press(button);
    fireEvent.press(button);
    expect(mockSaveCurrentDraft).toHaveBeenCalledTimes(1);
    resolveSave({ id: 'record-1' });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });

  it('저장 실패 시 마지막 단계와 입력한 한 줄을 유지한다', async () => {
    mockSaveCurrentDraft.mockRejectedValue(new Error('save failed'));
    mockAppValue = {
      draft: { ...mockDraft, step: 5, oneLine: '그대로 남아야 해요' },
      updateDraft: mockUpdateDraft,
      saveCurrentDraft: mockSaveCurrentDraft,
    };
    const screen = render(<CheckInPage />);
    fireEvent.press(screen.getByText('오늘 기록 완료'));

    await waitFor(() =>
      expect(
        screen.getByText(
          '기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        ),
      ).toBeTruthy(),
    );
    expect(screen.getByLabelText('오늘의 한 줄').props.value).toBe(
      '그대로 남아야 해요',
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
