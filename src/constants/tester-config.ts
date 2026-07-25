/**
 * Private deployment tester grant.
 * Set this to 0 before the public release after the production base amount is decided.
 */
export const TESTER_REWARD_GRANT = 999_999;
export const TESTER_ROOM_ITEMS_UNLOCKED = TESTER_REWARD_GRANT > 0;

export function rewardBalanceWithTesterGrant(earned: number, spent: number) {
  return TESTER_REWARD_GRANT + earned - spent;
}
