/** Public release starts from earned record shards only. */
export const TESTER_REWARD_GRANT = 0;
export const TESTER_ROOM_ITEMS_UNLOCKED = TESTER_REWARD_GRANT > 0;

export function rewardBalanceWithTesterGrant(earned: number, spent: number) {
  return TESTER_REWARD_GRANT + earned - spent;
}
