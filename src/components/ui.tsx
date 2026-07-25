import type React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

export const colors = {
  primary: '#3182F6',
  text: '#191F28',
  secondary: '#6B7684',
  muted: '#8B95A1',
  background: '#F7F8FA',
  card: '#FFFFFF',
  border: '#E5E8EB',
  selected: '#E8F3FF',
};

export function AppScreen({
  children,
  scroll = true,
  scrollEnabled = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  scrollEnabled?: boolean;
}) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.screenContent}>{children}</View>
  );
  return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
}

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.loadingText}>기록을 불러오고 있어요.</Text>
    </SafeAreaView>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.primaryButton,
        secondary && styles.secondaryButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text style={[styles.primaryLabel, secondary && styles.secondaryLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function ChoiceChip({
  label,
  selected,
  onPress,
  style,
}: {
  label: string;
  selected: boolean;
  onPress(): void;
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip, style]}
    >
      <Text style={[styles.chipLabel, selected && styles.selectedChipLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function BackButton({
  onPress,
  label = '뒤로',
}: {
  onPress(): void;
  label?: string;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      onPress={onPress}
      style={styles.backButton}
    >
      <Text style={styles.backLabel}>‹ {label}</Text>
    </TouchableOpacity>
  );
}

export function ErrorMessage({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <Text accessibilityLiveRegion="assertive" style={styles.errorMessage}>
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
}: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function EmptyState({
  title,
  description,
}: { title: string; description: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screenContent: { flexGrow: 1, padding: 20, paddingBottom: 36 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.background,
  },
  loadingText: { color: colors.secondary, fontSize: 15 },
  primaryButton: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: { opacity: 0.38 },
  primaryLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  secondaryLabel: { color: colors.text },
  chip: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectedChip: {
    borderColor: colors.primary,
    backgroundColor: colors.selected,
  },
  chipLabel: { color: colors.secondary, fontSize: 16, fontWeight: '600' },
  selectedChipLabel: { color: colors.primary },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  backLabel: { color: colors.secondary, fontSize: 16, fontWeight: '600' },
  errorMessage: {
    color: '#F04452',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  card: { borderRadius: 20, backgroundColor: colors.card, padding: 20 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDescription: {
    color: colors.secondary,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
});
