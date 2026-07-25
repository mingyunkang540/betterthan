import { share } from '@apps-in-toss/framework';
import { createRoute } from '@granite-js/react-native';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AppScreen,
  BackButton,
  Card,
  EmptyState,
  ErrorMessage,
  LoadingScreen,
  PrimaryButton,
  colors,
} from '../components/ui';
import { MOODS } from '../constants/check-in-options';
import { useApp } from '../state/app-context';
import { formatDateKey, toLocalMonthKey } from '../utils/date';
import {
  formatMonthlyJournal,
  recordsForMonth,
} from '../utils/monthly-journal';

export const Route = createRoute('/monthly-journal', {
  component: MonthlyJournalPage,
});

function shiftMonth(monthKey: string, amount: number) {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  const date = new Date(year, month - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-');
  return `${year}년 ${Number(month)}월`;
}

function MonthlyJournalPage() {
  const navigation = Route.useNavigation();
  const { loading, records } = useApp();
  const currentMonth = toLocalMonthKey(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string>();
  const monthly = useMemo(
    () => recordsForMonth(records, selectedMonth),
    [records, selectedMonth],
  );

  if (loading) return <LoadingScreen />;

  const exportJournal = async () => {
    setSharing(true);
    setError(undefined);
    try {
      await share({ message: formatMonthlyJournal(records, selectedMonth) });
    } catch {
      setError('월간 일기를 내보내지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <AppScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>월간 일기</Text>
      <Text style={styles.subtitle}>
        한 달의 기록을 모아 읽고 메모 앱 등에 별도로 보관할 수 있어요.
      </Text>
      <View style={styles.monthNavigation}>
        <TouchableOpacity
          accessibilityLabel="이전 달"
          accessibilityRole="button"
          onPress={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
          style={styles.monthButton}
        >
          <Text style={styles.monthButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.month}>{monthLabel(selectedMonth)}</Text>
        <TouchableOpacity
          accessibilityLabel="다음 달"
          accessibilityRole="button"
          disabled={selectedMonth >= currentMonth}
          onPress={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
          style={styles.monthButton}
        >
          <Text
            style={[
              styles.monthButtonText,
              selectedMonth >= currentMonth && styles.disabled,
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.count}>{monthly.length}일의 기록</Text>
      {monthly.length === 0 ? (
        <EmptyState
          title="이 달에는 기록이 없어요"
          description="기록이 있는 달로 이동하면 한 달의 일기를 볼 수 있어요."
        />
      ) : (
        <View style={styles.entries}>
          {[...monthly]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((record) => {
              const mood = MOODS.find((item) => item.value === record.mood);
              return (
                <Card key={record.id}>
                  <Text style={styles.date}>{formatDateKey(record.date)}</Text>
                  <Text style={styles.entryTitle}>
                    {mood?.emoji} {record.oneLine ?? mood?.label}
                  </Text>
                  <Text style={styles.entryMeta}>
                    에너지 {record.energy}/5 · 집중 {record.focus}/5
                  </Text>
                  {record.activities.length ? (
                    <Text style={styles.entryText}>
                      {record.activities.join(', ')}
                    </Text>
                  ) : null}
                  {record.improvement ? (
                    <Text style={styles.entryText}>
                      나아진 점 · {record.improvement}
                    </Text>
                  ) : null}
                </Card>
              );
            })}
        </View>
      )}
      <ErrorMessage>{error}</ErrorMessage>
      {monthly.length > 0 ? (
        <View style={styles.exportButton}>
          <PrimaryButton
            label={sharing ? '내보내는 중' : '한 달 일기 내보내기'}
            disabled={sharing}
            onPress={() => void exportJournal()}
          />
          <Text style={styles.exportHint}>
            휴대폰의 공유 메뉴에서 메모, 메시지 등 원하는 앱을 선택하세요.
          </Text>
        </View>
      ) : null}
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
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  monthButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: { color: colors.primary, fontSize: 30, fontWeight: '700' },
  disabled: { color: colors.border },
  month: { color: colors.text, fontSize: 20, fontWeight: '700' },
  count: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  entries: { gap: 10 },
  date: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  entryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginTop: 8,
  },
  entryMeta: { color: colors.secondary, fontSize: 14, marginTop: 8 },
  entryText: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  exportButton: { marginTop: 24 },
  exportHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
});
