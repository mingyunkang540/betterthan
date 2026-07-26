import { SHOP_ITEMS } from '../constants/shop-items';
import { itemsForShopTab } from './shop-catalog';

describe('itemsForShopTab', () => {
  it('groups all purchasable diary decorations together', () => {
    const items = itemsForShopTab(SHOP_ITEMS, 'diary');
    expect(items.map((item) => item.id)).toEqual([
      'sticker-coffee',
      'sticker-book',
      'sticker-flower',
      'tape-forest',
      'tape-sky',
      'cover-forest',
      'cover-night',
    ]);
  });

  it('returns the fixed-slot room items', () => {
    expect(
      itemsForShopTab(SHOP_ITEMS, 'furniture').map((item) => item.id),
    ).toEqual(
      expect.arrayContaining([
        'bed-basic',
        'desk-basic',
        'chair-cushion',
        'shelf-basic',
        'rug-round',
        'bookcase-small',
        'plant-pothos',
        'pet-cat',
        'pet-dog',
      ]),
    );
    expect(itemsForShopTab(SHOP_ITEMS, 'pet')).toEqual([]);
  });

  it('returns all five room color themes in their own tab', () => {
    expect(
      itemsForShopTab(SHOP_ITEMS, 'roomTheme').map((item) => item.id),
    ).toEqual([
      'room-theme-wood',
      'room-theme-cream',
      'room-theme-walnut',
      'room-theme-sage',
      'room-theme-rattan',
    ]);
  });
});
