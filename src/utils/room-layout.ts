import type { DecorationSlot, RoomPosition } from '../models/decoration';

export function constrainRoomPosition(
  _slot: DecorationSlot,
  position: RoomPosition,
): RoomPosition {
  return {
    x: Math.max(0, Math.min(1, position.x)),
    y: Math.max(0, Math.min(1, position.y)),
  };
}
