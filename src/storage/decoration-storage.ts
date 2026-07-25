import {
  ROOM_SLOT_IDS,
  STUDIO_001_SLOTS,
  roomItemDefinition,
} from '../constants/room-definitions';
import { DEFAULT_DECORATION_IDS, SHOP_ITEMS } from '../constants/shop-items';
import type {
  DecorationState,
  RoomPosition,
  RoomState,
  ShopItem,
} from '../models/decoration';
import type { StorageDriver } from './record-storage';

const DECORATION_KEY = 'better-than-yesterday:decoration:v1';
const DECORATION_BACKUP_KEY = 'better-than-yesterday:decoration:backup:v1';
export const DEFAULT_ROOM_POSITIONS = {} as Partial<
  Record<ShopItem['slot'], RoomPosition>
>;

function emptyRoomState(timestamp: string): RoomState {
  const slots = Object.fromEntries(
    ROOM_SLOT_IDS.map((id) => [id, null]),
  ) as RoomState['slots'];
  slots.BED_SLOT = 'bed-basic';
  slots.DESK_SLOT = 'desk-basic';
  slots.CHAIR_SLOT = 'chair-cushion';
  slots.SHELF_SLOT = 'shelf-basic';
  return {
    roomId: 'studio_001',
    slots,
    updatedAt: timestamp,
  };
}

export function createDefaultDecorationState(
  now = new Date(),
): DecorationState {
  const timestamp = now.toISOString();
  const defaults = SHOP_ITEMS.filter((item) => item.isDefault);
  return {
    owned: defaults.map((item) => ({
      itemId: item.id,
      acquiredAt: timestamp,
      acquisitionType: 'DEFAULT',
    })),
    equipped: Object.fromEntries(
      defaults
        .filter((item) => !roomItemDefinition(item.id))
        .map((item) => [item.slot, item.id]),
    ),
    roomPositions: {},
    roomState: emptyRoomState(timestamp),
    purchases: [],
    updatedAt: timestamp,
  };
}

function normalizeState(value: unknown): DecorationState | null {
  if (!value || typeof value !== 'object') return null;
  const state = value as Partial<DecorationState> & {
    placedRoomItems?: { itemId?: string }[];
  };
  if (
    !Array.isArray(state.owned) ||
    !Array.isArray(state.purchases) ||
    !state.equipped
  )
    return null;
  const defaults = createDefaultDecorationState();
  const validIds = new Set(SHOP_ITEMS.map((item) => item.id));
  const savedOwned = state.owned.filter(
    (item) => item && validIds.has(item.itemId),
  );
  const owned = [
    ...defaults.owned.filter(
      (item) => !savedOwned.some((saved) => saved.itemId === item.itemId),
    ),
    ...savedOwned,
  ];
  const ownedIds = new Set([
    ...DEFAULT_DECORATION_IDS,
    ...owned.map((item) => item.itemId),
  ]);
  const slots = { ...defaults.roomState.slots };
  const rawSlots = state.roomState?.slots;
  if (rawSlots) {
    for (const slotId of ROOM_SLOT_IDS) {
      const itemId = rawSlots[slotId];
      const definition =
        typeof itemId === 'string' ? roomItemDefinition(itemId) : undefined;
      if (
        itemId === null ||
        (definition?.slotId === slotId && ownedIds.has(itemId))
      )
        slots[slotId] = itemId;
    }
  } else if (Array.isArray(state.placedRoomItems)) {
    for (const placed of state.placedRoomItems) {
      const definition =
        typeof placed?.itemId === 'string'
          ? roomItemDefinition(placed.itemId)
          : undefined;
      if (definition && ownedIds.has(definition.id))
        slots[definition.slotId] = definition.id;
    }
  }
  const timestamp =
    typeof state.updatedAt === 'string' ? state.updatedAt : defaults.updatedAt;
  return {
    owned,
    equipped: Object.fromEntries(
      Object.entries({ ...defaults.equipped, ...state.equipped }).filter(
        ([, id]) => typeof id === 'string' && ownedIds.has(id),
      ),
    ),
    roomPositions: state.roomPositions ?? {},
    roomState: {
      roomId: 'studio_001',
      slots,
      updatedAt: state.roomState?.updatedAt ?? timestamp,
    },
    purchases: state.purchases.filter(
      (item) => item && validIds.has(item.itemId) && item.amount < 0,
    ),
    updatedAt: timestamp,
  };
}

