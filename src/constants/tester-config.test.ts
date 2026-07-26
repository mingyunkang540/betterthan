import {
  TESTER_REWARD_GRANT,
  rewardBalanceWithTesterGrant,
} from './tester-config';

describe('public release balance', () => {
  it('starts without a tester shard grant', () => {
    expect(TESTER_REWARD_GRANT).toBe(0);
    expect(rewardBalanceWithTesterGrant(12, 5)).toBe(7);
  });
});
