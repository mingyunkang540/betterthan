# Design
## Source of truth
- Status: Active
- Last refreshed: 2026-07-19
- Primary product surfaces: 홈, 6단계 체크인, 결과, 기록 목록·상세, 통계, 리워드, 월간 일기, 포근한 일기 꾸미기, 생활형 작은 방
- Evidence reviewed: `README.md`, `docs/MVP_PLAN.md`, `docs/GAMIFICATION_PLAN.md`, `docs/RELEASE_CHECKLIST.md`, `src/pages/*`, `src/components/ui.tsx`, `design-assets/approval/배치시안/최종승인-함께하는-방.png`, `design-assets/approval/배치시안/최종-배치명세.json`, 앱인토스 UI/UX·출시·샌드박스 공식 가이드

## Brand
- Personality: 밝고 차분하며 사용자를 평가하지 않는 작은 회고 도구
- Trust signals: 보상 규칙과 잔액을 명확히 표시하고 기록 손실·차감·연속 출석 압박을 만들지 않는다.
- Avoid: 도박형 연출, 과도한 축하, 죄책감 문구, 금융 자산처럼 보이는 표현

## Product goals
- Goals: 30~40초 기록 완료율을 유지하면서 재방문 동기를 제공하고 월별 기록을 다시 읽거나 외부 메모에 보관할 수 있게 한다.
- Non-goals: 현금성 보상, 사용자 간 전송, 확률형 아이템, 계정 동기화, 장문 일기 편집
- Success signals: 일일 첫 기록 보상의 멱등성, 월간 단계 보상의 정확성, 월간 일기 공유 성공

## Personas and jobs
- Primary personas: 긴 일기가 부담스럽지만 생활 패턴을 짧게 남기고 싶은 사용자
- User jobs: 오늘을 빠르게 기록하기, 꾸준함을 가볍게 보상받기, 한 달을 한 문서처럼 돌아보기
- Key contexts of use: 취침 전 또는 이동 중 모바일 세로 화면

## Information architecture
- Primary navigation: 홈을 중심으로 기록, 최근 기록, 통계, 리워드, 월간 일기로 진입
- Core routes/screens: `/`, `/check-in`, `/result`, `/records`, `/record-detail`, `/statistics`, `/rewards`, `/monthly-journal`, `/shop`, `/room`, `/diary-style`
- Content hierarchy: 회고 내용이 1순위, 보상은 결과 이후 2순위

## Design principles
- 기록이 보상보다 먼저다: 보상 화면이 체크인 시작을 방해하지 않는다.
- 손실 없는 동기: 하루를 빠뜨려도 포인트나 상태가 줄지 않는다.
- 설명 가능한 경제: 획득 조건, 수령 가능 여부, 잔액을 숫자로 명확히 보여준다.
- 보관은 사용자 주도: 월간 기록은 기기 저장을 유지하면서 공유 시트를 통해 메모 앱 등으로 내보낸다.
- Tradeoffs: 백엔드 동기화보다 로컬 우선의 단순성과 복구 가능한 멱등 원장을 우선한다.
- 방 배치 규칙: 커피는 책상, 가구·동물은 바닥, 식물은 바닥 또는 선반에 둔다. 허용 구역 밖에서 놓으면 가장 가까운 구역으로 보정하고 심하게 겹치면 가까운 빈 위치를 선택한다.
- 승인 방 기준: `최종승인-함께하는-방.png`의 포근한 원목 원룸을 시각 기준으로 사용한다. 책상 위 일기장은 항상 보이고, 식물은 책상·선반·창가·바닥의 네 위치에 독립 배치하며, 반려동물은 최대 두 마리까지 입장마다 위치와 sit·turn·paw 자세를 바꾼다.
- 편집 안전장치: 최근 20회의 이동·교체 이전 상태를 화면이 열려 있는 동안 되돌릴 수 있다. 기본 배치 복원도 되돌릴 수 있으며, 보유한 방 아이템은 편집 화면의 가로 인벤토리에서 즉시 교체한다.
- 다중 배치: 방 아이템은 카테고리 슬롯이 아니라 독립 인스턴스로 저장한다. 서로 다른 식물·가구를 동시에 배치할 수 있고, 인벤토리의 배치 중인 아이템을 다시 누르면 방에서 회수한다. 동일 상품의 무제한 복제는 허용하지 않는다.
- 구매 전 배치 체험: 방 상품 미리보기에서는 허용된 배치 구역 안에서 상품을 직접 끌어볼 수 있다. 체험 좌표는 구매·보유·실제 방 배치 상태에 반영하지 않고 모달을 닫으면 폐기한다.
- 구매 확정 연결: 사용자가 미리보기에서 구매 또는 적용을 명시적으로 확정하면 상품 지급·조각 차감·선택 위치 배치를 한 번에 저장하고 방 화면으로 이동한다.
- 초기 확장 카탈로그: 몬스테라 260조각, 낮은 원목 수납장 380조각, 마카롱 라테 세트 180조각, 포근한 강아지 650조각. 기존 상품과 함께 카테고리별 동시 배치를 검증한다.

