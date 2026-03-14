// src/features/disappearing-beat/components/StageIndicator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import type { DisappearingBeatStage } from '../types';
import { STAGE_LABELS } from '../constants';

type StageIndicatorProps = {
  readonly stage: DisappearingBeatStage;
  readonly barCount: number;
  readonly barsPerStage: number;
};

const STAGE_DOTS: DisappearingBeatStage[] = ['warmup', 'stage1', 'stage2', 'stage3', 'return'];

const stageIndex = (stage: DisappearingBeatStage): number =>
  STAGE_DOTS.indexOf(stage);

export const StageIndicator = ({ stage, barCount, barsPerStage }: StageIndicatorProps) => {
  const label = STAGE_LABELS[stage] || '';
  const currentIndex = stageIndex(stage);

  return (
    <View style={styles.container} accessibilityRole="text" accessibilityLabel={`${label}, bar ${barCount} of ${barsPerStage}`}>
      <Text variant="h4" align="center">{label}</Text>
      <View style={styles.dotsRow}>
        {STAGE_DOTS.map((dot, i) => (
          <View
            key={dot}
            style={[
              styles.dot,
              i < currentIndex && styles.dotCompleted,
              i === currentIndex && styles.dotActive,
              i > currentIndex && styles.dotUpcoming,
            ]}
          />
        ))}
      </View>
      {stage !== 'idle' && stage !== 'completed' && (
        <Text variant="caption" color={colors.textSecondary} align="center">
          Bar {barCount} / {barsPerStage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceLight,
  },
  dotCompleted: {
    backgroundColor: colors.success,
  },
  dotActive: {
    backgroundColor: colors.primaryLight,
  },
  dotUpcoming: {
    backgroundColor: colors.surfaceLight,
  },
});
