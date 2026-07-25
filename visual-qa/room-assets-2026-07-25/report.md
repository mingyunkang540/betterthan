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

- 테스트한 Room Asset: 41개
- 테스트한 Slot: 15개
- 생성한 스크린샷: 57장
- PASS: 44개 Case
- FAIL: 13개 Case
- BLOCKER: 0건
- MAJOR: 10건
- MINOR: 4건

## Item별 오류 목록

### CASE_025 · plant-olive · MAJOR

- 스크린샷: `screenshots/room-case_025-single_plant-olive_plant_slot_1-390.png`
- Asset: `assets/room/cozy-approved-v3/plant-fiddle.png`
- Slot: `PLANT_SLOT_1`
- 현재 x/y: 44 / 272px (viewport 390px)
- 현재 width/height: 66 / 89px
- 현재 zIndex: 50
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 올리브 화분이 떡갈고무나무와 동일한 원본 Asset을 사용해 서로 다른 상품이 크기만 다르게 표시됩니다.
- 기대 결과: 올리브 화분 전용 수형과 잎 형태가 보여야 합니다.
- 권장 방향: plant-olive에 고유한 투명 PNG Asset을 연결합니다.

### CASE_029 · plant-succulent · MAJOR

- 스크린샷: `screenshots/room-case_029-single_plant-succulent_floor_lamp_slot-390.png`
- Asset: `assets/room/cozy-approved-v3/plant-succulent.png`
- Slot: `FLOOR_LAMP_SLOT`
- 현재 x/y: 295 / 201px (viewport 390px)
- 현재 width/height: 26 / 31px
- 현재 zIndex: 73
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 선반 슬롯에서 실제 가시 영역이 14×15px에 불과해 화분 형태를 식별하기 어렵습니다.
- 기대 결과: 책과 함께 놓였을 때 작은 화분이라는 점을 바로 알아볼 수 있어야 합니다.
- 권장 방향: 선반 전용 Asset을 사용하거나 FLOOR_LAMP_SLOT에서만 scale을 약 1.15~1.3배로 보정합니다.

### CASE_031 · plant-fiddle · MAJOR

- 스크린샷: `screenshots/room-case_031-single_plant-fiddle_plant_slot_1-390.png`
- Asset: `assets/room/cozy-approved-v3/plant-fiddle.png`
- Slot: `PLANT_SLOT_1`
- 현재 x/y: 39 / 259px (viewport 390px)
- 현재 width/height: 76 / 102px
- 현재 zIndex: 50
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 떡갈고무나무가 올리브 화분과 동일한 원본 Asset을 사용합니다.
- 기대 결과: 떡갈고무나무의 큰 잎과 키가 독립적인 상품 이미지로 표현돼야 합니다.
- 권장 방향: plant-fiddle 또는 plant-olive 중 하나에 고유 Asset을 제작·연결합니다.

### CASE_039 · bookcase-small · MINOR

- 스크린샷: `screenshots/room-case_039-single_bookcase-small_appliance_slot-390.png`
- Asset: `assets/room/cozy-approved-v3/bookcase-small.png`
- Slot: `APPLIANCE_SLOT`
- 현재 x/y: 297 / 303px (viewport 390px)
- 현재 width/height: 65 / 78px
- 현재 zIndex: 32
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 책장이 우측 전면 바닥 테두리에 매우 가깝고 일부가 테두리 위에 걸쳐 보입니다.
- 기대 결과: 책장 다리가 바닥 안쪽에 안정적으로 놓여 보여야 합니다.
- 권장 방향: APPLIANCE_SLOT x를 약 10~16 design px 왼쪽으로 검토합니다.

### CASE_045 · pet-cat · MINOR

- 스크린샷: `screenshots/room-case_045-single_pet-cat_pet_slot-390.png`
- Asset: `assets/room/cozy-approved/cat-sit.png`
- Slot: `PET_SLOT`
- 현재 x/y: 75 / 345px (viewport 390px)
- 현재 width/height: 62 / 72px
- 현재 zIndex: 52
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 고양이가 좌측 전면 바닥 테두리와 가까워 여백이 좁습니다.
- 기대 결과: 발 주변에 바닥 여백이 남아 안정적으로 서 있어야 합니다.
- 권장 방향: PET_SLOT x를 약 8~12 design px 오른쪽으로 검토합니다.

### CASE_046 · pet-dog · MAJOR

- 스크린샷: `screenshots/room-case_046-single_pet-dog_pet_slot_2-390.png`
- Asset: `assets/room/cozy-approved/dog-sit.png`
- Slot: `PET_SLOT_2`
- 현재 x/y: 243 / 361px (viewport 390px)
- 현재 width/height: 67 / 75px
- 현재 zIndex: 53
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 강아지의 발과 몸 일부가 방의 우측 전면 바닥 경계 밖으로 내려가 보입니다.
- 기대 결과: 강아지 전체가 방 바닥 면 안에 놓여야 합니다.
- 권장 방향: PET_SLOT_2를 약 24~36 design px 위쪽, 12~20 design px 왼쪽으로 이동 검토합니다.

### CASE_047 · pet-cat-gray · MINOR

- 스크린샷: `screenshots/room-case_047-single_pet-cat-gray_pet_slot-390.png`
- Asset: `assets/room/cozy-approved-v3/cat-gray-plant.png`
- Slot: `PET_SLOT`
- 현재 x/y: 75 / 345px (viewport 390px)
- 현재 width/height: 62 / 72px
- 현재 zIndex: 52
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 회색 고양이가 좌측 전면 바닥 테두리와 가까워 여백이 좁습니다.
- 기대 결과: 꼬리와 발 주변에 바닥 여백이 남아야 합니다.
- 권장 방향: PET_SLOT x를 약 8~12 design px 오른쪽으로 검토합니다.

