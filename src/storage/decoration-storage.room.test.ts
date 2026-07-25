import {
  createDefaultDecorationState,
  saveRoomSlots,
} from './decoration-storage';

describe('room state compatibility', () => {
  it('starts new users with removable starter furniture', () => {
    const state = createDefaultDecorationState(
      new Date('2026-07-25T00:00:00Z'),
    );

    expect(state.roomState.slots).toMatchObject({
      BED_SLOT: 'bed-basic',
      DESK_SLOT: 'desk-basic',
      CHAIR_SLOT: 'chair-cushion',
      SHELF_SLOT: 'shelf-basic',
    });
    expect(Object.values(state.roomState.slots).filter(Boolean)).toHaveLength(
      4,
    );
  });

  it('rejects a tall plant on the shelf slot', () => {
    const state = createDefaultDecorationState();
    state.owned.push({
      itemId: 'plant-fiddle',
      acquiredAt: state.updatedAt,
      acquisitionType: 'PURCHASE',
    });

    expect(() =>
      saveRoomSlots(state, {
        ...state.roomState.slots,
        FLOOR_LAMP_SLOT: 'plant-fiddle',
      }),
    ).toThrow('이 슬롯에 배치할 수 없는 아이템이에요.');
  });

  it('accepts a small plant on the shelf slot', () => {
    const state = createDefaultDecorationState();
    state.owned.push({
      itemId: 'plant-succulent',
      acquiredAt: state.updatedAt,
      acquisitionType: 'PURCHASE',
    });

    const next = saveRoomSlots(state, {
      ...state.roomState.slots,
      FLOOR_LAMP_SLOT: 'plant-succulent',
    });

    expect(next.roomState.slots.FLOOR_LAMP_SLOT).toBe('plant-succulent');
  });
});
