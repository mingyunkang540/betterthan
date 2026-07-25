export type RewardTransactionType =
  | 'DAILY_RECORD_REWARD'
  | 'ONE_LINE_BONUS'
  | 'MONTHLY_MILESTONE_REWARD';

export interface RewardTransaction {
  id: string;
  type: RewardTransactionType;
  amount: number;
  reason: string;
  referenceId: string;
  createdAt: string;
}

export type MonthlyMilestone = 5 | 10 | 15 | 20 | 25;

export interface RewardWallet {
  balance: number;
  totalEarned: number;
}
