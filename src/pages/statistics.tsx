import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppScreen,
  Card,
  LoadingScreen,
  colors,
} from '../components/ui';
import { useApp } from '../state/app-context';
import { toLocalMonthKey } from '../utils/date';
import { calculateMonthlyStatistics } from '../utils/statistics';

export const Route = createRoute('/statistics', { component: StatisticsPage });

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Card>
  );
}

function StatisticsPage() {
  const { loading, records } = useApp();
  const stats = calculateMonthlyStatistics(
    records,
    toLocalMonthKey(new Date()),
  );
  if (loading) return <LoadingScreen />;
  return (
    <AppScreen>
      <Text style={styles.title}>이번 달 기록</Text>
      <Text style={styles.count}>{stats.recordCount}일</Text>
      {stats.recordCount < 3 ? (
        <Card style={styles.notice}>
          <Text style={styles.noticeTitle}>아직 기록이 조금 더 필요해요.</Text>
          <Text style={styles.noticeText}>
            3일 이상 기록하면 반복 패턴을 확인할 수 있어요.
          </Text>
        </Card>
      ) : (
        <View style={styles.grid}>
          <Stat label="평균 기분" value={`${stats.averageMood} / 5`} />
          <Stat label="평균 에너지" value={`${stats.averageEnergy} / 5`} />
          <Stat label="평균 집중도" value={`${stats.averageFocus} / 5`} />
          <Stat label="많이 한 활동" value={stats.topActivity ?? '없음'} />
          <Stat label="자주 막힌 이유" value={stats.topBlocker ?? '없음'} />
          <Stat label="많이 나아진 점" value={stats.topImprovement ?? '없음'} />
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontWeight: '700', marginTop: 16 },
  count: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 28,
  },
  notice: { backgroundColor: '#E8F3FF' },
  noticeTitle: { color: '#1B64DA', fontSize: 18, fontWeight: '700' },
  noticeText: {
    color: colors.secondary,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', minHeight: 118 },
  statLabel: { color: colors.muted, fontSize: 14 },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    lineHeight: 28,
  },
});
