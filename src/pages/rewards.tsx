import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppScreen,
  Card,
  ErrorMessage,
  LoadingScreen,
  PrimaryButton,
  colors,
} from '../components/ui';
import type { MonthlyMilestone } from '../models/reward';
import { useApp } from '../state/app-context';
import { MONTHLY_MILESTONES } from '../storage/reward-storage';
import { toLocalMonthKey } from '../utils/date';

export const Route = createRoute('/rewards', { component: RewardsPage });

function RewardsPage() {
  const { loading, records, rewardBalance, rewardTransactions, claimReward } =
    useApp();
  const [claiming, setClaiming] = useState<MonthlyMilestone>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const monthKey = toLocalMonthKey(new Date());
  const recordCount = records.filter((record) =>
    record.date.startsWith(monthKey),
  ).length;

  if (loading) return <LoadingScreen />;

  const claim = async (milestone: MonthlyMilestone) => {
    setClaiming(milestone);
    setMessage(undefined);
    setError(undefined);
    try {
      const reward = await claimReward(milestone);
      setMessage(`${reward.amount}개 기록 조각을 받았어요.`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : '보상을 받지 못했어요. 다시 시도해 주세요.',
      );
    } finally {
      setClaiming(undefined);
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>나의 기록 조각</Text>
      <Text style={styles.subtitle}>
        기록할 때마다 차곡차곡 모여요. 쉬어도 줄어들지 않아요.
      </Text>
      <Card style={styles.wallet}>
        <Text style={styles.walletLabel}>보유 기록 조각</Text>
        <Text
          accessibilityLabel={`기록 조각 ${rewardBalance}개`}
          style={styles.balance}
        >
          {rewardBalance}개
        </Text>
      </Card>
      <Text style={styles.sectionTitle}>이번 달 {recordCount}회 기록</Text>
      <Text style={styles.sectionDescription}>
        달성한 단계는 이번 달 안에 직접 받을 수 있어요.
      </Text>
      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.success}>
          {message}
        </Text>
      ) : null}
      <ErrorMessage>{error}</ErrorMessage>
      <View style={styles.milestones}>
        {MONTHLY_MILESTONES.map(({ count, reward }) => {
          const referenceId = `${monthKey}:${count}`;
          const claimed = rewardTransactions.some(
            (item) =>
              item.type === 'MONTHLY_MILESTONE_REWARD' &&
              item.referenceId === referenceId,
          );
          const achieved = recordCount >= count;
          return (
            <Card key={count} style={styles.milestoneCard}>
              <View style={styles.milestoneText}>
                <Text style={styles.milestoneTitle}>{count}회 기록</Text>
                <Text style={styles.milestoneReward}>+{reward}개</Text>
              </View>
              <PrimaryButton
                label={
                  claimed
                    ? '받기 완료'
                    : claiming === count
                      ? '받는 중'
                      : achieved
                        ? '받기'
                        : `${count - recordCount}회 남음`
                }
                disabled={claimed || !achieved || claiming !== undefined}
                onPress={() => void claim(count)}
                secondary={!achieved || claimed}
              />
            </Card>
          );
        })}
      </View>
      <Card style={styles.ruleCard}>
        <Text style={styles.ruleTitle}>기록 조각을 모으는 방법</Text>
        <Text style={styles.ruleText}>하루 첫 기록 +10개</Text>
        <Text style={styles.ruleText}>오늘의 한 줄 작성 +2개</Text>
        <Text style={styles.ruleNote}>
          같은 날 기록을 다시 작성해도 기본 보상은 한 번만 받아요.
        </Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontWeight: '700', marginTop: 14 },
  subtitle: {
    color: colors.secondary,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  wallet: { backgroundColor: '#FFF6D8', marginTop: 24 },
  walletLabel: { color: '#8A6500', fontSize: 15, fontWeight: '700' },
  balance: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '800',
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 30,
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  success: { color: '#16883D', fontSize: 14, fontWeight: '700', marginTop: 16 },
  milestones: { gap: 10, marginTop: 16 },
  milestoneCard: { gap: 14 },
  milestoneText: { flexDirection: 'row', justifyContent: 'space-between' },
  milestoneTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  milestoneReward: { color: colors.primary, fontSize: 17, fontWeight: '700' },
  ruleCard: { marginTop: 24 },
  ruleTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  ruleText: { color: colors.secondary, fontSize: 15, lineHeight: 24 },
  ruleNote: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
});
