import type { RoomItemCategory, RoomSlotId } from '../models/decoration';
import { roomAssetSource } from './room-assets';

export interface RoomSlotDefinition {
  id: RoomSlotId;
  category?: RoomItemCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  anchor: 'bottomCenter';
}

export interface RoomItemDefinition {
  id: string;
  name: string;
  category: RoomItemCategory;
  slotId: RoomSlotId;
  assetId: string;
  price: number;
  renderOffsetX?: number;
  renderOffsetY?: number;
  scale?: number;
  symbol?: string;
  allowedSlotIds?: RoomSlotId[];
}

export const ROOM_SLOT_IDS: RoomSlotId[] = [
  'BED_SLOT',
  'DESK_SLOT',
  'CHAIR_SLOT',
  'SIDE_TABLE_SLOT',
  'RUG_SLOT',
  'FLOOR_LAMP_SLOT',
  'PLANT_SLOT_1',
  'PLANT_SLOT_2',
  'WALL_DECOR_SLOT',
  'SHELF_SLOT',
  'APPLIANCE_SLOT',
  'WALL_ART_SLOT',
  'DESK_DRINK_SLOT',
  'PET_SLOT',
  'PET_SLOT_2',
];

export const STUDIO_001_SLOTS: RoomSlotDefinition[] = [
  {
    id: 'RUG_SLOT',
    x: 384,
    y: 820,
    width: 430,
    height: 250,
    zIndex: 10,
    anchor: 'bottomCenter',
  },
  {
    id: 'BED_SLOT',
    category: 'BED',
    x: 545,
    y: 715,
    width: 300,
    height: 300,
    zIndex: 20,
    anchor: 'bottomCenter',
  },
  {
    id: 'DESK_SLOT',
    category: 'DESK',
    x: 270,
    y: 710,
    width: 350,
    height: 300,
    zIndex: 30,
    anchor: 'bottomCenter',
  },
  {
    id: 'DESK_DRINK_SLOT',
    category: 'DRINK',
    x: 350,
    y: 525,
    width: 65,
    height: 65,
    zIndex: 37,
    anchor: 'bottomCenter',
  },
  {
    id: 'SIDE_TABLE_SLOT',
    category: 'PLANT',
    x: 180,
    y: 537,
    width: 105,
    height: 120,
    zIndex: 35,
    anchor: 'bottomCenter',
  },
  {
    id: 'CHAIR_SLOT',
    category: 'CHAIR',
    x: 338,
    y: 752,
    width: 172,
    height: 224,
    zIndex: 40,
    anchor: 'bottomCenter',
  },
  {
    id: 'WALL_ART_SLOT',
    category: 'WALL_ART',
    x: 535,
    y: 410,
    width: 125,
    height: 150,
    zIndex: 69,
    anchor: 'bottomCenter',
  },
  {
    id: 'FLOOR_LAMP_SLOT',
    category: 'PLANT',
    x: 606,
    y: 457,
    width: 72,
    height: 86,
    zIndex: 73,
    anchor: 'bottomCenter',
  },
  {
    id: 'PLANT_SLOT_1',
    category: 'PLANT',
    x: 152,
    y: 711,
    width: 130,
    height: 175,
    zIndex: 50,
    anchor: 'bottomCenter',
  },
  {
    id: 'PLANT_SLOT_2',
    category: 'PLANT',
    x: 325,
    y: 460,
    width: 105,
    height: 125,
    zIndex: 51,
    anchor: 'bottomCenter',
  },
  {
    id: 'PET_SLOT',
    category: 'PET',
    x: 208,
    y: 822,
    width: 122,
    height: 142,
    zIndex: 52,
    anchor: 'bottomCenter',
  },
  {
    id: 'PET_SLOT_2',
    category: 'PET',
    x: 545,
    y: 858,
    width: 132,
    height: 148,
    zIndex: 53,
    anchor: 'bottomCenter',
  },
  {
    id: 'WALL_DECOR_SLOT',
    category: 'CURTAIN',
    x: 250,
    y: 535,
    width: 270,
    height: 390,
    zIndex: 70,
    anchor: 'bottomCenter',
  },
  {
    id: 'SHELF_SLOT',
    category: 'SHELF',
    x: 575,
    y: 500,
    width: 225,
    height: 150,
    zIndex: 71,
    anchor: 'bottomCenter',
  },
  {
    id: 'APPLIANCE_SLOT',
    category: 'BOOKCASE',
    x: 648,
    y: 750,
    width: 128,
    height: 154,
    zIndex: 32,
    anchor: 'bottomCenter',
  },
];

