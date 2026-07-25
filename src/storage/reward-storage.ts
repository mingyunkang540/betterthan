import type { DailyRecord } from '../models/daily-record';
import type {
  MonthlyMilestone,
  RewardTransaction,
  RewardTransactionType,
  RewardWallet,
} from '../models/reward';
import { toLocalMonthKey } from '../utils/date';
import type { StorageDriver } from './record-storage';

const REWARDS_KEY = 'better-than-yesterday:rewards:v1';
const REWARDS_BACKUP_KEY = 'better-than-yesterday:rewards:backup:v1';

export const MONTHLY_MILESTONES: ReadonlyArray<{
  count: MonthlyMilestone;
  reward: number;
}> = [
  { count: 5, reward: 30 },
  { count: 10, reward: 70 },
  { count: 15, reward: 120 },
  { count: 20, reward: 180 },
  { count: 25, reward: 250 },
];

function isTransaction(value: unknown): value is RewardTransaction {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<RewardTransaction>;
  const basicValid =
    typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    [
      'DAILY_RECORD_REWARD',
      'ONE_LINE_BONUS',
      'MONTHLY_MILESTONE_REWARD',
    ].includes(item.type) &&
    typeof item.amount === 'number' &&
    Number.isFinite(item.amount) &&
    typeof item.reason === 'string' &&
    typeof item.referenceId === 'string' &&
    typeof item.createdAt === 'string';
  if (!basicValid) return false;

  const type = item.type as RewardTransactionType;
  const referenceId = item.referenceId as string;
  if (
    referenceId.length === 0 ||
    (type === 'MONTHLY_MILESTONE_REWARD' &&
      !/^\d{4}-\d{2}:(5|10|15|20|25)$/.test(referenceId))
  )
    return false;
  const expectedAmount =
    type === 'DAILY_RECORD_REWARD'
      ? 10
      : type === 'ONE_LINE_BONUS'
        ? 2
        : MONTHLY_MILESTONES.find(({ count }) =>
            referenceId.endsWith(`:${count}`),
          )?.reward;
  return (
    item.amount === expectedAmount &&
    item.id === transactionKey(type, referenceId)
  );
}

function transactionKey(type: RewardTransactionType, referenceId: string) {
  return `${type}:${referenceId}`;
}

function makeTransaction(
  type: RewardTransactionType,
  amount: number,
  reason: string,
  referenceId: string,
  createdAt: string,
): RewardTransaction {
  return {
    id: transactionKey(type, referenceId),
    type,
    amount,
    reason,
    referenceId,
    createdAt,
  };
}

export async function loadRewardTransactions(
  driver: StorageDriver,
): Promise<RewardTransaction[]> {
  const value = await driver.getItem(REWARDS_KEY);
  if (!value) return [];
  const primary = parseTransactions(value);
  if (primary) return primary;
  const backup = await driver.getItem(REWARDS_BACKUP_KEY);
  const recovered = backup ? parseTransactions(backup) : undefined;
  if (recovered) return recovered;
  throw new Error('저장된 보상 정보와 백업을 읽을 수 없어요.');
}

function parseTransactions(value: string): RewardTransaction[] | undefined {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return undefined;
    const unique = new Map<string, RewardTransaction>();
    for (const item of parsed.filter(isTransaction)) {
      unique.set(transactionKey(item.type, item.referenceId), item);
    }
    return [...unique.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  } catch {
    return undefined;
  }
}

export async function saveRewardTransactions(
  transactions: RewardTransaction[],
  driver: StorageDriver,
): Promise<void> {
  const current = await driver.getItem(REWARDS_KEY);
  if (current && parseTransactions(current))
    await driver.setItem(REWARDS_BACKUP_KEY, current);
  await driver.setItem(REWARDS_KEY, JSON.stringify(transactions));
}

export function reconcileRecordRewards(
  records: DailyRecord[],
  transactions: RewardTransaction[],
): { transactions: RewardTransaction[]; added: RewardTransaction[] } {
  const keys = new Set(
    transactions.map((item) => transactionKey(item.type, item.referenceId)),
  );
  const added: RewardTransaction[] = [];
  for (const record of records) {
    const dailyKey = transactionKey('DAILY_RECORD_REWARD', record.id);
    if (!keys.has(dailyKey)) {
      added.push(
        makeTransaction(
          'DAILY_RECORD_REWARD',
          10,
          '하루 기록 완료',
          record.id,
          record.createdAt,
        ),
      );
      keys.add(dailyKey);
    }
    const lineKey = transactionKey('ONE_LINE_BONUS', record.id);
    if (record.oneLine?.trim() && !keys.has(lineKey)) {
      added.push(
        makeTransaction(
          'ONE_LINE_BONUS',
          2,
          '오늘의 한 줄 작성',
          record.id,
          record.updatedAt,
        ),
      );
      keys.add(lineKey);
    }
  }
  return {
    transactions: [...added, ...transactions].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    added,
  };
}

export function claimMonthlyMilestone(
  transactions: RewardTransaction[],
  monthKey: string,
  recordCount: number,
  milestone: MonthlyMilestone,
  now = new Date(),
): { transactions: RewardTransaction[]; reward: RewardTransaction } {
  if (monthKey !== toLocalMonthKey(now))
    throw new Error('지난달 보상은 수령할 수 없어요.');
  const definition = MONTHLY_MILESTONES.find(
    (item) => item.count === milestone,
  );
  if (!definition || recordCount < milestone)
    throw new Error('아직 보상 조건을 달성하지 못했어요.');
  const referenceId = `${monthKey}:${milestone}`;
  const key = transactionKey('MONTHLY_MILESTONE_REWARD', referenceId);
  if (
    transactions.some(
      (item) => transactionKey(item.type, item.referenceId) === key,
    )
  )
    throw new Error('이미 받은 보상이에요.');
  const reward = makeTransaction(
    'MONTHLY_MILESTONE_REWARD',
    definition.reward,
    `월 ${milestone}회 기록 달성`,
    referenceId,
    now.toISOString(),
  );
  return { transactions: [reward, ...transactions], reward };
}

export function calculateWallet(
  transactions: RewardTransaction[],
): RewardWallet {
  const balance = transactions.reduce((sum, item) => sum + item.amount, 0);
  return {
    balance,
    totalEarned: transactions
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0),
  };
}
