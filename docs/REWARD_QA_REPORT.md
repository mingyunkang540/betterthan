# UltraQA Report: 리워드와 월간 일기

## Goal and success criteria
- Goal: 리워드 지급·복구·월간 수령과 월간 일기 내보내기의 적대적 경계를 검증한다.
- Stop condition: 변조·중복·재시도·월 경계·과도한 저장값 테스트와 정적 검사·반복 테스트·양 플랫폼 빌드가 통과한다.
- Safety bounds applied: 로컬 저장 로직과 테스트만 변경하고 콘솔 업로드·실기기 조작·외부 전송은 수행하지 않았다.

## Scenario matrix

| ID | User/attacker model | Scenario | Command/harness | Expected signal | Actual result | Status | Evidence | Cleanup |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REWARD-01 | 정상 사용자 | 첫 기록과 한 줄 보상을 재실행 후 다시 계산 | Jest reward storage | 10+2, 재계산 추가 0 | 기대값 일치 | 통과 | `reward-storage.test.ts` | 영구 회귀 테스트 |
| REWARD-02 | 빠른 연속 입력 사용자 | 같은 월간 단계를 중복 수령 | Jest + 거래 ref 검증 | 두 번째 요청 거부 | `이미 받은 보상` | 통과 | `reward-storage.test.ts` | 영구 회귀 테스트 |
| REWARD-03 | 빠른 연속 입력 사용자 | 서로 다른 단계 수령 중 상태 덮어쓰기 | Context ref 동기화 + typecheck | 최신 원장을 기준으로 저장 | ref 기반 직렬 정합성 적용 | 통과 | `app-context.tsx` | 임시 파일 없음 |
| REWARD-04 | 손상 저장 상태 | 임의의 999999 보상 거래 주입 | Jest malformed JSON fixture | 잔액에서 제외 | 잔액 0 | 통과 | `reward-storage.test.ts` | 영구 회귀 테스트 |
| REWARD-05 | 변조 저장 상태 | 거래 id만 바꿔 월간 보상 재수령 | Jest forged id fixture | reference 기준 중복 차단 | 요청 거부 | 통과 | `reward-storage.test.ts` | 영구 회귀 테스트 |
| REWARD-06 | 저장 오류 후 재시도 사용자 | 기록 저장 성공·보상 저장 실패 후 재시도 | 상태 전이 코드 점검 + ref 보정 | 기존 기록 id 유지, 다음 실행 복구 | 오래된 records closure 제거 | 통과 | `app-context.tsx` | 임시 파일 없음 |
| RECORD-01 | 손상 저장 상태 | 2월 31일, 활동 4개, 41자 한 줄 | Jest record fixtures | 모두 제외 | 정상 레코드만 복구 | 통과 | `record-storage.test.ts` | 영구 회귀 테스트 |
| JOURNAL-01 | 일반 사용자 | 선택한 달만 날짜순 내보내기 | Jest formatter | 다른 달 제외, 날짜순 텍스트 | 기대값 일치 | 통과 | `monthly-journal.test.ts` | 영구 회귀 테스트 |
| JOURNAL-02 | 적대적 입력 사용자 | script·지시문처럼 보이는 한 줄 | Jest hostile string | 실행 없이 일반 텍스트 보존 | 원문 그대로 출력 | 통과 | `monthly-journal.test.ts` | 영구 회귀 테스트 |
| FLAKE-01 | 불안정 런타임 | 전체 테스트 3회 연속 실행 | `npm test -- --runInBand` ×3 | 세 번 모두 동일 성공 | 26/26 ×3 | 통과 | Jest 출력 | 생성물 없음 |
| BUILD-01 | 출시 빌드 | Android·iOS 두 RN 버전 번들 | `npm run build` (240초 제한) | exit 0, 오류·경고 0 | `.ait` 생성 | 통과 | deploymentId `019f706d-8e81-754a-bf3f-69e6e8d429d7` | 의도된 산출물 유지 |

## Commands run
- `[0] npm run lint` — 39개 파일 검사, 수정 후 재실행에서 변경 없음
- `[0] npm run typecheck` — TypeScript 오류 없음
- `[0] npm test -- --runInBand` ×3 — 각 실행 6 suites, 26 tests 통과
- `[0] npm run build` — Android/iOS, RN 0.84.0·0.72.6 빌드 성공

## Failures found
- 보상 원장의 금액·id 검증이 느슨해 손상 데이터가 큰 잔액으로 반영될 수 있었다.
- 월간 중복 검사가 `id`만 사용해 변조된 id의 동일 reference를 다시 받을 수 있었다.
- 기록 저장 후 보상 저장이 실패하면 재시도 시 오래된 records 상태로 새 id를 만들 가능성이 있었다.
- 저장 레코드가 실제 달력 날짜, 활동 최대 3개, 한 줄 40자 조건을 복구 시 검증하지 않았다.

## Fixes applied
- `src/storage/reward-storage.ts`: 거래 유형별 정확한 금액, 정규화 id, 월간 reference 형식 검증과 reference 기반 중복 차단
- `src/state/app-context.tsx`: records·reward ref를 사용한 최신 상태 커밋, 수령 저장 실패 시 영구 저장 원장 재동기화
- `src/storage/record-storage.ts`: 실제 달력 날짜, 활동 개수, 선택 문자열, 한 줄 길이 검증
- 관련 회귀 테스트 3개를 추가해 전체 테스트를 23개에서 26개로 확대

## Cleanup and rollback
- 임시 서버·테스트 harness·로그를 생성하지 않았다.
- `.omx` UltraQA 상태는 완료 후 CLI로 정리한다.
- `betterthan.ait`는 의도된 배포 산출물로 유지한다.

## Residual risks
- AppsInToss 네이티브 `Storage` 실패와 공유 시트는 Jest에서 실제 OS 동작을 재현하지 못한다.
- 실제 토스 앱에서 빠른 연속 터치, 앱 강제 종료, 메모 앱 공유 저장을 최종 확인해야 한다.
- 현재 폴더는 Git 저장소가 아니므로 dirty worktree 전후 비교는 수행할 수 없다.

## Evidence
- 테스트: 6 suites, 26 tests, 3회 연속 통과
- 빌드: Android/iOS 오류 0, 경고 0
- 산출물: `betterthan.ait`
