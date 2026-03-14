// src/features/feel-lessons/components/ContextStep.tsx
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import type { LessonStep } from '@types';
import { ExtensionSlot } from './ExtensionSlot';

interface ContextStepProps {
  readonly step: LessonStep;
}

export const ContextStep = ({ step }: ContextStepProps) => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.content}
    testID="context-step"
  >
    <Text variant="body" color={colors.textPrimary}>
      {step.instruction}
    </Text>
    {step.secondaryText ? (
      <Text variant="bodySmall" color={colors.textSecondary}>
        {step.secondaryText}
      </Text>
    ) : null}
    {/* Extension slot: real music context (hidden at MVP) */}
    <ExtensionSlot slotId="real-music-context" label="Real music examples" />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
