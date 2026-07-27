import { ROOM_BACKGROUND_SOURCE, roomAssetSource } from './room-assets';
import { ROOM_ITEMS, roomItemAsset } from './room-definitions';

describe('embedded room assets', () => {
  it('embeds the empty room background', () => {
    expect(ROOM_BACKGROUND_SOURCE).toEqual({
      uri: expect.stringMatching(/^data:image\/webp;base64,/),
    });
  });

  it.each(ROOM_ITEMS)('embeds one fixed-view asset for $id', (item) => {
    const source = roomAssetSource(item.assetId);
    expect(source || item.symbol).toBeTruthy();
    if (source)
      expect(source).toEqual({
        uri: expect.stringMatching(/^data:image\/webp;base64,/),
      });
  });

  it('embeds the fixed diary book layer', () => {
    expect(roomAssetSource('diary-book')).toEqual({
      uri: expect.stringMatching(/^data:image\/webp;base64,/),
    });
  });

  it.each(['pet-cat', 'pet-dog', 'pet-cat-gray', 'pet-dog-brown'])(
    'provides one stable floor pose for %s',
    (itemId) => {
      const first = roomItemAsset(itemId) as { uri?: string } | undefined;
      const second = roomItemAsset(itemId) as { uri?: string } | undefined;

      expect(first?.uri).toMatch(/^data:image\/webp;base64,/);
      expect(second).toEqual(first);
    },
  );
});
