// src/features/disappearing-beat/components/DisappearingBeatResults.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { DriftFeedback } from './DriftFeedback';
import type { DisappearingBeatResult } from '../types';

type DisappearingBeatResultsProps = {
  readonly result: DisappearingBeatResult;
  readonly onTryAgain: () => void;
  readonly onAdjustSettings: () => void;
  readonly onBack: () => void;
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export const DisappearingBeatResults = ({
  result,
  onTryAgain,
  onAdjustSettings,
  onBack,
}: DisappearingBeatResultsProps) => {
  const { config, driftResult, durationSeconds, completed, highestStage } = result;
  const finalDrift = driftResult?.finalDriftMs ?? null;
  const finalZone = driftResult?.finalZone ?? 'missed';
  const meanDrift = driftResult?.meanAbsDriftMs;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Text variant="h2" align="center">
        {completed ? 'Session Complete' : 'Session Ended'}
      </Text>

      {driftResult && (
        <DriftFeedback driftMs={finalDrift} zone={finalZone} />
      )}

      <View style={styles.summarySection}>
        <Text variant="h4" color={colors.textSecondary}>Summary</Text>

        <View style={styles.summaryRow}>
          <Text variant="body" color={colors.textSecondary}>Polyrhythm</Text>
          <Text variant="body">{config.ratioA}:{config.ratioB}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text variant="body" color={colors.textSecondary}>BPM</Text>
          <Text variant="body">{config.bpm}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text variant="body" color={colors.textSecondary}>Target Layer</Text>
          <Text variant="body">Layer {config.targetLayer}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text variant="body" color={colors.textSecondary}>Highest Stage</Text>
          <Text variant="body">{highestStage} of 3</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text variant="body" color={colors.textSecondary}>Duration</Text>
          <Text variant="body">{formatDuration(durationSeconds)}</Text>
        </View>

        {meanDrift !== null && meanDrift !== undefined && (
          <View style={styles.summaryRow}>
            <Text variant="body" color={colors.textSecondary}>Avg Drift</Text>
            <Text variant="body">{Math.round(meanDrift)}ms</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonsSection}>
        <Button
          accessibilityLabel="Try again with same settings"
          onPress={onTryAgain}
          size="lg"
        >
          Try Again
        </Button>

        <Button
          accessibilityLabel="Adjust settings"
          onPress={onAdjustSettings}
          variant="secondary"
          size="md"
        >
          Adjust Settings
        </Button>

        <Button
          accessibilityLabel="Back to practice"
          onPress={onBack}
          variant="ghost"
          size="md"
        >
          Back to Practice
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  summarySection: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  buttonsSection: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
