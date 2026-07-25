import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MOODS } from '../constants/check-in-options';
import type { DailyRecord } from '../models/daily-record';
import { createFeedback } from '../utils/feedback';
import { Card, colors } from './ui';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function RecordView({ record }: { record: DailyRecord }) {
  const mood = MOODS.find((item) => item.value === record.mood);
  return (
    <View style={styles.container}>
      <Card style={styles.feedbackCard}>
        <Text style={styles.feedback}>{createFeedback(record)}</Text>
      </Card>
      <Card>
        <Row
          label="기분"
          value={`${mood?.emoji ?? ''} ${mood?.label ?? record.mood}`}
        />
        <Row label="에너지" value={`${record.energy} / 5`} />
        <Row label="집중도" value={`${record.focus} / 5`} />
        <Row
          label="오늘 한 일"
          value={record.activities.join(', ') || '선택하지 않았어요'}
        />
        <Row label="막힌 것" value={record.blocker ?? '선택하지 않았어요'} />
        <Row
          label="나아진 점"
          value={record.improvement ?? '선택하지 않았어요'}
        />
        <Row
          label="내일의 실험"
          value={record.experiment ?? '선택하지 않았어요'}
        />
        <Row label="오늘의 한 줄" value={record.oneLine ?? '남기지 않았어요'} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  feedbackCard: { backgroundColor: '#E8F3FF' },
  feedback: {
    color: '#1B64DA',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  label: { color: colors.muted, fontSize: 14, marginBottom: 6 },
  value: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
});
