import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecordView } from '../components/record-view';
import {
  AppScreen,
  Card,
  EmptyState,
  PrimaryButton,
  colors,
} from '../components/ui';
import { useApp } from '../state/app-context';
import { formatDateKey } from '../utils/date';
import { validateIdParams } from '../utils/route-params';

export const Route = createRoute('/result', {
  validateParams: validateIdParams,
  component: ResultPage,
});

export function ResultPage() {
  const navigation = Route.useNavigation();
  const { id } = Route.useParams();
  const { records, rewardTransactions, editTodayRecord } = useApp();
  const record = records.find((item) => item.id === id);
  const earned = rewardTransactions
    .filter(
      (item) =>
        item.referenceId === id &&
        (item.type === 'DAILY_RECORD_REWARD' || item.type === 'ONE_LINE_BONUS'),
    )
    .reduce((sum, item) => sum + item.amount, 0);
  return (
    <AppScreen>
      <Text style={styles.eyebrow}>기록 완료</Text>
      <Text style={styles.title}>오늘을 잘 남겼어요.</Text>
      {record ? (
        <>
          <Text style={styles.date}>{formatDateKey(record.date)}</Text>
          <RecordView record={record} />
          {earned > 0 ? (
            <Card style={styles.rewardCard}>
              <Text style={styles.rewardTitle}>기록 조각 +{earned}개</Text>
              <Text style={styles.rewardText}>
                오늘을 남긴 만큼 기록 조각이 쌓였어요.
              </Text>
            </Card>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="저장한 기록을 찾지 못했어요"
          description="홈에서 오늘 기록을 확인해 주세요."
        />
      )}
      <View style={styles.actions}>
        {record ? (
          <PrimaryButton
            label="오늘 기록 수정하기"
            secondary
            onPress={() => {
              void editTodayRecord(record).then(() =>
                navigation.navigate('/check-in'),
              );
            }}
          />
        ) : null}
        <PrimaryButton
          label="홈으로"
          onPress={() => navigation.navigate('/')}
        />
        <PrimaryButton
          label="기록 목록 보기"
          secondary
          onPress={() => navigation.navigate('/records')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 41,
    fontWeight: '700',
    marginTop: 10,
  },
  date: { color: colors.muted, fontSize: 15, marginTop: 8, marginBottom: 24 },
  actions: { gap: 10, marginTop: 24 },
  rewardCard: { backgroundColor: '#FFF6D8', marginTop: 14 },
  rewardTitle: { color: '#8A6500', fontSize: 18, fontWeight: '800' },
  rewardText: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
});