export async function loadDecorationState(
  driver: StorageDriver,
): Promise<DecorationState> {
  const value = await driver.getItem(DECORATION_KEY);
  if (!value) return createDefaultDecorationState();
  try {
    const state = normalizeState(JSON.parse(value));
    if (state) return state;
  } catch {
    /* backup */
  }
  const backup = await driver.getItem(DECORATION_BACKUP_KEY);
  if (backup)
    try {
      const state = normalizeState(JSON.parse(backup));
      if (state) return state;
    } catch {
      /* fail */
    }
  throw new Error('저장된 꾸미기 정보와 백업을 읽을 수 없어요.');
}

export async function saveDecorationState(
  state: DecorationState,
  driver: StorageDriver,
) {
  const current = await driver.getItem(DECORATION_KEY);
  if (current)
    try {
      if (normalizeState(JSON.parse(current)))
        await driver.setItem(DECORATION_BACKUP_KEY, current);
    } catch {
      /* preserve backup */
    }
  await driver.setItem(DECORATION_KEY, JSON.stringify(state));
}

export function purchaseDecoration(
  state: DecorationState,
  item: ShopItem,
  balance: number,
  now = new Date(),
): DecorationState {
  if (state.owned.some((owned) => owned.itemId === item.id))
    throw new Error('이미 가지고 있는 아이템이에요.');
  if (item.price <= 0) throw new Error('기본 아이템은 구매할 필요가 없어요.');
  if (balance < item.price) throw new Error('기록 조각이 부족해요.');
  const timestamp = now.toISOString();
  return {
    ...state,
    owned: [
      ...state.owned,
      { itemId: item.id, acquiredAt: timestamp, acquisitionType: 'PURCHASE' },
    ],
    purchases: [
      ...state.purchases,
      {
        id: `purchase:${item.id}`,
        itemId: item.id,
        amount: -item.price,
        createdAt: timestamp,
      },
    ],
    updatedAt: timestamp,
  };
}

export function equipDecoration(
  state: DecorationState,
  item: ShopItem,
  now = new Date(),
): DecorationState {
  if (!state.owned.some((owned) => owned.itemId === item.id))
    throw new Error('보유한 아이템만 적용할 수 있어요.');
  if (roomItemDefinition(item.id)) return state;
  return {
    ...state,
    equipped: { ...state.equipped, [item.slot]: item.id },
    updatedAt: now.toISOString(),
  };
}

export function purchaseOrEquipDecoration(
  state: DecorationState,
  item: ShopItem,
  balance: number,
  _position?: RoomPosition,
  now = new Date(),
): DecorationState {
  const next = state.owned.some((owned) => owned.itemId === item.id)
    ? state
    : purchaseDecoration(state, item, balance, now);
  return roomItemDefinition(item.id) ? next : equipDecoration(next, item, now);
}

export function saveRoomSlots(
  state: DecorationState,
  slots: RoomState['slots'],
  now = new Date(),
): DecorationState {
  const ownedIds = new Set(state.owned.map((item) => item.itemId));
  const normalized = { ...state.roomState.slots };
  for (const slotId of ROOM_SLOT_IDS) {
    const itemId = slots[slotId];
    if (itemId === null) {
      normalized[slotId] = null;
      continue;
    }
    const definition = roomItemDefinition(itemId);
    const slotCategory = STUDIO_001_SLOTS.find(
      (slot) => slot.id === slotId,
    )?.category;
    if (
      !definition ||
      (definition.slotId !== slotId && definition.category !== slotCategory) ||
      !ownedIds.has(itemId)
    )
      throw new Error('이 슬롯에 배치할 수 없는 아이템이에요.');
    normalized[slotId] = itemId;
  }
  const timestamp = now.toISOString();
  return {
    ...state,
    roomState: {
      roomId: 'studio_001',
      slots: normalized,
      updatedAt: timestamp,
    },
    updatedAt: timestamp,
  };
}

export function decorationSpent(state: DecorationState) {
  return -state.purchases.reduce((sum, item) => sum + item.amount, 0);
}
