import type { ImageSourcePropType } from 'react-native';
import type { RoomThemeId } from '../models/decoration';
import { EMBEDDED_ROOM_ASSETS } from './embedded-room-assets.generated';

type EmbeddedRoomAssetId = Exclude<
  keyof typeof EMBEDDED_ROOM_ASSETS,
  'roomBackground'
>;

export const ROOM_BACKGROUND_SOURCE: ImageSourcePropType = {
  uri: EMBEDDED_ROOM_ASSETS.roomBackground,
};

export const DEFAULT_ROOM_THEME_ID: RoomThemeId = 'room-theme-wood';

export function roomBackgroundSource(
  themeId?: string,
): ImageSourcePropType {
  if (
    themeId &&
    themeId !== DEFAULT_ROOM_THEME_ID &&
    themeId in EMBEDDED_ROOM_ASSETS
  )
    return {
      uri: EMBEDDED_ROOM_ASSETS[
        themeId as Exclude<RoomThemeId, 'room-theme-wood'>
      ],
    };
  return ROOM_BACKGROUND_SOURCE;
}

export const ROOM_SCENE_ASPECT_RATIO = 3 / 4;
export const ROOM_BACKGROUND_HEIGHT = '100%' as const;
export const ROOM_BACKGROUND_TOP = '0%' as const;

export function roomAssetSource(
  itemId: string,
): ImageSourcePropType | undefined {
  if (!(itemId in EMBEDDED_ROOM_ASSETS) || itemId === 'roomBackground')
    return undefined;
  return { uri: EMBEDDED_ROOM_ASSETS[itemId as EmbeddedRoomAssetId] };
}
