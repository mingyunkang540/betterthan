import { createRoute } from '@granite-js/react-native';
import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppScreen, BackButton, ErrorMessage, colors } from '../components/ui';
import {
  ROOM_BACKGROUND_SOURCE,
  roomAssetSource,
} from '../constants/room-assets';
import {
  ROOM_EDIT_CATEGORIES,
  ROOM_ITEMS,
  STUDIO_001,
  canPlaceRoomItem,
  roomItemAsset,
} from '../constants/room-definitions';
import type {
  RoomItemCategory,
  RoomSlotId,
  RoomState,
} from '../models/decoration';
import { useApp } from '../state/app-context';

export const Route = createRoute('/room', { component: RoomPage });

function RoomPage() {
  const navigation = Route.useNavigation();
  const { decorationState, rewardBalance, saveRoom } = useApp();
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState<RoomItemCategory>('BED');
  const [petSlot, setPetSlot] = useState<RoomSlotId>('PET_SLOT');
  const [draft, setDraft] = useState<RoomState['slots']>({
    ...decorationState.roomState.slots,
  });
  const [sceneWidth, setSceneWidth] = useState(0);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const scale = sceneWidth ? sceneWidth / STUDIO_001.designWidth : 1;
  const ownedIds = useMemo(
    () => new Set(decorationState.owned.map((item) => item.itemId)),
    [decorationState.owned],
  );
  const visibleSlots = editing ? draft : decorationState.roomState.slots;
  const activeSlot =
    category === 'PET'
      ? petSlot
      : ROOM_ITEMS.find((item) => item.category === category)?.slotId;
  const categoryItems = ROOM_ITEMS.filter(
    (item) =>
      item.category === category &&
      ownedIds.has(item.id) &&
      (!activeSlot || canPlaceRoomItem(item, activeSlot)),
  );

  const beginEdit = () => {
    setDraft({ ...decorationState.roomState.slots });
    setError(undefined);
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft({ ...decorationState.roomState.slots });
    setError(undefined);
    setEditing(false);
  };
  const applyEdit = async () => {
    setSaving(true);
    setError(undefined);
    try {
      await saveRoom(draft);
      setEditing(false);
    } catch {
      setError('방 구성을 저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>나의 작은 방</Text>
          <Text style={styles.subtitle}>
            원하는 아이템을 골라 포근하게 채워보세요.
          </Text>
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.balance}>
          {rewardBalance.toLocaleString('ko-KR')}조각
        </Text>
      </View>
      <View
        style={styles.scene}
        onLayout={(event) => setSceneWidth(event.nativeEvent.layout.width)}
      >
        <Image
          source={ROOM_BACKGROUND_SOURCE}
          resizeMode="contain"
          style={StyleSheet.absoluteFill}
        />
        {visibleSlots.DESK_SLOT ? (
          <Image
            source={roomAssetSource('diary-book')}
            resizeMode="contain"
            style={{
              position: 'absolute',
              zIndex: 38,
              left: 268 * scale,
              top: 502 * scale,
              width: 92 * scale,
              height: 78 * scale,
            }}
          />
        ) : null}
        {STUDIO_001.slots
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((slot) => {
            const itemId = visibleSlots[slot.id];
            const item = itemId
              ? ROOM_ITEMS.find((candidate) => candidate.id === itemId)
              : undefined;
            if (!item) return null;
            const source = roomItemAsset(item.id, slot.id);
            const width = slot.width * scale * (item.scale ?? 1);
            const height = slot.height * scale * (item.scale ?? 1);
            const frame = {
              position: 'absolute' as const,
              zIndex: slot.zIndex,
              left:
                slot.x * scale - width / 2 + (item.renderOffsetX ?? 0) * scale,
              top: slot.y * scale - height + (item.renderOffsetY ?? 0) * scale,
              width,
              height,
            };
            if (!source)
              return (
                <View key={slot.id} style={[frame, styles.symbolAsset]}>
                  <Text style={{ fontSize: Math.min(width, height) * 0.48 }}>
                    {item.symbol}
                  </Text>
                </View>
              );
            return (
              <Image
                key={slot.id}
                source={source}
                resizeMode="contain"
                style={frame}
              />
            );
          })}
      </View>
      {!editing ? (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primary} onPress={beginEdit}>
            <Text style={styles.primaryText}>방 편집하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondary}
            onPress={() => navigation.navigate('/shop')}
          >
            <Text style={styles.secondaryText}>상점 보기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.editor}>
          <Text style={styles.editorTitle}>아이템 선택</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {ROOM_EDIT_CATEGORIES.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={[
                  styles.chip,
                  category === entry.id && styles.chipActive,
                ]}
                onPress={() => setCategory(entry.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === entry.id && styles.chipTextActive,
                  ]}
                >
                  {entry.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {category === 'PET' ? (
            <View style={styles.locationRow}>
              {(
                [
                  ['PET_SLOT', '친구 1'],
                  ['PET_SLOT_2', '친구 2'],
                ] as const
              ).map(([slotId, label]) => (
                <TouchableOpacity
                  key={slotId}
                  style={[
                    styles.locationChip,
                    petSlot === slotId && styles.locationChipActive,
                  ]}
                  onPress={() => setPetSlot(slotId)}
                >
                  <Text style={styles.locationText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            <TouchableOpacity
              style={[
                styles.itemCard,
                activeSlot && draft[activeSlot] === null && styles.itemActive,
              ]}
              onPress={() =>
                activeSlot &&
                setDraft((current) => ({ ...current, [activeSlot]: null }))
              }
            >
              <Text style={styles.none}>없음</Text>
            </TouchableOpacity>
            {categoryItems.map((item) => {
              const selected = activeSlot
                ? draft[activeSlot] === item.id
                : false;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, selected && styles.itemActive]}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      [activeSlot ?? item.slotId]: item.id,
                    }))
                  }
                >
                  {roomItemAsset(item.id) ? (
                    <Image
                      source={roomItemAsset(item.id)}
                      resizeMode="contain"
                      style={styles.thumbnail}
                    />
                  ) : (
                    <Text style={styles.symbolThumbnail}>{item.symbol}</Text>
                  )}
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondary} onPress={cancelEdit}>
              <Text style={styles.secondaryText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={saving}
              style={styles.primary}
              onPress={() => void applyEdit()}
            >
              <Text style={styles.primaryText}>
                {saving ? '저장 중...' : '적용하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ErrorMessage>{error}</ErrorMessage>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: 6, fontSize: 15, color: colors.muted },
  balance: {
    backgroundColor: '#FFF4D4',
    color: '#8A6414',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    fontWeight: '800',
  },
  scene: {
    width: '100%',
    aspectRatio: STUDIO_001.designWidth / STUDIO_001.designHeight,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#FFF2CC',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  primary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  secondary: {
    flex: 1,
    backgroundColor: '#F4E7D8',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryText: { color: '#76583F', fontWeight: '800', fontSize: 16 },
  editor: { marginTop: 18 },
  editorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  row: { gap: 10, paddingVertical: 4 },
  locationRow: { flexDirection: 'row', gap: 7, marginVertical: 8 },
  locationChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3EEE8',
  },
  locationChipActive: { backgroundColor: '#E4CFB6' },
  locationText: { color: '#76583F', fontWeight: '700', fontSize: 12 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3EEE8',
  },
  chipActive: { backgroundColor: '#8F7058' },
  chipText: { color: colors.muted, fontWeight: '700' },
  chipTextActive: { color: '#FFF' },
  itemCard: {
    width: 104,
    height: 116,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  itemActive: { borderColor: colors.primary, backgroundColor: '#FFF8ED' },
  thumbnail: { width: 70, height: 70 },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  none: { fontWeight: '800', color: colors.muted },
  symbolAsset: { alignItems: 'center', justifyContent: 'center' },
  symbolThumbnail: { fontSize: 42 },
});
