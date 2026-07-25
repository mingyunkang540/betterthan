import { createRoute } from '@granite-js/react-native';
import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AppScreen,
  BackButton,
  Card,
  ChoiceChip,
  ErrorMessage,
  PrimaryButton,
  colors,
} from '../components/ui';
import {
  ROOM_BACKGROUND_HEIGHT,
  ROOM_BACKGROUND_SOURCE,
  ROOM_BACKGROUND_TOP,
  ROOM_SCENE_ASPECT_RATIO,
  roomAssetSource,
} from '../constants/room-assets';
import {
  roomItemAsset,
  roomItemDefinition,
} from '../constants/room-definitions';
import { SHOP_ITEMS } from '../constants/shop-items';
import type { RoomPosition, ShopItem } from '../models/decoration';
import { useApp } from '../state/app-context';
import { DEFAULT_ROOM_POSITIONS } from '../storage/decoration-storage';
import { constrainRoomPosition } from '../utils/room-layout';
import {
  SHOP_TABS,
  type ShopTab,
  itemsForShopTab,
} from '../utils/shop-catalog';

export const Route = createRoute('/shop', { component: ShopPage });

function ShopPage() {
  const navigation = Route.useNavigation();
  const { rewardBalance, decorationState, purchaseOrApplyDecoration } =
    useApp();
  const [tab, setTab] = useState<ShopTab>('furniture');
  const [previewItem, setPreviewItem] = useState<ShopItem>();
  const [previewPosition, setPreviewPosition] = useState<RoomPosition>();
  const [workingId, setWorkingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  const isOwned = (item: ShopItem) =>
    decorationState.owned.some((owned) => owned.itemId === item.id);
  const isEquipped = (item: ShopItem) =>
    item.slot.startsWith('room')
      ? (() => {
          const definition = roomItemDefinition(item.id);
          return definition
            ? decorationState.roomState.slots[definition.slotId] === item.id
            : false;
        })()
      : decorationState.equipped[item.slot] === item.id;

  const act = async (
    item: ShopItem,
    owned: boolean,
    position?: RoomPosition,
  ) => {
    setWorkingId(item.id);
    setError(undefined);
    setMessage(undefined);
    try {
      await purchaseOrApplyDecoration(item, position);
      setMessage(
        item.slot.startsWith('room')
          ? owned
            ? '보유한 아이템은 방 편집에서 선택할 수 있어요.'
            : `${item.name}을 구매했어요. 방 편집에서 선택해보세요.`
          : owned
            ? `${item.name}을 적용했어요.`
            : `${item.name}을 구매했어요.`,
      );
      setPreviewItem(undefined);
      setPreviewPosition(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '처리하지 못했어요.');
    } finally {
      setWorkingId(undefined);
    }
  };

  return (
    <>
      <AppScreen>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.header}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>포근한 상점</Text>
            <Text style={styles.subtitle}>
              내 방과 일기에 어울리는 모습을 먼저 살펴보세요.
            </Text>
          </View>
          <Text style={styles.balance}>{rewardBalance}조각</Text>
        </View>
        <ScrollView
          horizontal
          contentContainerStyle={styles.tabs}
          showsHorizontalScrollIndicator={false}
        >
          {SHOP_TABS.map((shopTab) => (
            <ChoiceChip
              key={shopTab.id}
              label={shopTab.label}
              onPress={() => setTab(shopTab.id)}
              selected={tab === shopTab.id}
            />
          ))}
        </ScrollView>
        {message ? (
          <Text accessibilityLiveRegion="polite" style={styles.success}>
            {message}
          </Text>
        ) : null}
        <ErrorMessage>{error}</ErrorMessage>
        <View style={styles.list}>
          {itemsForShopTab(SHOP_ITEMS, tab).map((item) => {
            const owned = isOwned(item);
            const equipped = isEquipped(item);
            return (
              <Card key={item.id}>
                <View style={styles.itemRow}>
                  <View
                    style={[styles.symbol, { backgroundColor: item.color }]}
                  >
                    {roomItemAsset(item.id) ? (
                      <Image
                        source={roomItemAsset(item.id)}
                        resizeMode="contain"
                        style={styles.listThumbnail}
                      />
                    ) : (
                      <Text style={styles.symbolText}>{item.symbol}</Text>
                    )}
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.price}>
                      {owned ? '보유 중' : `${item.price}조각`}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => {
                      setPreviewPosition(DEFAULT_ROOM_POSITIONS[item.slot]);
                      setPreviewItem(item);
                    }}
                    style={styles.previewButton}
                  >
                    <Text style={styles.previewButtonLabel}>미리보기</Text>
                  </TouchableOpacity>
                  <View style={styles.mainAction}>
                    <PrimaryButton
                      label={
                        equipped
                          ? '적용 중'
                          : workingId === item.id
                            ? '처리 중'
                            : owned
                              ? '적용하기'
                              : '구매하기'
                      }
                      disabled={equipped || workingId !== undefined}
                      secondary={owned}
                      onPress={() => void act(item, owned)}
                    />
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </AppScreen>
      <ItemPreviewModal
        balance={rewardBalance}
        equipped={previewItem ? isEquipped(previewItem) : false}
        equippedItems={decorationState.equipped}
        item={previewItem}
        onClose={() => {
          setPreviewItem(undefined);
          setPreviewPosition(undefined);
        }}
        onConfirm={(item, position) => void act(item, isOwned(item), position)}
        onPositionChange={setPreviewPosition}
        owned={previewItem ? isOwned(previewItem) : false}
        previewPosition={previewPosition}
        working={workingId !== undefined}
      />
    </>
  );
}

function ItemPreviewModal({
  balance,
  equipped,
  equippedItems,
  item,
  onClose,
  onConfirm,
  onPositionChange,
  owned,
  previewPosition,
  working,
}: {
  balance: number;
  equipped: boolean;
  equippedItems: Partial<Record<ShopItem['slot'], string>>;
  item?: ShopItem;
  onClose(): void;
  onConfirm(item: ShopItem, position?: RoomPosition): void;
  onPositionChange(position: RoomPosition): void;
  owned: boolean;
  previewPosition?: RoomPosition;
  working: boolean;
}) {
  if (!item) return null;
  const roomItem = item.slot.startsWith('room');
  const short = !owned && balance < item.price;

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.modalSheet}>
          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{item.name}</Text>
                <Text style={styles.modalDescription}>{item.description}</Text>
              </View>
              <TouchableOpacity
                accessibilityLabel="미리보기 닫기"
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeLabel}>×</Text>
              </TouchableOpacity>
            </View>
            {roomItem ? (
              <RoomPreview
                item={item}
                onPositionChange={onPositionChange}
                position={previewPosition}
              />
            ) : (
              <DiaryPreview equippedItems={equippedItems} item={item} />
            )}
            <View style={styles.purchaseInfo}>
              <Text style={styles.purchaseLabel}>
                {owned ? '이미 보유한 아이템이에요.' : `가격 ${item.price}조각`}
              </Text>
              <Text style={styles.purchaseBalance}>내 조각 {balance}</Text>
            </View>
            {short ? (
              <Text style={styles.shortage}>
                조각이 {item.price - balance}개 더 필요해요.
              </Text>
            ) : null}
            <PrimaryButton
              disabled={working || equipped || short}
              label={
                equipped
                  ? '적용 중'
                  : working
                    ? '처리 중'
                    : owned
                      ? '이 모습 적용하기'
                      : '구매하기'
              }
              secondary={owned}
              onPress={() =>
                onConfirm(item, roomItem ? previewPosition : undefined)
              }
            />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function RoomPreview({
  item,
  onPositionChange,
  position: controlledPosition,
}: {
  item: ShopItem;
  onPositionChange(position: RoomPosition): void;
  position?: RoomPosition;
}) {
  const source = roomItemAsset(item.id) ?? roomAssetSource(item.id);
  const initialPosition = DEFAULT_ROOM_POSITIONS[item.slot] ?? {
    x: 0.5,
    y: 0.65,
  };
  const position = controlledPosition ?? initialPosition;
  const positionRef = useRef(position);
  const dragStart = useRef(initialPosition);
  const assetSize =
    item.category === 'coffee'
      ? 48
      : item.category === 'plant'
        ? 68
        : item.category === 'furniture'
          ? 104
          : 82;
  const roomWidth = 250;
  const roomHeight = roomWidth / ROOM_SCENE_ASPECT_RATIO;
  const maxX = roomWidth - assetSize;
  const maxY = roomHeight - assetSize;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) + Math.abs(gesture.dy) > 2,
        onPanResponderGrant: () => {
          dragStart.current = positionRef.current;
        },
        onPanResponderMove: (_, gesture) => {
          const next = constrainRoomPosition(item.slot, {
            x: dragStart.current.x + gesture.dx / maxX,
            y: dragStart.current.y + gesture.dy / maxY,
          });
          positionRef.current = next;
          onPositionChange(next);
        },
      }),
    [item.slot, maxX, maxY, onPositionChange],
  );
  return (
    <View>
      <Text style={styles.dragInstruction}>
        물건을 손가락으로 끌어 어울리는 위치를 찾아보세요.
      </Text>
      <View style={styles.roomPreview}>
        <Image
          source={ROOM_BACKGROUND_SOURCE}
          style={[
            styles.previewBackground,
            { height: ROOM_BACKGROUND_HEIGHT, top: ROOM_BACKGROUND_TOP },
          ]}
        />
        {source ? (
          <View
            {...panResponder.panHandlers}
            accessibilityHint="손가락으로 끌어 미리보기 위치를 바꿀 수 있어요."
            accessibilityLabel={`${item.name} 구매 전 임시 배치`}
            accessibilityRole="adjustable"
            style={[
              styles.draggablePreviewAsset,
              {
                width: assetSize,
                height: assetSize,
                left: position.x * maxX,
                top: position.y * maxY,
              },
            ]}
          >
            {item.category === 'pet' ? (
              <View style={[styles.fullAsset, styles.spriteCrop]}>
                <Image
                  source={source}
                  style={{
                    width: assetSize * 3,
                    height: assetSize,
                    resizeMode: 'stretch',
                  }}
                />
              </View>
            ) : (
              <Image source={source} style={styles.fullAsset} />
            )}
            <View style={styles.dragHandle} />
          </View>
        ) : null}
        <View style={styles.previewCaption}>
          <Text style={styles.previewCaptionText}>구매 전 임시 배치</Text>
        </View>
      </View>
    </View>
  );
}

