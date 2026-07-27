import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppScreen,
  Card,
  ErrorMessage,
  PrimaryButton,
  colors,
} from '../components/ui';
import { SHOP_ITEMS } from '../constants/shop-items';
import type { ShopItem } from '../models/decoration';
import { useApp } from '../state/app-context';

export const Route = createRoute('/diary-style', { component: DiaryStylePage });

function DiaryStylePage() {
  const { decorationState, applyDecoration } = useApp();
  const [error, setError] = useState<string>();
  const ownedIds = new Set(decorationState.owned.map((item) => item.itemId));
  const itemFor = (slot: ShopItem['slot']) =>
    SHOP_ITEMS.find((item) => item.id === decorationState.equipped[slot]);
  const cover = itemFor('diaryCover');
  const tape = itemFor('diaryTape');
  const sticker = itemFor('diarySticker');

  const apply = async (item: ShopItem) => {
    setError(undefined);
    try {
      await applyDecoration(item);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '적용하지 못했어요.');
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>나의 일기장</Text>
      <Text style={styles.subtitle}>
        모아 둔 표지와 장식으로 포근하게 꾸며요.
      </Text>
      <View
        style={[styles.diary, { backgroundColor: cover?.color ?? '#EEDFC8' }]}
      >
        <View
          style={[styles.tape, { backgroundColor: tape?.color ?? '#E8D8C4' }]}
        />
        <Text style={styles.diaryTitle}>어제보다</Text>
        <Text style={styles.diarySubtitle}>작은 하루의 기록</Text>
        <Text style={styles.sticker}>{sticker?.symbol ?? '☀️'}</Text>
      </View>
      <ErrorMessage>{error}</ErrorMessage>
      {(['cover', 'tape', 'sticker'] as const).map((category) => (
        <View key={category} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {category === 'cover'
              ? '표지'
              : category === 'tape'
                ? '마스킹테이프'
                : '스티커'}
          </Text>
          <View style={styles.options}>
            {SHOP_ITEMS.filter(
              (item) => item.category === category && ownedIds.has(item.id),
            ).map((item) => (
              <Card key={item.id} style={styles.optionCard}>
                <Text style={styles.optionSymbol}>{item.symbol}</Text>
                <Text numberOfLines={1} style={styles.optionName}>
                  {item.name}
                </Text>
                <PrimaryButton
                  label={
                    decorationState.equipped[item.slot] === item.id
                      ? '적용 중'
                      : '적용'
                  }
                  disabled={decorationState.equipped[item.slot] === item.id}
                  secondary
                  onPress={() => void apply(item)}
                />
              </Card>
            ))}
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontWeight: '700', marginTop: 14 },
  subtitle: { color: colors.secondary, fontSize: 15, marginTop: 8 },
  diary: {
    height: 270,
    borderRadius: 24,
    marginVertical: 26,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#FFF9F0',
  },
  tape: {
    position: 'absolute',
    width: 100,
    height: 26,
    top: 14,
    left: '38%',
    transform: [{ rotate: '-3deg' }],
    opacity: 0.9,
  },
  diaryTitle: {
    color: '#594738',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 52,
  },
  diarySubtitle: { color: '#7A6656', fontSize: 15, marginTop: 8 },
  sticker: { position: 'absolute', right: 28, bottom: 28, fontSize: 52 },
  section: { marginTop: 22 },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionCard: { width: '48%', padding: 14 },
  optionSymbol: { fontSize: 30 },
  optionName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginVertical: 9,
  },
});
