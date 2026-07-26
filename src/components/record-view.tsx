import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MOODS } from '../constants/check-in-options';
import type { DailyRecord, ExperimentOutcome } from '../models/daily-record';
import { createFeedback } from '../utils/feedback';
import { Card, colors } from './ui';

const OUTCOME_LABELS: Record<ExperimentOutcome, string> = {
  DONE: '해봤어요',
  PARTLY_DONE: '조금 해봤어요',
  NOT_DONE: '못 했어요',
  DONT_REMEMBER: '기억나지 않아요',
};

function reflectionSentence(record: DailyRecord): string | undefined {
  if (record.blocker && record.improvement)
    return `${record.blocker} 때문에 잠시 막혔지만, 그래도 ${record.improvement}.`;
  if (record.blocker) return `오늘은 ${record.blocker}이 가장 크게 느껴졌어요.`;
  if (record.improvement) return `그래도 오늘은 ${record.improvement}.`;
  return undefined;
}

export function RecordView({ record }: { record: DailyRecord }) {
  const mood = MOODS.find((item) => item.value === record.mood);
  const reflection = reflectionSentence(record);
  return (
    <View style={styles.container}>
      {record.oneLine ? (
        <Card style={styles.oneLineCard}>
          <Text style={styles.cardEyebrow}>오늘의 한 줄</Text>
          <Text style={styles.oneLine}>“{record.oneLine}”</Text>
        </Card>
      ) : null}

      <Card style={styles.diaryCard}>
        <Text style={styles.mood}>
          {mood?.emoji} {mood?.label ?? record.mood}
        </Text>
        <Text style={styles.scores}>
          에너지 {record.energy}/5 · 집중도 {record.focus}/5
        </Text>
        {record.activities.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>오늘 한 일</Text>
            <Text style={styles.body}>{record.activities.join(' · ')}</Text>
          </View>
        ) : null}
        {reflection ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>오늘의 회고</Text>
            <Text style={styles.body}>{reflection}</Text>
          </View>
        ) : null}
        <Text style={styles.feedback}>{createFeedback(record)}</Text>
      </Card>

      {record.experiment ? (
        <Card style={styles.experimentCard}>
          <Text style={styles.experimentEyebrow}>내일의 작은 실험</Text>
          <Text style={styles.experiment}>{record.experiment}</Text>
          {record.experimentOutcome ? (
            <Text style={styles.outcome}>
              다음 날의 기록 · {OUTCOME_LABELS[record.experimentOutcome]}
            </Text>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  oneLineCard: { backgroundColor: '#FFF6D8' },
  cardEyebrow: {
    color: '#8A6500',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  oneLine: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '700',
  },
  diaryCard: { gap: 4 },
  mood: { color: colors.text, fontSize: 22, fontWeight: '800' },
  scores: { color: colors.muted, fontSize: 14, marginTop: 6 },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',
    paddingTop: 18,
    marginTop: 16,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: { color: colors.text, fontSize: 16, lineHeight: 25 },
  feedback: {
    color: '#1B64DA',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '700',
    marginTop: 18,
  },
  experimentCard: { backgroundColor: '#E8F3FF' },
  experimentEyebrow: {
    color: '#1B64DA',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  experiment: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 29,
    fontWeight: '800',
  },
  outcome: { color: colors.secondary, fontSize: 14, marginTop: 12 },
});
