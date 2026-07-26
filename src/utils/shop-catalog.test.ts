import { SHOP_ITEMS } from '../constants/shop-items';
import { itemsForShopTab } from './shop-catalog';

describe('itemsForShopTab', () => {
  it('uses the reduced public shop prices', () => {
    const price = (id: string) =>
      SHOP_ITEMS.find((item) => item.id === id)?.price;

    expect(price('sticker-coffee')).toBe(3);
    expect(price('bed-canopy-lavender')).toBe(98);
    expect(price('room-theme-rattan')).toBe(90);
    expect(
      SHOP_ITEMS.every(
        (item) =>
          Number.isInteger(item.price) && item.price >= 0 && item.price <= 98,
      ),
    ).toBe(true);
  });

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
