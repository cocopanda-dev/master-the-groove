// src/features/feel-lessons/components/MnemonicStep.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';
import type { LessonStep } from '@types';
import { ExtensionSlot } from './ExtensionSlot';

interface Syllable {
  readonly text: string;
  readonly beat: number;
  readonly layer: 'A' | 'B' | 'both';
}

interface MnemonicStepProps {
  readonly step: LessonStep;
}

const getSyllableColor = (layer: string): string => {
  switch (layer) {
    case 'A':
      return colors.layerA;
    case 'B':
      return colors.layerB;
    case 'both':
      return colors.accent;
    default:
      return colors.textPrimary;
  }
};

export const MnemonicStep = ({ step }: MnemonicStepProps) => {
  const config = step.interactionConfig as
    | { mnemonic: string; syllables: Syllable[] }
    | undefined;

  const mnemonic = config?.mnemonic ?? '';
  const syllables = config?.syllables ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="mnemonic-step"
    >
      <Text variant="body" color={colors.textPrimary}>
        {step.instruction}
      </Text>

      {/* Large mnemonic display */}
      <View style={styles.mnemonicContainer}>
        <Text variant="h2" color={colors.textPrimary} align="center">
          {mnemonic}
        </Text>
      </View>

      {/* Syllable-to-beat timeline */}
      {syllables.length > 0 ? (
        <View style={styles.timeline}>
          {syllables.map((syllable, index) => (
            <View key={index} style={styles.syllableItem}>
              <View
                style={[
                  styles.syllableDot,
                  { backgroundColor: getSyllableColor(syllable.layer) },
                ]}
              >
                <Text variant="caption" color={colors.background}>
                  {syllable.beat}
                </Text>
              </View>
              <Text
                variant="body"
                color={getSyllableColor(syllable.layer)}
              >
                {syllable.text}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {step.secondaryText ? (
        <Text variant="bodySmall" color={colors.textSecondary}>
          {step.secondaryText}
        </Text>
      ) : null}

      {/* Extension slot: AI mnemonic generator (hidden at MVP) */}
      <ExtensionSlot slotId="ai-mnemonic-generator" label="AI mnemonic generator" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  mnemonicContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  timeline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  syllableItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  syllableDot: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
