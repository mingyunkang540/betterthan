import type { Score } from '../models/daily-record';

export const MOODS: Array<{ value: Score; emoji: string; label: string }> = [
  { value: 1, emoji: '😣', label: '매우 힘듦' },
  { value: 2, emoji: '😕', label: '힘듦' },
  { value: 3, emoji: '😐', label: '보통' },
  { value: 4, emoji: '🙂', label: '좋음' },
  { value: 5, emoji: '😊', label: '매우 좋음' },
];

export const ACTIVITIES = [
  '업무',
  '공부',
  '운동',
  '정리',
  '요리',
  '사람',
  '취미',
  '외출',
  '휴식',
  '돈 관리',
  '건강 관리',
  '기타',
] as const;

export const BLOCKERS = [
  '피곤함',
  '집중이 안 됨',
  '하기 싫었음',
  '시간이 부족했음',
  '방법을 몰랐음',
  '너무 크게 시작했음',
  '다른 일에 밀렸음',
  '사람·소통 문제',
  '걱정이 많았음',
  '예상 밖의 일',
  '특별히 막히지 않음',
] as const;

export const IMPROVEMENTS = [
  '일단 시작했다',
  '끝까지 마쳤다',
  '덜 미뤘다',
  '더 집중했다',
  '더 차분하게 행동했다',
  '솔직하게 말했다',
  '새로운 것을 시도했다',
  '몸을 챙겼다',
  '돈을 아꼈다',
  '충분히 쉬었다',
  '도움을 요청했다',
  '특별히 없음',
] as const;

export const EXPERIMENTS = {
  시작: [
    '5분만 시작하기',
    '가장 쉬운 부분부터 하기',
    '아침에 먼저 하기',
    '할 일을 하나만 정하기',
  ],
  집중: [
    '알림 30분 끄기',
    '휴대폰 멀리 두기',
    '타이머 20분 켜기',
    '한 번에 하나만 하기',
  ],
  건강: [
    '10분 걷기',
    '물 한 잔 더 마시기',
    '자정 전에 눕기',
    '스트레칭 5분 하기',
  ],
  생활: [
    '설거지 바로 하기',
    '책상 한 칸 정리하기',
    '빨래 미루지 않기',
    '쓰레기 바로 버리기',
  ],
  관계: [
    '먼저 안부 묻기',
    '고마움을 한 번 표현하기',
    '대화를 끝까지 듣기',
    '필요한 말을 미루지 않기',
  ],
  소비: [
    '장바구니 하루 보류하기',
    '배달 대신 집밥 먹기',
    '편의점 한 번 줄이기',
    '하루 무지출 도전하기',
  ],
  휴식: [
    '아무것도 하지 않는 10분 갖기',
    '자기 전 화면 끄기',
    '점심시간에 잠깐 쉬기',
    '죄책감 없이 쉬기',
  ],
} as const;

export type ExperimentCategory = keyof typeof EXPERIMENTS;

const BLOCKER_EXPERIMENT_CATEGORIES: Record<string, ExperimentCategory> = {
  피곤함: '휴식',
  '집중이 안 됨': '집중',
  '하기 싫었음': '시작',
  '시간이 부족했음': '시작',
  '방법을 몰랐음': '시작',
  '너무 크게 시작했음': '시작',
  '다른 일에 밀렸음': '집중',
  '사람·소통 문제': '관계',
  '걱정이 많았음': '휴식',
  '예상 밖의 일': '생활',
  '특별히 막히지 않음': '건강',
};

export function recommendedExperiments(blocker?: string): {
  category: ExperimentCategory;
  experiments: readonly string[];
} {
  const category =
    (blocker && BLOCKER_EXPERIMENT_CATEGORIES[blocker]) || '시작';
  return { category, experiments: EXPERIMENTS[category].slice(0, 3) };
}