## Visual language
- Color: 기존 파랑 `#3182F6`, 밝은 회색 배경, 보상 강조는 따뜻한 노랑을 제한적으로 사용
- Typography: React Native 기본 글꼴, 본문 14px 이상, 제목 28~30px
- Spacing/layout rhythm: 10·12·20·28px 리듬, 카드 간 10px
- Shape/radius/elevation: 14~20px 라운드 카드와 버튼, 그림자 대신 경계와 배경색
- Motion: 동물의 꼬리가 천천히 움직이고 터치하면 잠깐 고개를 돌린다. 기록 완료를 방해하거나 지속적인 주의를 요구하지 않는다. 방 아이템은 세로 위치가 낮을수록 앞 레이어에 표시한다.
- Imagery/iconography: 일기는 포근한 파스텔 종이·손그림 질감, 방은 자연 풍경 창문과 나무 책상·다이어리를 기본 장면으로 한다. 커피·식물·동물·가구는 방 편집 모드에서 화면 안의 원하는 위치에 배치하며 좌표를 기기에 저장한다.

## Components
- Existing components to reuse: `AppScreen`, `Card`, `PrimaryButton`, `BackButton`, `EmptyState`, `ErrorMessage`
- New/changed components: 잔액 카드, 월간 마일스톤 카드, 월간 기록 묶음, 5종 상점 탭, 구매 전 일기·방 미리보기, 상품 카드, 아이소메트릭 방 장면, 드래그 배치 아이템, 반응형 동물
- Variants and states: 수령 가능·수령 완료·미달, 내보내는 중·실패, 기록 없는 달
- Token/component ownership: 색상과 기본 버튼은 `src/components/ui.tsx`, 기능별 레이아웃은 각 페이지

## Accessibility
- Target standard: 모바일 핵심 흐름에서 스크린리더 이름·역할·상태 제공
- Keyboard/focus behavior: 월간 일기에는 입력 없음, 공유는 명시적 버튼으로만 실행
- Contrast/readability: 색상만으로 수령 상태를 구분하지 않고 텍스트 병기
- Screen-reader semantics: 잔액, 진행 횟수, 버튼 상태를 문장형 라벨로 제공
- Reduced motion and sensory considerations: 동물 움직임은 느리고 작게 유지하며 상호작용 없이도 기능 사용에 영향이 없다.

## Responsive behavior
- Supported breakpoints/devices: iOS·Android 모바일 세로, 작은 화면은 세로 스크롤
- Layout adaptations: 통계·보상 카드는 좁은 화면에서 내용이 줄바꿈된다. 방 아이템 크기는 방 너비에 비례하되 과도하게 작거나 커지지 않도록 제한한다.
- Touch/hover differences: 최소 44px 터치 영역, hover 의존 없음. 편집 모드에서 아이템 드래그, 일반 모드에서 동물 터치 반응을 분리한다.

## Interaction states
- Loading: 기존 공통 로딩 화면
- Empty: 기록 없는 달과 거래 없는 상태를 설명
- Error: 저장·수령·공유 실패를 화면 안에서 안내
- Success: 획득 기록과 수령 완료 문구를 즉시 반영
- Disabled: 미달 또는 이미 수령한 보상 버튼 비활성화
- Offline/slow network: 핵심 기록·보상·월간 열람은 네트워크 없이 동작

## Content voice
- Tone: 짧고 따뜻하며 사실 중심
- Terminology: 내부 `point`, 화면 `기록 조각`
- Microcopy rules: “놓쳤다”, “실패”, “연속 기록이 끊겼다”를 사용하지 않는다.

## Implementation constraints
- Framework/styling system: Granite React Native, TypeScript, 현재 공통 UI 패턴
- Design-token constraints: 새 디자인 시스템이나 외부 의존성 추가 금지
- Performance constraints: 거래·기록은 로컬 JSON이며 월 단위 필터만 수행
- Compatibility constraints: AppsInToss `Storage`, 공식 `share` API만 사용
- Test/screenshot expectations: 보상 멱등성·월간 수령·텍스트 내보내기 단위 테스트와 lint·typecheck·build 통과

## Open questions
- [ ] 계정 동기화·클라우드 백업은 백엔드 도입 시 별도 결정
- [ ] 계절별 창밖 자연 풍경과 추가 동물 종류는 기본 상점 검증 후 결정