function DiaryPreview({
  equippedItems,
  item,
}: {
  equippedItems: Partial<Record<ShopItem['slot'], string>>;
  item: ShopItem;
}) {
  const selected = (slot: ShopItem['slot']) =>
    item.slot === slot
      ? item
      : SHOP_ITEMS.find((candidate) => candidate.id === equippedItems[slot]);
  const cover = selected('diaryCover');
  const tape = selected('diaryTape');
  const sticker = selected('diarySticker');
  return (
    <View style={styles.diaryPreviewWrap}>
      <View
        style={[
          styles.diaryPreview,
          { backgroundColor: cover?.color ?? '#EEDFC8' },
        ]}
      >
        <View
          style={[
            styles.diaryTape,
            { backgroundColor: tape?.color ?? '#E8D8C4' },
          ]}
        />
        <Text style={styles.diaryTitle}>어제보다</Text>
        <Text style={styles.diarySubtitle}>작은 하루의 기록</Text>
        <Text style={styles.diarySticker}>{sticker?.symbol ?? '☀️'}</Text>
      </View>
      <Text style={styles.diaryCaption}>현재 일기장에 적용한 모습</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  headingCopy: { flex: 1, paddingRight: 12 },
  title: { color: colors.text, fontSize: 30, fontWeight: '700' },
  subtitle: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    maxWidth: 240,
  },
  balance: {
    color: '#8A6500',
    backgroundColor: '#FFF6D8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    fontWeight: '800',
  },
  tabs: { gap: 8, paddingVertical: 20 },
  success: {
    color: '#16883D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  list: { gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  symbol: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  symbolText: { fontSize: 30 },
  listThumbnail: { width: 58, height: 58 },
  itemText: { flex: 1 },
  itemName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  itemDescription: { color: colors.secondary, fontSize: 14, marginTop: 4 },
  price: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 7,
  },
  cardActions: { flexDirection: 'row', gap: 8 },
  previewButton: {
    minHeight: 56,
    paddingHorizontal: 17,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF6E8',
    borderWidth: 1,
    borderColor: '#F0DDC3',
  },
  previewButtonLabel: { color: '#7C573A', fontSize: 15, fontWeight: '800' },
  mainAction: { flex: 1 },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(25,31,40,0.38)',
  },
  modalSheet: {
    backgroundColor: '#FFFDFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 24,
    maxHeight: '94%',
  },
  modalContent: { paddingBottom: 4 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { color: colors.text, fontSize: 23, fontWeight: '800' },
  modalDescription: { color: colors.secondary, fontSize: 14, marginTop: 5 },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F6',
  },
  closeLabel: { color: colors.secondary, fontSize: 28, lineHeight: 30 },
  roomPreview: {
    alignSelf: 'center',
    width: 250,
    aspectRatio: ROOM_SCENE_ASPECT_RATIO,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFF0C9',
  },
  previewBackground: {
    position: 'absolute',
    left: 0,
    width: '100%',
    resizeMode: 'stretch',
  },
  dragInstruction: {
    color: colors.secondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 10,
  },
  draggablePreviewAsset: {
    position: 'absolute',
    zIndex: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#3182F6',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  fullAsset: { width: '100%', height: '100%', resizeMode: 'contain' },
  dragHandle: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#3182F6',
  },
  spriteCrop: { overflow: 'hidden' },
  previewCaption: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.86)',
  },
  previewCaptionText: { color: '#6D503A', fontSize: 12, fontWeight: '800' },
  diaryPreviewWrap: { alignItems: 'center', paddingVertical: 8 },
  diaryPreview: {
    width: 250,
    height: 300,
    borderRadius: 20,
    borderWidth: 6,
    borderColor: '#FFF9F0',
    padding: 24,
    overflow: 'hidden',
  },
  diaryTape: {
    position: 'absolute',
    width: 92,
    height: 25,
    top: 15,
    left: 76,
    transform: [{ rotate: '-3deg' }],
    opacity: 0.9,
  },
  diaryTitle: {
    color: '#594738',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 56,
  },
  diarySubtitle: { color: '#7A6656', fontSize: 14, marginTop: 8 },
  diarySticker: { position: 'absolute', right: 24, bottom: 24, fontSize: 50 },
  diaryCaption: { color: colors.secondary, fontSize: 13, marginTop: 10 },
  purchaseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 12,
  },
  purchaseLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  purchaseBalance: { color: '#8A6500', fontSize: 14, fontWeight: '800' },
  shortage: {
    color: '#F04452',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
});
