import type { CheckInDraft, DailyRecord } from '../models/daily-record';

const RECORDS_KEY = 'better-than-yesterday:records:v1';
const RECORDS_BACKUP_KEY = 'better-than-yesterday:records:backup:v1';
const DRAFT_KEY = 'better-than-yesterday:draft:v1';

export interface StorageDriver {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

let writeQueue = Promise.resolve();

function enqueueWrite(operation: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(operation, operation);
  return writeQueue;
}

function parseRecordArray(value: string | null): DailyRecord[] | undefined {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return undefined;
    return parsed.filter(isDailyRecord);
  } catch {
    return undefined;
  }
}

function isDailyRecord(value: unknown): value is DailyRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<DailyRecord>;
  return (
    isNonEmptyString(record.id) &&
    isDateKey(record.date) &&
    isScore(record.mood) &&
    isScore(record.energy) &&
    isScore(record.focus) &&
    Array.isArray(record.activities) &&
    record.activities.length <= 3 &&
    record.activities.every(isNonEmptyString) &&
    isOptionalString(record.blocker) &&
    isOptionalString(record.improvement) &&
    isOptionalString(record.experimentCategory) &&
    isOptionalString(record.experiment) &&
    (record.oneLine === undefined ||
      (typeof record.oneLine === 'string' && record.oneLine.length <= 40)) &&
    isNonEmptyString(record.createdAt) &&
    isNonEmptyString(record.updatedAt)
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isNonEmptyString(value);
}

function isScore(value: unknown): value is DailyRecord['mood'] {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

export async function loadRecords(
  driver: StorageDriver,
): Promise<DailyRecord[]> {
  const primaryValue = await driver.getItem(RECORDS_KEY);
  if (!primaryValue) return [];
  const primary = parseRecordArray(primaryValue);
  if (primary) return primary.sort((a, b) => b.date.localeCompare(a.date));
  const backupValue = await driver.getItem(RECORDS_BACKUP_KEY);
  const records = backupValue ? parseRecordArray(backupValue) : undefined;
  if (!records) throw new Error('저장된 기록과 백업을 읽을 수 없어요.');
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveRecords(
  records: DailyRecord[],
  driver: StorageDriver,
): Promise<void> {
  await enqueueWrite(async () => {
    const current = await driver.getItem(RECORDS_KEY);
    if (current && parseRecordArray(current))
      await driver.setItem(RECORDS_BACKUP_KEY, current);
    await driver.setItem(RECORDS_KEY, JSON.stringify(records));
  });
}

export async function upsertRecord(
  records: DailyRecord[],
  input: Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>,
  now = new Date(),
): Promise<{ records: DailyRecord[]; record: DailyRecord }> {
  const existing = records.find((record) => record.date === input.date);
  const timestamp = now.toISOString();
  const record: DailyRecord = {
    ...input,
    oneLine: input.oneLine?.trim() || undefined,
    id: existing?.id ?? `${input.date}-${now.getTime().toString(36)}`,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  const next = [
    record,
    ...records.filter((item) => item.date !== input.date),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return { records: next, record };
}

export async function loadDraft(
  today: string,
  driver: StorageDriver,
): Promise<CheckInDraft | null> {
  const value = await driver.getItem(DRAFT_KEY);
  if (!value) return null;
  try {
    const draft = JSON.parse(value) as CheckInDraft;
    if (
      draft.date !== today ||
      !Array.isArray(draft.activities) ||
      typeof draft.oneLine !== 'string'
    ) {
      await driver.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    await driver.removeItem(DRAFT_KEY);
    return null;
  }
}

export async function saveDraft(
  draft: CheckInDraft,
  driver: StorageDriver,
): Promise<void> {
  await enqueueWrite(() => driver.setItem(DRAFT_KEY, JSON.stringify(draft)));
}

export async function clearDraft(driver: StorageDriver): Promise<void> {
  await enqueueWrite(() => driver.removeItem(DRAFT_KEY));
}
