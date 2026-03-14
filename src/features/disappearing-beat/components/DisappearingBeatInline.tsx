// src/features/disappearing-beat/components/DisappearingBeatInline.tsx
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { DisappearingBeatPlayback } from './DisappearingBeatPlayback';
import { DriftFeedback } from './DriftFeedback';
import type { StageConfig, DisappearingBeatResult } from '../types';

type DisappearingBeatInlineProps = {
  /** Pre-configured settings (no config screen shown) */
  readonly config: StageConfig;
  /** Called when the inline session completes. Does NOT navigate. */
  readonly onComplete: (result: DisappearingBeatResult) => void;
};

type InlinePhase = 'playing' | 'results';

/**
 * Self-contained Disappearing Beat component for embedding in Feel Lessons.
 * Manages its own engine. Calls onComplete with drift data.
 * Does NOT navigate - the parent lesson controls navigation.
 */
export const DisappearingBeatInline = ({
  config,
  onComplete,
}: DisappearingBeatInlineProps) => {
  const [phase, setPhase] = useState<InlinePhase>('playing');
  const [result, setResult] = useState<DisappearingBeatResult | null>(null);

  const handleComplete = useCallback(
    (completedResult: DisappearingBeatResult) => {
      setResult(completedResult);
      setPhase('results');
    },
    [],
  );

  const handleStop = useCallback(() => {
    // If stopped early, phase will switch to results via handleComplete
  }, []);

  const handleContinue = useCallback(() => {
    if (result) {
      onComplete(result);
    }
  }, [result, onComplete]);

  if (phase === 'results' && result) {
    const finalDrift = result.driftResult?.finalDriftMs ?? null;
    const finalZone = result.driftResult?.finalZone ?? 'missed';

    return (
      <View style={styles.resultsContainer}>
        <Text variant="h3" align="center">Disappearing Beat</Text>

        <DriftFeedback driftMs={finalDrift} zone={finalZone} />

        {result.driftResult?.meanAbsDriftMs !== null &&
          result.driftResult?.meanAbsDriftMs !== undefined && (
            <Text variant="body" color={colors.textSecondary} align="center">
              Average drift: {Math.round(result.driftResult.meanAbsDriftMs)}ms
            </Text>
          )}

        <Button
          accessibilityLabel="Continue lesson"
          onPress={handleContinue}
          size="lg"
        >
          Continue Lesson
        </Button>
      </View>
    );
  }

  return (
    <DisappearingBeatPlayback
      config={config}
      onComplete={handleComplete}
      onStop={handleStop}
    />
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
    justifyContent: 'center',
  },
});
