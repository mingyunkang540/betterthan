# 어제보다

하루 30초 동안 버튼 중심으로 기록하는 앱인토스 React Native 미니앱입니다.

## 현재 구현 범위

- 기분·에너지·집중도와 5개 회고 단계
- 최대 3개 활동 선택과 선택적인 40자 한 줄 입력
- 기록 미리보기, 조건 기반 피드백, 완료 결과
- 앱인토스 네이티브 `Storage`를 사용한 기록 및 작성 중 초안 저장
- 같은 날짜 기록 upsert와 날짜 변경 시 오래된 초안 차단
- 최신순 기록 목록과 읽기 전용 상세
- 월간 기록 수, 평균 점수, 자주 선택한 패턴 통계
- 기록 3일 미만 통계 안내
- 하루 첫 기록·한 줄 보너스와 월간 단계 보상을 제공하는 기록 조각 리워드
- 중복 지급을 막는 거래 원장과 앱 시작 시 누락 보상 복구
- 달별 기록을 모아 읽고 네이티브 공유 시트로 내보내는 월간 일기
- 기록 조각으로 구매하는 일기·가구·커피·식물·동물 상점
- 구매 전 드래그 배치 미리보기와 구매 후 위치 저장
- 자유 배치, 실행 취소·기본 배치 복원, 반응형 고양이·강아지가 있는 작은 방
- 앱인토스 프레임워크 등록 및 Granite 라우팅

1차 출시 범위와 수동 기기 점검 항목은 [출시 체크리스트](docs/RELEASE_CHECKLIST.md), 보상·상점 규칙은 [게임화 설계](docs/GAMIFICATION_PLAN.md)를 확인하세요.

## 개발 환경

- Node.js 22 LTS 이상 (`v22.17.1`에서 설치·테스트·AIT 빌드 확인)
- React Native + Granite
- TypeScript
- `@apps-in-toss/framework`
- `@apps-in-toss/native-modules`의 `Storage`

## 설치와 실행

```sh
npm install
npm run dev
```

Metro 개발 서버가 실행되면 앱인토스 샌드박스 앱에서 `intoss://betterthan` 스킴을 열어 확인합니다. Android 기기에서는 필요할 경우 먼저 아래 포트를 연결합니다.

```sh
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5173 tcp:5173
```

## 검증 명령

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```

콘솔 아이콘 URL을 포함한 최종 출시 후보는 PowerShell에서 아래처럼 생성합니다.

```powershell
$env:AIT_ICON_URL='https://콘솔에서-복사한-아이콘-주소'
npm run release:build
```

또는 바탕화면의 `어제보다 최종 배포 만들기.cmd`를 실행하고 콘솔 아이콘 URL을 붙여넣으면 검사·빌드·SHA256 확인과 결과 파일 열기까지 자동으로 진행됩니다.

`release:build`는 앱 ID·표시 이름·권한·600×600 아이콘·HTTPS 아이콘 URL을 먼저 검사한 뒤 타입 검사, 전체 테스트, AIT 빌드를 차례로 실행합니다.

## 출시 전 설정

`granite.config.ts`의 `appName`은 콘솔 값 `betterthan`과 일치합니다. `assets/brand/app-icon-600-v1.png`를 콘솔에 업로드한 뒤 URL을 `AIT_ICON_URL` 환경 변수로 전달해야 실제 검수용 번들을 생성할 수 있습니다.

번들 업로드 후에는 콘솔이 발급한 `intoss-private://betterthan?...` QR로 토스앱 최종 테스트를 1회 이상 완료해야 검토 요청 버튼이 활성화됩니다.

현재 Granite `1.0.36`의 마이크로프론트엔드 플러그인은 Windows 절대경로를 import 문자열로 만들 때 역슬래시를 정규화하지 않습니다. `predev`와 `prebuild`가 `scripts/patch-granite-windows.cjs`를 실행해 이 경로 생성만 보정합니다. 공식 패키지에서 수정되면 이 스크립트와 두 pre-script를 제거합니다.
