# 방꾸미기 Visual QA 보고서

## 테스트 환경

- 방식: 프로덕션 Room 배치 공식을 재현한 결정적 Pillow 렌더러
- 원본 레이아웃: `src/pages/room.tsx`
- 슬롯/아이템 정의: `src/constants/room-definitions.ts`
- 에셋 매핑: `scripts/embed-room-assets.cjs`
- 디자인 기준: 768×1024
- 테스트 Room Container 너비: 360px, 390px, 430px
- 랜덤 위치·포즈·날짜·포인트 변화 없음
- 제한: 앱인토스 호스트 내비게이션/Safe Area와 React Native 자체 래스터라이저는 포함하지 않음

## 요약

- 테스트한 Room Asset: 53개
- 테스트한 Slot: 15개
- 생성한 스크린샷: 69장
- PASS: 69개 Case
- FAIL: 0개 Case
- BLOCKER: 0건
- MAJOR: 0건
- MINOR: 0건

## Item별 오류 목록

## Slot별 오류 목록


## 가장 먼저 고칠 문제 5개

1. `PET_SLOT_2`를 방 안쪽으로 이동해 기본/갈색 강아지가 바닥 경계 밖으로 나가는 문제 해결
2. `plant-olive`와 `plant-fiddle`에 서로 다른 고유 Asset 연결
3. `plant-succulent`의 선반 슬롯 가시 크기 확대 또는 선반 전용 Asset 적용
4. `APPLIANCE_SLOT`을 왼쪽으로 소폭 이동해 책장과 바닥 외곽 여백 확보
5. `PET_SLOT`을 오른쪽으로 미세 조정해 고양이 발·꼬리 주변 여백 확보

## 스크린샷 및 Contact Sheet

- 전체 스크린샷: `screenshots/`
- 카테고리별 Contact Sheet: `contact-sheets/`
- 관계·Stress·반응형: `contact-sheets/combinations-contact-sheet.png`
- Test Manifest: `manifest.json`
- 수동 판정 원본: `review-findings.json`

## 수정 권장 순서

1. 동물 슬롯 경계 문제
2. 중복 식물 Asset
3. 선반용 다육이 가시 크기
4. 책장 외곽 여백
5. 수정 후 동일 Manifest로 360/390/430px 회귀 캡처

## 판정 유의사항

이번 단계에서는 앱 코드, 좌표, 크기, Asset, zIndex를 변경하지 않았습니다. 보고된 권장값은 다음 수정 단계의 검토안이며 자동 적용되지 않았습니다.
