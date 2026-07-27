import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { HomePage } from './index';

const mockNavigate = jest.fn();
const mockSaveExperimentOutcome = jest.fn();

jest.mock('@apps-in-toss/framework', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    InlineAd: ({ adGroupId }: { adGroupId: string }) => (
      <Text testID="home-banner-ad">{adGroupId}</Text>
    ),
  };
});

jest.mock('@granite-js/react-native', () => ({
  createRoute: () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
  }),
}));

jest.mock('../state/app-context', () => ({
  useApp: () => ({
    loading: false,
    records: [
      {
        id: 'yesterday',
        date: '2026-07-25',
        mood: 3,
        energy: 3,
        focus: 3,
        activities: [],
        experiment: '5분만 시작하기',
        createdAt: '2026-07-25T00:00:00.000Z',
        updatedAt: '2026-07-25T00:00:00.000Z',
      },
    ],
    rewardBalance: 0,
    draft: {
      date: '2026-07-26',
      activities: [],
      oneLine: '',
      step: 0,
    },
    resetDraft: jest.fn(),
    saveExperimentOutcome: mockSaveExperimentOutcome,
  }),
}));

describe('HomePage yesterday experiment', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-26T12:00:00+09:00'));
    jest.clearAllMocks();
    mockSaveExperimentOutcome.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('어제 정한 실험을 평가 표현 없이 확인하고 저장한다', async () => {
    const screen = render(<HomePage />);

    expect(screen.getByText('어제의 작은 실험')).toBeTruthy();
    expect(screen.getByText('5분만 시작하기')).toBeTruthy();
    fireEvent.press(screen.getByText('조금 해봤어요'));

    await waitFor(() =>
      expect(mockSaveExperimentOutcome).toHaveBeenCalledWith(
        'yesterday',
        'PARTLY_DONE',
      ),
    );
  });

  it('메인 화면 하단에 토스 테스트 배너 광고를 표시한다', () => {
    const screen = render(<HomePage />);

    expect(screen.getByTestId('home-banner-ad').props.children).toBe(
      'ait-ad-test-banner-id',
    );
  });
});
