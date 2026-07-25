import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AppScreen,
  Card,
  ErrorMessage,
  LoadingScreen,
  PrimaryButton,
  colors,
} from '../components/ui';
import { MOODS } from '../constants/check-in-options';
import { useApp } from '../state/app-context';
import {
  formatLocalDate,
  toLocalDateKey,
  toLocalMonthKey,
} from '../utils/date';

export const Route = createRoute('/', { component: HomePage });

function HomePage() {
  const navigation = Route.useNavigation();
  const { loading, error, records, rewardBalance, draft, resetDraft } =
    useApp();
  if (loading) return <LoadingScreen />;

  const today = toLocalDateKey(new Date());
  const todayRecord = records.find((record) => record.date === today);
  const monthCount = records.filter((record) =>
    record.date.startsWith(toLocalMonthKey(new Date())),
  ).length;
  const hasDraft =
    draft.date === today &&
    (draft.mood || draft.activities.length > 0 || draft.oneLine.length > 0);
  const mood = todayRecord
    ? MOODS.find((item) => item.value === todayRecord.mood)
    : undefined;

  const start = async () => {
    if (todayRecord) await resetDraft();
    navigation.navigate('/check-in');
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.brand}>어제보다</Text>
        <TouchableOpacity
          accessibilityLabel="월간 통계 보기"
          accessibilityRole="button"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          onPress={() => navigation.navigate('/statistics')}
        >
          <Text style={styles.headerLink}>통계</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.hero}>
        <Text style={styles.date}>{formatLocalDate(new Date())}</Text>
        <Text style={styles.title}>
          오늘 하루를{'\n'}30초 만에 정리해볼까요?
        </Text>
        <Text style={styles.description}>
          긴 글 대신 몇 번의 선택으로 가볍게 돌아봐요.
        </Text>
      </View>
      <ErrorMessage>{error}</ErrorMessage>
      {todayRecord ? (
        <Card style={styles.todayCard}>
          <Text style={styles.cardEyebrow}>오늘 기록</Text>
          <Text style={styles.cardTitle}>
            {mood?.emoji} {mood?.label}
          </Text>
          <Text style={styles.cardDescription}>
            {todayRecord.oneLine ??
              (todayRecord.activities.join(', ') || '오늘의 기록을 남겼어요.')}
          </Text>
          <TouchableOpacity
            accessibilityLabel="오늘 기록 자세히 보기"
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('/record-detail', { id: todayRecord.id })
            }
          >
            <Text style={styles.cardLink}>기록 자세히 보기 ›</Text>
          </TouchableOpacity>
        </Card>
      ) : null}
      <TouchableOpacity
        accessibilityLabel={`리워드 보기, 기록 조각 ${rewardBalance}개`}
        accessibilityRole="button"
        onPress={() => navigation.navigate('/rewards')}
      >
        <Card style={styles.rewardCard}>
          <View>
            <Text style={styles.rewardLabel}>나의 기록 조각</Text>
            <Text style={styles.rewardDescription}>
              기록할수록 차곡차곡 모여요.
            </Text>
          </View>
          <Text style={styles.rewardBalance}>{rewardBalance}개 ›</Text>
        </Card>
      </TouchableOpacity>
      <View style={styles.actions}>
        <PrimaryButton
          label="나의 작은 방"
          secondary
          onPress={() => navigation.navigate('/room')}
        />
        <PrimaryButton
          label={
            todayRecord
              ? '오늘 기록 다시 작성'
              : hasDraft
                ? '작성 이어가기'
                : '오늘 기록 시작'
          }
          onPress={() => void start()}
        />
        <PrimaryButton
          label="최근 기록 보기"
          secondary
          onPress={() => navigation.navigate('/records')}
        />
        <PrimaryButton
          label="월간 일기 보기"
          secondary
          onPress={() => navigation.navigate('/monthly-journal')}
        />
        <Text style={styles.monthly}>이번 달 {monthCount}일 기록했어요.</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: colors.text, fontSize: 20, fontWeight: '700' },
  headerLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    padding: 8,
  },
  hero: { flex: 1, justifyContent: 'center', minHeight: 310 },
  date: { color: colors.muted, fontSize: 16, marginBottom: 16 },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 42,
    fontWeight: '700',
    marginBottom: 16,
  },
  description: { color: colors.secondary, fontSize: 16, lineHeight: 25 },
  todayCard: { marginBottom: 16 },
  cardEyebrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  cardDescription: {
    color: colors.secondary,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  cardLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
  },
  actions: { gap: 10 },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF6D8',
    marginBottom: 16,
  },
  rewardLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rewardDescription: { color: colors.secondary, fontSize: 13, marginTop: 5 },
  rewardBalance: { color: '#8A6500', fontSize: 18, fontWeight: '800' },
  monthly: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
  },
});