export const ROOM_ITEMS: RoomItemDefinition[] = [
  {
    id: 'bed-basic',
    name: '포근한 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-basic',
    price: 0,
  },
  {
    id: 'bed-mint',
    name: '민트 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-mint',
    price: 420,
  },
  {
    id: 'bed-rose',
    name: '로즈 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-rose',
    price: 480,
  },
  {
    id: 'bed-sky',
    name: '하늘 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-sky',
    price: 480,
  },
  {
    id: 'bed-princess',
    name: '공주님 캐노피 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-princess',
    price: 900,
    scale: 1.08,
  },
  {
    id: 'bed-canopy-lavender',
    name: '라벤더 캐노피 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-canopy-lavender',
    price: 980,
  },
  {
    id: 'bed-sleigh-navy',
    name: '딥블루 슬레이 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-sleigh-navy',
    price: 760,
  },
  {
    id: 'bed-iron-sage',
    name: '세이지 철제 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-iron-sage',
    price: 680,
  },
  {
    id: 'bed-upholstered-wine',
    name: '와인 패브릭 침대',
    category: 'BED',
    slotId: 'BED_SLOT',
    assetId: 'bed-upholstered-wine',
    price: 820,
  },
  {
    id: 'desk-basic',
    name: '나무 책상',
    category: 'DESK',
    slotId: 'DESK_SLOT',
    assetId: 'desk-basic',
    price: 0,
  },
  {
    id: 'desk-cream',
    name: '크림 책상',
    category: 'DESK',
    slotId: 'DESK_SLOT',
    assetId: 'desk-cream',
    price: 360,
  },
  {
    id: 'desk-walnut-drawers',
    name: '월넛 서랍 책상',
    category: 'DESK',
    slotId: 'DESK_SLOT',
    assetId: 'desk-walnut-drawers',
    price: 520,
  },
  {
    id: 'desk-sage',
    name: '세이지 책상',
    category: 'DESK',
    slotId: 'DESK_SLOT',
    assetId: 'desk-sage',
    price: 460,
  },
  {
    id: 'desk-rattan',
    name: '라탄 책상',
    category: 'DESK',
    slotId: 'DESK_SLOT',
    assetId: 'desk-rattan',
    price: 580,
  },
  {
    id: 'chair-cushion',
    name: '쿠션 의자',
    category: 'CHAIR',
    slotId: 'CHAIR_SLOT',
    assetId: 'chair-cushion',
    price: 0,
  },
  {
    id: 'chair-mint',
    name: '민트 의자',
    category: 'CHAIR',
    slotId: 'CHAIR_SLOT',
    assetId: 'chair-mint',
    price: 240,
  },
  {
    id: 'chair-walnut',
    name: '월넛 의자',
    category: 'CHAIR',
    slotId: 'CHAIR_SLOT',
    assetId: 'chair-walnut',
    price: 320,
  },
  {
    id: 'chair-lavender',
    name: '라벤더 의자',
    category: 'CHAIR',
    slotId: 'CHAIR_SLOT',
    assetId: 'chair-lavender',
    price: 340,
  },
  {
    id: 'chair-rattan-blue',
    name: '블루 라탄 의자',
    category: 'CHAIR',
    slotId: 'CHAIR_SLOT',
    assetId: 'chair-rattan-blue',
    price: 390,
  },
  {
    id: 'plant-pothos',
    name: '포토스 화분',
    category: 'PLANT',
    slotId: 'PLANT_SLOT_1',
    assetId: 'plant-pothos',
    price: 0,
    allowedSlotIds: [
      'PLANT_SLOT_1',
      'PLANT_SLOT_2',
      'SIDE_TABLE_SLOT',
      'FLOOR_LAMP_SLOT',
    ],
  },
  {
    id: 'plant-olive',
    name: '올리브 화분',
    category: 'PLANT',
    slotId: 'PLANT_SLOT_1',
    assetId: 'plant-olive',
    price: 280,
    allowedSlotIds: ['PLANT_SLOT_1'],
  },
  {
    id: 'plant-succulent',
    name: '다육이 화분',
    category: 'PLANT',
    slotId: 'PLANT_SLOT_1',
    assetId: 'plant-succulent',
    price: 180,
    scale: 0.72,
    allowedSlotIds: [
      'PLANT_SLOT_1',
      'PLANT_SLOT_2',
      'SIDE_TABLE_SLOT',
      'FLOOR_LAMP_SLOT',
    ],
  },
  {
    id: 'plant-fern',
    name: '풍성한 고사리',
    category: 'PLANT',
    slotId: 'PLANT_SLOT_1',
    assetId: 'plant-fern',
    price: 340,
    scale: 1.05,
    allowedSlotIds: ['PLANT_SLOT_1'],
  },
  {
    id: 'plant-fiddle',
    name: '키 큰 떡갈고무나무',
    category: 'PLANT',
    slotId: 'PLANT_SLOT_1',
    assetId: 'plant-fiddle',
    price: 420,
    scale: 1.15,
    allowedSlotIds: ['PLANT_SLOT_1'],
  },
  {
    id: 'shelf-basic',
    name: '작은 벽 선반',
    category: 'SHELF',
    slotId: 'SHELF_SLOT',
    assetId: 'shelf-basic',
    price: 0,
  },
  {
    id: 'shelf-walnut',
    name: '월넛 벽 선반',
    category: 'SHELF',
    slotId: 'SHELF_SLOT',
    assetId: 'shelf-walnut',
    price: 280,
  },
  {
    id: 'shelf-cream',
    name: '크림 벽 선반',
    category: 'SHELF',
    slotId: 'SHELF_SLOT',
    assetId: 'shelf-cream',
    price: 260,
  },
  {
    id: 'shelf-sage',
    name: '세이지 벽 선반',
    category: 'SHELF',
    slotId: 'SHELF_SLOT',
    assetId: 'shelf-sage',
    price: 300,
  },
  {
    id: 'shelf-navy',
    name: '네이비 벽 선반',
    category: 'SHELF',
    slotId: 'SHELF_SLOT',
    assetId: 'shelf-navy',
    price: 340,
  },
  {
    id: 'rug-round',
    name: '크림 원형 러그',
    category: 'RUG',
    slotId: 'RUG_SLOT',
    assetId: 'rug-round',
    price: 180,
    symbol: '◯',
  },
  {
    id: 'curtain-linen',
    name: '린넨 커튼',
    category: 'CURTAIN',
    slotId: 'WALL_DECOR_SLOT',
    assetId: 'curtain-linen',
    price: 220,
    symbol: '🪟',
  },
  {
    id: 'bookcase-small',
    name: '작은 책장',
    category: 'BOOKCASE',
    slotId: 'APPLIANCE_SLOT',
    assetId: 'bookcase-small',
    price: 300,
    symbol: '📚',
  },
  {
    id: 'wall-calendar',
    name: '포근한 달력',
    category: 'WALL_ART',
    slotId: 'WALL_ART_SLOT',
    assetId: 'wall-calendar',
    price: 160,
  },
  {
    id: 'wall-poster',
    name: '보태니컬 포스터',
    category: 'WALL_ART',
    slotId: 'WALL_ART_SLOT',
    assetId: 'wall-poster',
    price: 200,
  },
  {
    id: 'drink-coffee',
    name: '따뜻한 커피',
    category: 'DRINK',
    slotId: 'DESK_DRINK_SLOT',
    assetId: 'drink-coffee',
    price: 100,
  },
  {
    id: 'drink-beer',
    name: '시원한 캔맥주',
    category: 'DRINK',
    slotId: 'DESK_DRINK_SLOT',
    assetId: 'drink-beer',
    price: 140,
    scale: 0.82,
  },
  {
    id: 'drink-barley',
    name: '얼음 보리차',
    category: 'DRINK',
    slotId: 'DESK_DRINK_SLOT',
    assetId: 'drink-barley',
    price: 120,
  },
  {
    id: 'pet-cat',
    name: '창가 고양이',
    category: 'PET',
    slotId: 'PET_SLOT',
    assetId: 'pet-cat-floor',
    price: 500,
    symbol: '🐈',
    allowedSlotIds: ['PET_SLOT'],
  },
  {
    id: 'pet-dog',
    name: '포근한 강아지',
    category: 'PET',
    slotId: 'PET_SLOT_2',
    assetId: 'pet-dog-floor',
    price: 650,
    symbol: '🐕',
    allowedSlotIds: ['PET_SLOT_2'],
  },
  {
    id: 'pet-cat-gray',
    name: '회색 줄무늬 고양이',
    category: 'PET',
    slotId: 'PET_SLOT',
    assetId: 'pet-cat-gray-floor',
    price: 550,
    symbol: '🐈',
    allowedSlotIds: ['PET_SLOT'],
  },
  {
    id: 'pet-dog-brown',
    name: '초콜릿 강아지',
    category: 'PET',
    slotId: 'PET_SLOT_2',
    assetId: 'pet-dog-brown-floor',
    price: 700,
    symbol: '🐕',
    allowedSlotIds: ['PET_SLOT_2'],
  },
];

