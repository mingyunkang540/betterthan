import {
  TESTER_REWARD_GRANT,
  rewardBalanceWithTesterGrant,
} from './tester-config';

describe('private deployment tester balance', () => {
  it('starts testers with the maximum shard grant', () => {
    expect(TESTER_REWARD_GRANT).toBe(999_999);
    expect(rewardBalanceWithTesterGrant(12, 220)).toBe(999_791);
  });
});
