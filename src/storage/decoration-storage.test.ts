import { SHOP_ITEMS } from '../constants/shop-items';
import {
  createDefaultDecorationState,
  loadDecorationState,
  purchaseOrEquipDecoration,
  saveRoomSlots,
} from './decoration-storage';

describe('decoration room slots', () => {
  it('starts with only the simple starter furniture', () => {
    const slots = createDefaultDecorationState().roomState.slots;
    expect(slots.BED_SLOT).toBe('bed-basic');
    expect(slots.DESK_SLOT).toBe('desk-basic');
    expect(slots.CHAIR_SLOT).toBe('chair-cushion');
    expect(slots.SHELF_SLOT).toBe('shelf-basic');
    expect(Object.values(slots).filter(Boolean)).toHaveLength(4);
  });

  it('saves, replaces, and clears a fixed slot', () => {
    const initial = createDefaultDecorationState();
    const placed = saveRoomSlots(initial, {
      ...initial.roomState.slots,
      BED_SLOT: 'bed-basic',
    });
    expect(placed.roomState.slots.BED_SLOT).toBe('bed-basic');
    expect(
      saveRoomSlots(placed, { ...placed.roomState.slots, BED_SLOT: null })
        .roomState.slots.BED_SLOT,
    ).toBeNull();
  });

  it('rejects an item in the wrong slot', () => {
    const initial = createDefaultDecorationState();
    expect(() =>
      saveRoomSlots(initial, {
        ...initial.roomState.slots,
        BED_SLOT: 'desk-basic',
      }),
    ).toThrow();
  });

  it('does not auto-place a purchased room item', () => {
    const initial = createDefaultDecorationState();
    const item = SHOP_ITEMS.find((candidate) => candidate.id === 'bed-mint');
    if (!item) throw new Error('bed-mint fixture is missing');
    const purchased = purchaseOrEquipDecoration(initial, item, 1000);
    expect(purchased.owned.some((owned) => owned.itemId === item.id)).toBe(
      true,
    );
    expect(purchased.roomState.slots).toEqual(initial.roomState.slots);
  });

  it('supports one floor plant slot and two pet slots', () => {
    const initial = createDefaultDecorationState();
    const owned = {
      ...initial,
      owned: [
        ...initial.owned,
        {
          itemId: 'pet-cat',
          acquiredAt: '2026-07-19T00:00:00.000Z',
          acquisitionType: 'PURCHASE' as const,
        },
        {
          itemId: 'pet-dog',
          acquiredAt: '2026-07-19T00:00:00.000Z',
          acquisitionType: 'PURCHASE' as const,
        },
      ],
    };
    const saved = saveRoomSlots(owned, {
      ...owned.roomState.slots,
      PLANT_SLOT_1: 'plant-pothos',
      PET_SLOT: 'pet-cat',
      PET_SLOT_2: 'pet-dog',
    });
    expect(saved.roomState.slots.PLANT_SLOT_1).toBe('plant-pothos');
    expect(saved.roomState.slots.PET_SLOT).toBe('pet-cat');
    expect(saved.roomState.slots.PET_SLOT_2).toBe('pet-dog');
  });

  it('keeps a completely emptied room empty after loading it again', async () => {
    const initial = createDefaultDecorationState();
    const emptied = saveRoomSlots(
      initial,
      Object.fromEntries(
        Object.keys(initial.roomState.slots).map((slotId) => [slotId, null]),
      ) as typeof initial.roomState.slots,
    );
    const values = new Map<string, string>([
      ['better-than-yesterday:decoration:v1', JSON.stringify(emptied)],
    ]);
    const loaded = await loadDecorationState({
      getItem: async (key) => values.get(key) ?? null,
      setItem: async (key, value) => {
        values.set(key, value);
      },
      removeItem: async (key) => {
        values.delete(key);
      },
    });
    expect(
      Object.values(loaded.roomState.slots).every((item) => item === null),
    ).toBe(true);
  });
});
