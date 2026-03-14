// src/features/core-player/components/FeelStatePrompt.tsx
import React from 'react';
import { View, Modal, Pressable, StyleSheet, Text } from 'react-native';
import { Badge } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import { fontSize } from '@design-system/tokens/typography';
import type { FeelState } from '../types';

type FeelStateOption = {
  state: FeelState;
  label: string;
  description: string;
  badgeVariant: 'executing' | 'hearing' | 'feeling';
};

const FEEL_STATE_OPTIONS: FeelStateOption[] = [
  {
    state: 'executing',
    label: 'Executing',
    description: "I can do it but I'm chasing the pattern",
    badgeVariant: 'executing',
  },
  {
    state: 'hearing',
    label: 'Hearing',
    description: 'I can hear the rhythm internally',
    badgeVariant: 'hearing',
  },
  {
    state: 'feeling',
    label: 'Feeling',
    description: "It lives in my body — I don't have to think about it",
    badgeVariant: 'feeling',
  },
];

type FeelStatePromptProps = {
  visible: boolean;
  sessionDuration: number;
  onSelect: (state: FeelState) => void;
  onSkip: () => void;
};

export const FeelStatePrompt = ({
  visible,
  sessionDuration,
  onSelect,
  onSkip,
}: FeelStatePromptProps) => {
  const minutes = Math.floor(sessionDuration / 60);
  const seconds = sessionDuration % 60;
  const durationLabel =
    minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onSkip}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>How did it feel?</Text>
          <Text style={styles.subtitle}>
            Great session — {durationLabel} of practice
          </Text>

          <View style={styles.options}>
            {FEEL_STATE_OPTIONS.map((option) => (
              <Pressable
                key={option.state}
                onPress={() => onSelect(option.state)}
                accessibilityLabel={`${option.label}: ${option.description}`}
                accessibilityRole="button"
                style={styles.option}
                testID={`feel-state-${option.state}`}
              >
                <Badge label={option.label} variant={option.badgeVariant} />
                <Text style={styles.optionDescription}>{option.description}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onSkip}
            accessibilityLabel="Skip"
            accessibilityHint="Skips recording how the session felt"
            accessibilityRole="button"
            style={styles.skipButton}
            testID="feel-state-skip"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  options: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionDescription: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
