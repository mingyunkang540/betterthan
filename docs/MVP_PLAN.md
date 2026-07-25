# 어제보다 MVP 설계

게임화 확장 설계와 0~6단계 경계는 [`GAMIFICATION_PLAN.md`](./GAMIFICATION_PLAN.md)를 따른다. 1차 출시 후보에는 기본 기록 MVP와 리워드, 월간 일기, 상점, 일기·방 꾸미기를 포함한다.

## 구현 상태

기록·리워드·월간 일기와 꾸미기 흐름이 구현되었다. 상점은 5개 탭과 구매 전 미리보기를 제공하며, 방 아이템은 구매 확정 시 선택한 위치에 원자적으로 저장된다. 실제 샌드박스 기기에서의 시각·터치 QA와 콘솔 앱 아이콘 URL 설정은 출시 준비 항목으로 남는다.

## 화면 목록

1. 홈
2. 오늘 상태
3. 오늘 한 일
4. 오늘 막힌 것
5. 오늘 나아진 점
6. 내일의 작은 실험
7. 오늘의 한 줄
8. 기록 결과
9. 기록 목록
10. 기록 상세
11. 간단한 통계
12. 기록 조각 리워드
13. 월간 일기
14. 포근한 상점
15. 일기장 꾸미기
16. 작은 방·배치 편집

## 컴포넌트 구조

- `src/pages`: Granite 파일 기반 라우트의 화면 구현
- `src/components/layout`: 화면 컨테이너, 상단 진행 표시, 하단 액션 영역
- `src/components/check-in`: 척도 선택, 단일 선택, 다중 선택, 실험 선택
- `src/components/records`: 결과 카드, 기록 목록 아이템, 상세 섹션
- `src/constants`: 질문, 선택지, 라벨
- `src/models`: `DailyRecord`, 작성 중 초안 타입
- `src/storage`: 앱인토스 `Storage` 어댑터와 저장 키
- `src/state`: 작성 중 초안 상태와 저장 복구 로직
- `src/utils`: 날짜, 피드백 템플릿, 통계 계산

## 데이터 구조

```ts
type Score = 1 | 2 | 3 | 4 | 5;

interface DailyRecord {
  id: string;
  date: string;
  mood: Score;
  energy: Score;
  focus: Score;
  activities: string[];
  blocker?: string;
  improvement?: string;
  experimentCategory?: string;
  experiment?: string;
  oneLine?: string;
  createdAt: string;
  updatedAt: string;
}
```

`date`는 사용자 로컬 시간 기준 `YYYY-MM-DD` 키로 저장하고, 날짜별 upsert로 중복을 막습니다. 향후 불안감 같은 선택 필드는 모델 버전 또는 선택 프로퍼티로 확장합니다.

`id`는 이후 일일 포인트 거래의 `referenceId`가 되므로 기록 수정이나 날짜별 upsert에서도 바뀌지 않는 불변 식별자로 유지합니다. 기록 삭제 후 재작성하더라도 보상 원장은 별도 보존하는 구조를 1단계에서 적용합니다.

## 상태와 저장

- 화면 간 작성 상태: 작은 전용 React Context + reducer
- 작성 중 초안: 날짜가 포함된 별도 키로 `Storage`에 저장
- 완료 기록: 날짜를 키로 가진 레코드 맵을 JSON 문자열로 `Storage`에 저장
- 앱 시작 시 초안 날짜가 오늘과 다르면 이전 날짜 기록으로 잘못 저장되지 않도록 복구를 중단
- `AsyncStorage`는 앱인토스에서 지원하지 않으므로 사용하지 않음

## 개발 단계와 완료 조건

1. **최소 골격**: 앱이 빌드되고 홈과 기록 시작 버튼이 보이며 첫 단계로 이동한다.
2. **도메인 기반**: 타입, 선택지 상수, 날짜 유틸, 피드백 규칙에 단위 테스트가 있다.
3. **기록 흐름**: 6개 선택 단계와 한 줄 입력, 뒤로 이동, 선택 검증을 완료할 수 있다.
4. **초안 복구**: 앱 종료 후 같은 날 재진입하면 작성 내용이 복구되고 날짜 변경은 안전하게 처리된다.
5. **저장**: 완료 기록이 재실행 후 유지되며 같은 날짜는 upsert된다.
6. **결과·목록·상세**: 저장 결과와 최신순 목록, 읽기 전용 상세를 확인한다.
7. **통계**: 월간 집계와 3일 미만 안내를 정확히 계산한다.
8. **모바일 UI**: 작은 세로 화면, 긴 한국어 선택지, 터치 높이, 키보드 화면을 점검한다.
9. **QA·출시 준비**: 명시된 13개 시나리오, 타입 검사, 테스트, 빌드가 통과하고 콘솔 설정 및 정책 체크리스트를 완료한다. 이 조건을 모두 충족하기 전에는 게임화 1단계를 시작하지 않는다.

## 생성 예정 파일

- `src/models/daily-record.ts`: 도메인 타입
- `src/constants/check-in-options.ts`: 모든 선택지
- `src/state/check-in-context.tsx`: 초안 상태
- `src/storage/record-storage.ts`: 영속 저장과 날짜별 upsert
- `src/utils/feedback.ts`: 조건 기반 피드백
- `src/utils/statistics.ts`: 월간 통계
- `src/pages/*`: 나머지 기록·목록·상세·통계 화면

## 확인 필요 사항

- 앱인토스 콘솔에 등록할 실제 `appName`과 아이콘 URL
- TDS React Native는 로컬 브라우저가 아니라 샌드박스 앱에서만 검증 가능
- 실제 샌드박스 앱의 상단 Navigation 노출/구성은 콘솔 정보와 기기 실행 환경에서 최종 확인
- Node.js 22.17.1에서 현재 의존성 설치·테스트·AIT 빌드를 확인했으며 CI도 Node.js 22 LTS 이상으로 고정
- Granite `1.0.36`의 Windows 절대경로 생성 문제 때문에 임시 호환 스크립트를 사용하며, 공식 수정 버전 확인 후 제거 필요
- 기록은 토스 앱 삭제 시 함께 삭제되며, MVP에는 계정 동기화나 백업이 없음
