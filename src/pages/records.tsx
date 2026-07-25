import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AppScreen,
  BackButton,
  Card,
  EmptyState,
  LoadingScreen,
  PrimaryButton,
  colors,
} from '../components/ui';
import { MOODS } from '../constants/check-in-options';
import { useApp } from '../state/app-context';
import { formatDateKey } from '../utils/date';

export const Route = createRoute('/records', { component: RecordsPage });

function RecordsPage() {
  const navigation = Route.useNavigation();
  const { loading, records } = useApp();
  if (loading) return <LoadingScreen />;
  return (
    <AppScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>나의 기록</Text>
      <Text style={styles.subtitle}>최근 기록부터 차곡차곡 모았어요.</Text>
      {records.length === 0 ? (
        <EmptyState
          title="아직 기록이 없어요"
          description="오늘을 짧게 남기면 이곳에서 다시 볼 수 있어요."
        />
      ) : (
        <View style={styles.list}>
          {records.map((record) => {
            const mood = MOODS.find((item) => item.value === record.mood);
            return (
              <TouchableOpacity
                accessibilityLabel={`${formatDateKey(record.date)} 기록 보기`}
                accessibilityRole="button"
                key={record.id}
                onPress={() =>
                  navigation.navigate('/record-detail', { id: record.id })
                }
              >
                <Card>
                  <View style={styles.row}>
                    <Text style={styles.emoji}>{mood?.emoji}</Text>
                    <View style={styles.textArea}>
                      <Text style={styles.date}>
                        {formatDateKey(record.date)}
                      </Text>
                      <Text numberOfLines={1} style={styles.summary}>
                        {record.oneLine ??
                          (record.activities.join(', ') || '오늘의 기록')}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      <View style={styles.footer}>
        <PrimaryButton
          label="월간 통계 보기"
          secondary
          onPress={() => navigation.navigate('/statistics')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontWeight: '700', marginTop: 14 },
  subtitle: {
    color: colors.secondary,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 24,
  },
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 28, marginRight: 14 },
  textArea: { flex: 1 },
  date: { color: colors.text, fontSize: 16, fontWeight: '700' },
  summary: { color: colors.secondary, fontSize: 14, marginTop: 5 },
  chevron: { color: colors.muted, fontSize: 26 },
  footer: { marginTop: 20 },
});
