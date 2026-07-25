import type { DailyRecord } from '../models/daily-record';
import type { StorageDriver } from './record-storage';
import {
  calculateWallet,
  claimMonthlyMilestone,
  loadRewardTransactions,
  reconcileRecordRewards,
  saveRewardTransactions,
} from './reward-storage';

function memoryDriver(): StorageDriver & { values: Map<string, string> } {
  const values = new Map<string, string>();
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

const record: DailyRecord = {
  id: 'record-1',
  date: '2026-07-17',
  mood: 3,
  energy: 3,
  focus: 3,
  activities: [],
  oneLine: '오늘도 기록했다',
  createdAt: '2026-07-17T10:00:00.000Z',
  updatedAt: '2026-07-17T10:00:00.000Z',
};

describe('reward storage', () => {
  it('첫 기록과 한 줄에 12조각을 한 번만 지급한다', () => {
    const first = reconcileRecordRewards([record], []);
    expect(first.added.map((item) => item.amount)).toEqual([10, 2]);
    const repeated = reconcileRecordRewards([record], first.transactions);
    expect(repeated.added).toEqual([]);
    expect(calculateWallet(repeated.transactions).balance).toBe(12);
  });

  it('기존 기록에 한 줄을 나중에 추가하면 한 줄 보너스만 추가한다', () => {
    const withoutLine = reconcileRecordRewards(
      [{ ...record, oneLine: undefined }],
      [],
    );
    const withLine = reconcileRecordRewards([record], withoutLine.transactions);
    expect(withLine.added).toHaveLength(1);
    expect(withLine.added[0]?.type).toBe('ONE_LINE_BONUS');
  });

  it('달성한 이번 달 단계 보상만 한 번 수령한다', () => {
    const now = new Date('2026-07-20T10:00:00.000Z');
    const claimed = claimMonthlyMilestone([], '2026-07', 5, 5, now);
    expect(claimed.reward.amount).toBe(30);
    expect(() =>
      claimMonthlyMilestone(claimed.transactions, '2026-07', 5, 5, now),
    ).toThrow('이미 받은 보상이에요.');
    expect(() => claimMonthlyMilestone([], '2026-07', 4, 5, now)).toThrow(
      '아직 보상 조건을 달성하지 못했어요.',
    );
  });

  it('지난달 단계 보상은 수령하지 않는다', () => {
    expect(() =>
      claimMonthlyMilestone(
        [],
        '2026-06',
        25,
        25,
        new Date('2026-07-20T10:00:00.000Z'),
      ),
    ).toThrow('지난달 보상은 수령할 수 없어요.');
  });

  it('금액이나 식별자가 변조된 거래는 잔액에 포함하지 않는다', async () => {
    const getItem = jest.fn().mockResolvedValue(
      JSON.stringify([
        {
          id: 'DAILY_RECORD_REWARD:record-1',
          type: 'DAILY_RECORD_REWARD',
          amount: 999999,
          reason: '변조',
          referenceId: 'record-1',
          createdAt: '2026-07-17T10:00:00.000Z',
        },
        {
          id: 'wrong-id',
          type: 'MONTHLY_MILESTONE_REWARD',
          amount: 30,
          reason: '변조',
          referenceId: '2026-07:5',
          createdAt: '2026-07-17T10:00:00.000Z',
        },
      ]),
    );
    const loaded = await loadRewardTransactions({
      getItem,
      setItem: jest.fn(),
      removeItem: jest.fn(),
    });
    expect(loaded).toEqual([]);
    expect(calculateWallet(loaded).balance).toBe(0);
  });

  it('거래 id가 변조돼도 같은 월간 단계 reference는 중복 수령하지 않는다', () => {
    expect(() =>
      claimMonthlyMilestone(
        [
          {
            id: 'changed-id',
            type: 'MONTHLY_MILESTONE_REWARD',
            amount: 30,
            reason: '월 5회 기록 달성',
            referenceId: '2026-07:5',
            createdAt: '2026-07-17T10:00:00.000Z',
          },
        ],
        '2026-07',
        5,
        5,
        new Date('2026-07-20T10:00:00.000Z'),
      ),
    ).toThrow('이미 받은 보상이에요.');
  });

  it('보상 데이터가 손상되면 직전 백업을 복구한다', async () => {
    const driver = memoryDriver();
    const transactions = reconcileRecordRewards([record], []).transactions;
    await saveRewardTransactions(transactions, driver);
    await saveRewardTransactions([...transactions], driver);
    driver.values.set('better-than-yesterday:rewards:v1', '{broken');
    await expect(loadRewardTransactions(driver)).resolves.toEqual(transactions);
  });
});
