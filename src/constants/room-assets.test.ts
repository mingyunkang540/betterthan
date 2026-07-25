import { ROOM_BACKGROUND_SOURCE, roomAssetSource } from './room-assets';
import { ROOM_ITEMS, roomItemAsset } from './room-definitions';

describe('embedded room assets', () => {
  it('embeds the empty room background', () => {
    expect(ROOM_BACKGROUND_SOURCE).toEqual({
      uri: expect.stringMatching(/^data:image\/png;base64,/),
    });
  });

  it.each(ROOM_ITEMS)('embeds one fixed-view asset for $id', (item) => {
    const source = roomAssetSource(item.assetId);
    expect(source || item.symbol).toBeTruthy();
    if (source)
      expect(source).toEqual({
        uri: expect.stringMatching(/^data:image\/png;base64,/),
      });
  });

  it('embeds the fixed diary book layer', () => {
    expect(roomAssetSource('diary-book')).toEqual({
      uri: expect.stringMatching(/^data:image\/png;base64,/),
    });
  });

  it.each(['pet-cat', 'pet-dog', 'pet-cat-gray', 'pet-dog-brown'])(
    'provides four scene poses for %s',
    (itemId) => {
      const sources = [0, 1, 2, 3].map(
        (variant) =>
          (
            roomItemAsset(itemId, 'PET_SLOT', variant) as
              | { uri?: string }
              | undefined
          )?.uri,
      );
      expect(
        sources.every((source) => source?.startsWith('data:image/png;base64,')),
      ).toBe(true);
      expect(new Set(sources).size).toBe(4);
    },
  );
});