### CASE_048 · pet-dog-brown · MAJOR

- 스크린샷: `screenshots/room-case_048-single_pet-dog-brown_pet_slot_2-390.png`
- Asset: `assets/room/cozy-approved-v3/dog-brown-eat.png`
- Slot: `PET_SLOT_2`
- 현재 x/y: 243 / 361px (viewport 390px)
- 현재 width/height: 67 / 75px
- 현재 zIndex: 53
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 강아지와 밥그릇이 우측 전면 바닥 경계에 걸쳐 방 밖에 있는 것처럼 보입니다.
- 기대 결과: 강아지와 밥그릇 전체가 바닥 면 안에 들어와야 합니다.
- 권장 방향: PET_SLOT_2를 약 24~36 design px 위쪽, 12~20 design px 왼쪽으로 이동 검토합니다.

### CASE_104 · pet-dog · MAJOR

- 스크린샷: `screenshots/room-case_104-pet_set-390.png`
- Asset: `assets/room/cozy-approved/dog-sit.png`
- Slot: `PET_SLOT_2`
- 현재 x/y: 243 / 361px (viewport 390px)
- 현재 width/height: 67 / 75px
- 현재 zIndex: 53
- 현재 renderOffsetX/Y: 0 / 0
- 문제: PET_SET에서도 강아지가 우측 전면 바닥 경계를 넘어 보입니다.
- 기대 결과: 러그와 식물 사이에서 두 동물이 모두 바닥 안에 놓여야 합니다.
- 권장 방향: PET_SLOT_2 위치 보정을 우선 검토합니다.

### CASE_201 · pet-dog-brown · MAJOR

- 스크린샷: `screenshots/room-case_201-full_room_stress-390.png`
- Asset: `assets/room/cozy-approved-v3/dog-brown-eat.png`
- Slot: `PET_SLOT_2`
- 현재 x/y: 243 / 361px (viewport 390px)
- 현재 width/height: 67 / 75px
- 현재 zIndex: 53
- 현재 renderOffsetX/Y: 0 / 0
- 문제: Stress Test에서 강아지와 밥그릇이 방 바닥 경계 밖으로 내려가 보입니다.
- 기대 결과: 모든 슬롯을 채운 상태에서도 동물 전체가 방 안에 보여야 합니다.
- 권장 방향: PET_SLOT_2 위치 보정을 우선 검토합니다.

### CASE_201 · bookcase-small · MINOR

- 스크린샷: `screenshots/room-case_201-full_room_stress-390.png`
- Asset: `assets/room/cozy-approved-v3/bookcase-small.png`
- Slot: `APPLIANCE_SLOT`
- 현재 x/y: 297 / 303px (viewport 390px)
- 현재 width/height: 65 / 78px
- 현재 zIndex: 32
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 책장이 캐노피 침대 발치와 우측 바닥 테두리 사이에 끼어 여백이 매우 좁습니다.
- 기대 결과: 책장과 침대 사이 및 바닥 외곽에 최소한의 여백이 보여야 합니다.
- 권장 방향: APPLIANCE_SLOT을 왼쪽으로 소폭 이동하거나 가장 큰 침대와의 조합 여백을 재검토합니다.

### CASE_301 · pet-dog-brown · MAJOR

- 스크린샷: `screenshots/room-case_301-responsive_360-360.png`
- Asset: `pet-dog-brown-floor`
- Slot: `PET_SLOT_2`
- 현재 x/y: 224 / 333px (viewport 360px)
- 현재 width/height: 62 / 69px
- 현재 zIndex: 53
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 360px에서도 강아지가 우측 전면 바닥 경계를 넘어 보입니다.
- 기대 결과: 반응형 축소 후에도 동물이 방 바닥 안에 있어야 합니다.
- 권장 방향: PET_SLOT_2의 design 좌표를 보정합니다.

### CASE_302 · pet-dog-brown · MAJOR

- 스크린샷: `screenshots/room-case_302-responsive_390-390.png`
- Asset: `pet-dog-brown-floor`
- Slot: `PET_SLOT_2`
- 현재 x/y: 243 / 361px (viewport 390px)
- 현재 width/height: 67 / 75px
- 현재 zIndex: 53
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 390px에서도 강아지가 우측 전면 바닥 경계를 넘어 보입니다.
- 기대 결과: 반응형 축소 후에도 동물이 방 바닥 안에 있어야 합니다.
- 권장 방향: PET_SLOT_2의 design 좌표를 보정합니다.

### CASE_303 · pet-dog-brown · MAJOR

- 스크린샷: `screenshots/room-case_303-responsive_430-430.png`
- Asset: `pet-dog-brown-floor`
- Slot: `PET_SLOT_2`
- 현재 x/y: 268 / 397px (viewport 430px)
- 현재 width/height: 74 / 83px
- 현재 zIndex: 53
- 현재 renderOffsetX/Y: 0 / 0
- 문제: 430px에서도 강아지가 우측 전면 바닥 경계를 넘어 보입니다.
- 기대 결과: 반응형 확대 후에도 동물이 방 바닥 안에 있어야 합니다.
- 권장 방향: PET_SLOT_2의 design 좌표를 보정합니다.

## Slot별 오류 목록

- `PLANT_SLOT_1`: BLOCKER 0, MAJOR 2, MINOR 0
- `FLOOR_LAMP_SLOT`: BLOCKER 0, MAJOR 1, MINOR 0
- `APPLIANCE_SLOT`: BLOCKER 0, MAJOR 0, MINOR 2
- `PET_SLOT`: BLOCKER 0, MAJOR 0, MINOR 2
- `PET_SLOT_2`: BLOCKER 0, MAJOR 7, MINOR 0

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
