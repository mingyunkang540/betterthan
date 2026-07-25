import {
  ROOM_ITEMS,
  ROOM_SLOT_IDS,
  STUDIO_001,
} from '../constants/room-definitions';

describe('fixed room slots', () => {
  it('defines every slot once inside the design canvas', () => {
    expect(new Set(STUDIO_001.slots.map((slot) => slot.id))).toEqual(
      new Set(ROOM_SLOT_IDS),
    );
    expect(
      STUDIO_001.slots.every(
        (slot) => slot.x >= 0 && slot.x <= 768 && slot.y >= 0 && slot.y <= 1024,
      ),
    ).toBe(true);
  });

  it('provides at least two selectable items for each initial category', () => {
    for (const category of ['BED', 'DESK', 'CHAIR', 'PLANT'])
      expect(
        ROOM_ITEMS.filter((item) => item.category === category).length,
      ).toBeGreaterThanOrEqual(2);
  });
});
