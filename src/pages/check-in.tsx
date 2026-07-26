import { createRoute } from '@granite-js/react-native';
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AppScreen,
  BackButton,
  ChoiceChip,
  ErrorMessage,
  PrimaryButton,
  colors,
} from '../components/ui';
import {
  ACTIVITIES,
  BLOCKERS,
  EXPERIMENTS,
  type ExperimentCategory,
  IMPROVEMENTS,
  MOODS,
} from '../constants/check-in-options';
import type { Score } from '../models/daily-record';
import { useApp } from '../state/app-context';
import { migrateLegacyDraftStep } from '../storage/record-storage';

export const Route = createRoute('/check-in', { component: CheckInPage });

const QUESTIONS = [
  '오늘 상태는 어땠나요?',
  '오늘 어떤 일을 했나요?',
  '오늘 하루를 돌아볼까요?',
  '내일 딱 하나만 바꾼다면?',
  '오늘 기억하고 싶은 한 문장은?',
] as const;
const LEGACY_STEP_FOR_CURRENT = [0, 1, 2, 4, 5] as const;

function Scale({
  label,
  value,
  onChange,
}: { label: string; value?: Score; onChange(value: Score): void }) {
  return (
    <View style={styles.scaleSection}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.scaleRow}>
        {([1, 2, 3, 4, 5] as Score[]).map((score) => (
          <TouchableOpacity
            accessibilityLabel={`${label} ${score}점`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === score }}
            key={score}
            onPress={() => onChange(score)}
            style={[
              styles.scaleButton,
              value === score && styles.scaleButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.scaleText,
                value === score && styles.scaleTextSelected,
              ]}
            >
              {score}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function CheckInPage() {
  const navigation = Route.useNavigation();
  const { draft, updateDraft, saveCurrentDraft } = useApp();
  const [step, setStep] = useState(() => migrateLegacyDraftStep(draft.step));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const savingRef = useRef(false);

  const requiredComplete = Boolean(draft.mood && draft.energy && draft.focus);

  const move = (next: number) => {
    setStep(next);
    updateDraft({ step: LEGACY_STEP_FOR_CURRENT[next] ?? 0 });
  };

  const next = () => {
    if (step === 0 && !requiredComplete) {
      setError('기분, 에너지, 집중도를 모두 선택해 주세요.');
      return;
    }
    setError(undefined);
    move(step + 1);
  };

  const back = () => {
    if (savingRef.current) return;
    if (step > 0) move(step - 1);
    else navigation.goBack();
  };

  const complete = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(undefined);
    try {
      const record = await saveCurrentDraft();
      navigation.navigate('/result', { id: record.id });
    } catch {
      setError('기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const toggleActivity = (activity: string) => {
    const selected = draft.activities.includes(activity);
    if (!selected && draft.activities.length >= 3) return;
    updateDraft({
      activities: selected
        ? draft.activities.filter((item) => item !== activity)
        : [...draft.activities, activity],
    });
  };

  return (
    <AppScreen>
      <View style={styles.topBar}>
        <BackButton onPress={back} />
        <Text style={styles.progress}>{step + 1} / 5</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          accessibilityLabel={`기록 작성 ${step + 1}단계, 전체 5단계`}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: 5, now: step + 1 }}
          style={[styles.progressFill, { width: `${((step + 1) / 5) * 100}%` }]}
        />
      </View>
      <Text style={styles.title}>{QUESTIONS[step]}</Text>
      <Text style={styles.hint}>
        {step === 0
          ? '세 항목은 필수예요.'
          : step === 1
            ? '최대 3개, 선택하지 않아도 괜찮아요.'
            : '선택하지 않고 넘어가도 괜찮아요.'}
      </Text>

      <View style={styles.content}>
        {step === 0 ? (
          <>
            <Text style={styles.sectionLabel}>기분</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <ChoiceChip
                  key={mood.value}
                  label={`${mood.emoji} ${mood.label}`}
                  selected={draft.mood === mood.value}
                  onPress={() => updateDraft({ mood: mood.value })}
                />
              ))}
            </View>
            <Scale
              label="에너지"
              value={draft.energy}
              onChange={(energy) => updateDraft({ energy })}
            />
            <Scale
              label="집중도"
              value={draft.focus}
              onChange={(focus) => updateDraft({ focus })}
            />
          </>
        ) : null}
        {step === 1 ? (
          <>
            <Text style={styles.counter}>
              {draft.activities.length} / 3개 선택
            </Text>
            <View style={styles.chipGrid}>
              {ACTIVITIES.map((item) => (
                <ChoiceChip
                  key={item}
                  label={item}
                  selected={draft.activities.includes(item)}
                  onPress={() => toggleActivity(item)}
                />
              ))}
            </View>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <Text style={styles.sectionLabel}>오늘 나를 가장 막은 것은?</Text>
            <View style={styles.moodGrid}>
              {BLOCKERS.map((item) => (
                <ChoiceChip
                  key={item}
                  label={item}
                  selected={draft.blocker === item}
                  onPress={() =>
                    updateDraft({
                      blocker: draft.blocker === item ? undefined : item,
                    })
                  }
                />
              ))}
            </View>
            <Text style={[styles.sectionLabel, styles.reflectionSection]}>
              그래도 오늘 나아진 점은?
            </Text>
            <View style={styles.moodGrid}>
              {IMPROVEMENTS.map((item) => (
                <ChoiceChip
                  key={item}
                  label={item}
                  selected={draft.improvement === item}
                  onPress={() =>
                    updateDraft({
                      improvement:
                        draft.improvement === item ? undefined : item,
                    })
                  }
                />
              ))}
            </View>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Text style={styles.sectionLabel}>카테고리</Text>
            <View style={styles.chipGrid}>
              {(Object.keys(EXPERIMENTS) as ExperimentCategory[]).map(
                (category) => (
                  <ChoiceChip
                    key={category}
                    label={category}
                    selected={draft.experimentCategory === category}
                    onPress={() =>
                      updateDraft({
                        experimentCategory: category,
                        experiment: undefined,
                      })
                    }
                  />
                ),
              )}
            </View>
            {draft.experimentCategory ? (
              <>
                <Text style={[styles.sectionLabel, styles.optionTitle]}>
                  작은 실험
                </Text>
                <View style={styles.moodGrid}>
                  {EXPERIMENTS[
                    draft.experimentCategory as ExperimentCategory
                  ].map((item) => (
                    <ChoiceChip
                      key={item}
                      label={item}
                      selected={draft.experiment === item}
                      onPress={() =>
                        updateDraft({
                          experiment:
                            draft.experiment === item ? undefined : item,
                        })
                      }
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : null}
        {step === 4 ? (
          <View>
            <TextInput
              accessibilityLabel="오늘의 한 줄"
              maxLength={40}
              multiline={false}
              placeholder="오늘 잘한 일이나 기억하고 싶은 순간"
              placeholderTextColor={colors.muted}
              value={draft.oneLine}
              onChangeText={(oneLine) => updateDraft({ oneLine })}
              style={styles.input}
            />
            <Text style={styles.characterCount}>
              {draft.oneLine.length} / 40자
            </Text>
          </View>
        ) : null}
      </View>
      <ErrorMessage>{error}</ErrorMessage>
      <PrimaryButton
        disabled={saving}
        label={
          step === 4 ? (saving ? '저장하고 있어요' : '오늘 기록 완료') : '다음'
        }
        onPress={step === 4 ? () => void complete() : next}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progress: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E8EB',
    marginTop: 12,
    marginBottom: 28,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: colors.primary },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 39,
    fontWeight: '700',
    marginTop: 10,
  },
  hint: { color: colors.muted, fontSize: 15, marginTop: 10 },
  content: { flex: 1, marginTop: 28, marginBottom: 28 },
  sectionLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  moodGrid: { gap: 10 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  counter: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  scaleSection: { marginTop: 28 },
  scaleRow: { flexDirection: 'row', gap: 8 },
  scaleButton: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  scaleButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F3FF',
  },
  scaleText: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  scaleTextSelected: { color: colors.primary },
  optionTitle: { marginTop: 28 },
  reflectionSection: { marginTop: 36 },
  input: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  characterCount: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'right',
    marginTop: 8,
  },
});
