export type DecorationCategory =
  | 'sticker'
  | 'tape'
  | 'cover'
  | 'furniture'
  | 'coffee'
  | 'plant'
  | 'pet'
  | 'roomTheme';

export type DecorationSlot =
  | 'diarySticker'
  | 'diaryTape'
  | 'diaryCover'
  | 'roomFurniture'
  | 'roomCoffee'
  | 'roomPlant'
  | 'roomPet'
  | 'roomTheme';

export type RoomThemeId =
  | 'room-theme-wood'
  | 'room-theme-cream'
  | 'room-theme-walnut'
  | 'room-theme-sage'
  | 'room-theme-rattan';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: DecorationCategory;
  slot: DecorationSlot;
  price: number;
  symbol: string;
  color: string;
  isDefault?: boolean;
  gridSize?: { columns: number; rows: number };
}

export type RoomItemCategory =
  | 'BED'
  | 'DESK'
  | 'CHAIR'
  | 'SHELF'
  | 'RUG'
  | 'BOOKCASE'
  | 'WALL_ART'
  | 'DRINK'
  | 'PLANT'
  | 'PET';

export type RoomSlotId =
  | 'BED_SLOT'
  | 'DESK_SLOT'
  | 'CHAIR_SLOT'
  | 'SIDE_TABLE_SLOT'
  | 'RUG_SLOT'
  | 'FLOOR_LAMP_SLOT'
  | 'PLANT_SLOT_1'
  | 'PLANT_SLOT_2'
  | 'WALL_DECOR_SLOT'
  | 'SHELF_SLOT'
  | 'APPLIANCE_SLOT'
  | 'WALL_ART_SLOT'
  | 'DESK_DRINK_SLOT'
  | 'PET_SLOT'
  | 'PET_SLOT_2';

export interface OwnedDecoration {
  itemId: string;
  acquiredAt: string;
  acquisitionType: 'DEFAULT' | 'PURCHASE';
}

export interface PurchaseTransaction {
  id: string;
  itemId: string;
  amount: number;
  createdAt: string;
}

export interface RoomPosition {
  x: number;
  y: number;
}

export interface RoomState {
  roomId: 'studio_001';
  slots: Record<RoomSlotId, string | null>;
  updatedAt: string;
}

export interface RoomLayoutSnapshot {
  equipped: Partial<Record<DecorationSlot, string>>;
  roomPositions: Partial<Record<DecorationSlot, RoomPosition>>;
  roomState: RoomState;
}

export interface DecorationState {
  owned: OwnedDecoration[];
  equipped: Partial<Record<DecorationSlot, string>>;
  roomPositions: Partial<Record<DecorationSlot, RoomPosition>>;
  roomState: RoomState;
  purchases: PurchaseTransaction[];
  updatedAt: string;
}
