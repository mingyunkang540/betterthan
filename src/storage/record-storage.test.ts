import { type DailyRecord, createEmptyDraft } from '../models/daily-record';
import {
  type StorageDriver,
  loadDraft,
  loadRecords,
  saveDraft,
  saveRecords,
  upsertRecord,
} from './record-storage';

function memoryDriver(
  initial: Record<string, string> = {},
): StorageDriver & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    values,
    async getItem(key) {
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      values.set(key, value);
    },
    async removeItem(key) {
      values.delete(key);
    },
  };
}

const baseRecord: DailyRecord = {
  id: 'record-1',
  date: '2026-07-17',
  mood: 3,
  energy: 3,
  focus: 3,
  activities: [],
  createdAt: '2026-07-17T00:00:00.000Z',
  updatedAt: '2026-07-17T00:00:00.000Z',
};

describe('record storage', () => {
  it('같은 날짜 기록을 추가하지 않고 기존 id로 갱신한다', async () => {
    const result = await upsertRecord(
      [baseRecord],
      { ...baseRecord, mood: 5, oneLine: '  좋은 하루  ' },
      new Date('2026-07-17T10:00:00.000Z'),
    );
    expect(result.records).toHaveLength(1);
    expect(result.record.id).toBe('record-1');
    expect(result.record.mood).toBe(5);
    expect(result.record.oneLine).toBe('좋은 하루');
    expect(result.record.createdAt).toBe(baseRecord.createdAt);
  });

  it('저장한 기록을 최신 날짜순으로 다시 읽는다', async () => {
    const driver = memoryDriver();
    const older = { ...baseRecord, id: 'older', date: '2026-07-16' };
    await saveRecords([older, baseRecord], driver);
    await expect(loadRecords(driver)).resolves.toEqual([baseRecord, older]);
  });

  it('오늘과 다른 날짜의 초안은 복구하지 않고 삭제한다', async () => {
    const driver = memoryDriver();
    await saveDraft(createEmptyDraft('2026-07-16'), driver);
    await expect(loadDraft('2026-07-17', driver)).resolves.toBeNull();
    expect(driver.values.size).toBe(0);
  });

  it('손상된 저장 데이터는 조용히 초기화하지 않고 오류를 알린다', async () => {
    const driver = memoryDriver({
      'better-than-yesterday:records:v1': '{broken',
    });
    await expect(loadRecords(driver)).rejects.toThrow('백업을 읽을 수 없어요');
  });

  it('기본 기록이 손상되면 직전 백업을 복구한다', async () => {
    const driver = memoryDriver();
    await saveRecords([baseRecord], driver);
    await saveRecords([{ ...baseRecord, mood: 5 }], driver);
    driver.values.set('better-than-yesterday:records:v1', '{broken');
    await expect(loadRecords(driver)).resolves.toEqual([baseRecord]);
  });

  it('배열 안의 불완전한 레코드는 제외한다', async () => {
    const driver = memoryDriver({
      'better-than-yesterday:records:v1': JSON.stringify([
        baseRecord,
        { id: 'broken' },
      ]),
    });
    await expect(loadRecords(driver)).resolves.toEqual([baseRecord]);
  });

  it('범위를 벗어난 점수와 잘못된 활동 데이터는 제외한다', async () => {
    const driver = memoryDriver({
      'better-than-yesterday:records:v1': JSON.stringify([
        baseRecord,
        { ...baseRecord, id: 'bad-score', mood: 6 },
        { ...baseRecord, id: 'bad-activity', activities: [null] },
        { ...baseRecord, id: 'bad-date', date: '2026/07/17' },
        { ...baseRecord, id: 'impossible-date', date: '2026-02-31' },
        {
          ...baseRecord,
          id: 'too-many-activities',
          activities: ['업무', '공부', '운동', '휴식'],
        },
        { ...baseRecord, id: 'too-long-line', oneLine: '가'.repeat(41) },
      ]),
    });
    await expect(loadRecords(driver)).resolves.toEqual([baseRecord]);
  });

  it('손상된 초안은 삭제하고 복구하지 않는다', async () => {
    const driver = memoryDriver({
      'better-than-yesterday:draft:v1': JSON.stringify({
        date: '2026-07-17',
        activities: '업무',
        oneLine: '',
      }),
    });
    await expect(loadDraft('2026-07-17', driver)).resolves.toBeNull();
    expect(driver.values.size).toBe(0);
  });

  it('새 기록과 수정 기록을 모두 최신 날짜순으로 유지한다', async () => {
    const older = { ...baseRecord, id: 'older', date: '2026-07-16' };
    const inserted = await upsertRecord(
      [older],
      { ...baseRecord, date: '2026-07-18', mood: 4 },
      new Date('2026-07-18T09:00:00.000Z'),
    );
    expect(inserted.records.map((item) => item.date)).toEqual([
      '2026-07-18',
      '2026-07-16',
    ]);

    const updated = await upsertRecord(
      inserted.records,
      { ...baseRecord, date: '2026-07-16', focus: 5 },
      new Date('2026-07-18T10:00:00.000Z'),
    );
    expect(updated.records.map((item) => item.date)).toEqual([
      '2026-07-18',
      '2026-07-16',
    ]);
    expect(updated.records[1]?.id).toBe('older');
    expect(updated.records[1]?.focus).toBe(5);
  });
});