export const ROOM_EDIT_CATEGORIES: { id: RoomItemCategory; label: string }[] = [
  { id: 'BED', label: '침대' },
  { id: 'DESK', label: '책상' },
  { id: 'CHAIR', label: '의자' },
  { id: 'SHELF', label: '선반' },
  { id: 'RUG', label: '러그' },
  { id: 'CURTAIN', label: '커튼' },
  { id: 'BOOKCASE', label: '책장' },
  { id: 'WALL_ART', label: '벽 장식' },
  { id: 'DRINK', label: '음료' },
  { id: 'PLANT', label: '식물' },
  { id: 'PET', label: '반려동물' },
];

export const STUDIO_001 = {
  id: 'studio_001' as const,
  name: '작은 원룸',
  designWidth: 768,
  designHeight: 1024,
  slots: STUDIO_001_SLOTS,
};

export function roomItemDefinition(itemId: string) {
  return ROOM_ITEMS.find((item) => item.id === itemId);
}
export function roomSlotDefinition(slotId: RoomSlotId) {
  return STUDIO_001_SLOTS.find((slot) => slot.id === slotId);
}
export function roomItemAsset(itemId: string, slotId?: RoomSlotId) {
  const item = roomItemDefinition(itemId);
  if (!item) return undefined;
  if (item.category === 'PLANT') {
    if (
      item.id === 'plant-olive' ||
      item.id === 'plant-succulent' ||
      item.id === 'plant-fern' ||
      item.id === 'plant-fiddle'
    ) {
      return roomAssetSource(item.assetId);
    }
    const slotAssets: Partial<Record<RoomSlotId, string>> = {
      SIDE_TABLE_SLOT: 'plant-desk',
      FLOOR_LAMP_SLOT: 'plant-shelf',
      PLANT_SLOT_2: 'plant-window',
      PLANT_SLOT_1: 'plant-floor',
    };
    return roomAssetSource(slotAssets[slotId ?? item.slotId] ?? item.assetId);
  }
  return roomAssetSource(item.assetId);
}

export function canPlaceRoomItem(item: RoomItemDefinition, slotId: RoomSlotId) {
  if (item.allowedSlotIds) return item.allowedSlotIds.includes(slotId);
  const slot = roomSlotDefinition(slotId);
  return item.slotId === slotId || item.category === slot?.category;
}
