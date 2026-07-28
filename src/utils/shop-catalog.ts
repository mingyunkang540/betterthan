import { ROOM_ITEMS } from '../constants/room-definitions';
import type { DecorationCategory, ShopItem } from '../models/decoration';

export type ShopTab =
  | 'diary'
  | 'furniture'
  | 'coffee'
  | 'plant'
  | 'pet'
  | 'roomTheme';

export const SHOP_TABS: { id: ShopTab; label: string }[] = [
  { id: 'diary', label: '일기' },
  { id: 'furniture', label: '방 아이템' },
  { id: 'roomTheme', label: '방 색상' },
];

const DIARY_CATEGORIES: DecorationCategory[] = ['sticker', 'tape', 'cover'];

export function itemsForShopTab(items: ShopItem[], tab: ShopTab): ShopItem[] {
  if (tab === 'furniture')
    return items.filter((item) =>
      ROOM_ITEMS.some((roomItem) => roomItem.id === item.id),
    );
  if (tab === 'roomTheme')
    return items.filter((item) => item.category === 'roomTheme');
  if (tab !== 'diary') return [];
  return items.filter(
    (item) =>
      !item.isDefault &&
      (tab === 'diary'
        ? DIARY_CATEGORIES.includes(item.category)
        : item.category === tab),
  );
}
