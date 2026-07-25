import {
  ROOM_ITEMS,
  STUDIO_001_SLOTS,
  canPlaceRoomItem,
  roomItemAsset,
  roomItemDefinition,
} from './room-definitions';

describe('fixed room slots', () => {
  it('keeps tall floor plants off furniture', () => {
    const fern = roomItemDefinition('plant-fern');
    const fiddle = roomItemDefinition('plant-fiddle');

    expect(fern && canPlaceRoomItem(fern, 'PLANT_SLOT_1')).toBe(true);
    expect(fern && canPlaceRoomItem(fern, 'FLOOR_LAMP_SLOT')).toBe(false);
    expect(fiddle && canPlaceRoomItem(fiddle, 'SIDE_TABLE_SLOT')).toBe(false);
  });

  it('allows small plants in all four plant positions', () => {
    const succulent = roomItemDefinition('plant-succulent');

    expect(succulent?.scale).toBe(1.3);
    for (const slotId of [
      'PLANT_SLOT_1',
      'PLANT_SLOT_2',
      'SIDE_TABLE_SLOT',
      'FLOOR_LAMP_SLOT',
    ] as const) {
      expect(succulent && canPlaceRoomItem(succulent, slotId)).toBe(true);
    }
  });

  it('fixes cats and dogs to separate floor slots', () => {
    const cat = roomItemDefinition('pet-cat');
    const dog = roomItemDefinition('pet-dog');

    expect(cat && canPlaceRoomItem(cat, 'PET_SLOT')).toBe(true);
    expect(cat && canPlaceRoomItem(cat, 'PET_SLOT_2')).toBe(false);
    expect(dog && canPlaceRoomItem(dog, 'PET_SLOT')).toBe(false);
    expect(dog && canPlaceRoomItem(dog, 'PET_SLOT_2')).toBe(true);
  });

  it('keeps pets and the bookcase inside the front floor boundary', () => {
    const slot = (id: string) =>
      STUDIO_001_SLOTS.find((candidate) => candidate.id === id);

    expect(slot('PET_SLOT')).toMatchObject({ x: 218, y: 822 });
    expect(slot('PET_SLOT_2')).toMatchObject({ x: 529, y: 828 });
    expect(slot('APPLIANCE_SLOT')).toMatchObject({ x: 634, y: 750 });
  });

  it('uses a shelf-specific plant asset without visit randomness', () => {
    const first = roomItemAsset('plant-pothos', 'FLOOR_LAMP_SLOT');
    const second = roomItemAsset('plant-pothos', 'FLOOR_LAMP_SLOT');

    expect(first).toEqual(second);
    expect(first).toBeDefined();
  });

  it('does not expose duplicate floor art for pothos and olive', () => {
    const pothos = ROOM_ITEMS.find((item) => item.id === 'plant-pothos');
    const olive = ROOM_ITEMS.find((item) => item.id === 'plant-olive');
    const pothosSource = roomItemAsset('plant-pothos', 'PLANT_SLOT_1');
    const oliveSource = roomItemAsset('plant-olive', 'PLANT_SLOT_1');

    expect(pothos?.assetId).not.toBe(olive?.assetId);
    expect(pothosSource).not.toEqual(oliveSource);
  });

  it('adds four same-slot bed variants with distinct artwork', () => {
    const ids = [
      'bed-canopy-lavender',
      'bed-sleigh-navy',
      'bed-iron-sage',
      'bed-upholstered-wine',
    ];
    const beds = ids.map((id) => roomItemDefinition(id));

    expect(beds.every((bed) => bed?.slotId === 'BED_SLOT')).toBe(true);
    expect(beds.every((bed) => bed?.scale === undefined)).toBe(true);
    expect(new Set(beds.map((bed) => bed?.assetId)).size).toBe(4);
    expect(beds.every((bed) => roomItemAsset(bed?.id ?? ''))).toBe(true);
  });

  it.each([
    ['BED', 'BED_SLOT', 5],
    ['DESK', 'DESK_SLOT', 5],
    ['CHAIR', 'CHAIR_SLOT', 5],
    ['SHELF', 'SHELF_SLOT', 5],
  ] as const)(
    '%s offers at least five fixed-slot variants',
    (category, slotId, minimum) => {
      const items = ROOM_ITEMS.filter((item) => item.category === category);

      expect(items.length).toBeGreaterThanOrEqual(minimum);
      expect(items.every((item) => item.slotId === slotId)).toBe(true);
      if (category !== 'BED') {
        expect(items.every((item) => item.scale === undefined)).toBe(true);
      }
      expect(new Set(items.map((item) => item.assetId)).size).toBe(
        items.length,
      );
      expect(items.every((item) => roomItemAsset(item.id))).toBe(true);
    },
  );
});
