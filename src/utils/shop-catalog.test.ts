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
        'curtain-linen',
        'bookcase-small',
        'plant-pothos',
        'pet-cat',
        'pet-dog',
      ]),
    );
    expect(itemsForShopTab(SHOP_ITEMS, 'pet')).toEqual([]);
  });
});
