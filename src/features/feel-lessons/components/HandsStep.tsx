// src/features/feel-lessons/components/HandsStep.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing, borderRadius, fontSize } from '@design-system/tokens';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import type { LessonStep } from '@types';

interface HandsStepProps {
  readonly step: LessonStep;
  readonly onComplete: () => void;
  readonly isCompleted: boolean;
}

const TAPS_TO_COMPLETE = 12;

export const HandsStep = ({ step, onComplete, isCompleted }: HandsStepProps) => {
  const { setRatio, setBpm, setStereoSplit, play, stop } = useAudioStore();
  const audio = step.audioConfig;

  const config = step.interactionConfig as
    | { leftLabel?: string; rightLabel?: string }
    | undefined;
  const leftLabel = config?.leftLabel ?? 'Layer A';
  const rightLabel = config?.rightLabel ?? 'Layer B';

  const [leftTaps, setLeftTaps] = useState(0);
  const [rightTaps, setRightTaps] = useState(0);
  const [leftFlash, setLeftFlash] = useState(false);
  const [rightFlash, setRightFlash] = useState(false);

  useEffect(() => {
    if (audio) {
      setRatio(audio.ratioA, audio.ratioB);
      setBpm(audio.bpm);
      setStereoSplit(audio.stereoSplit);
      play();
    }
    return () => {
      stop();
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isCompleted && leftTaps + rightTaps >= TAPS_TO_COMPLETE) {
      onComplete();
    }
  }, [leftTaps, rightTaps, isCompleted, onComplete]);

  const onLeftTap = useCallback(() => {
    setLeftTaps((prev) => prev + 1);
    setLeftFlash(true);
    setTimeout(() => setLeftFlash(false), 150);
  }, []);

  const onRightTap = useCallback(() => {
    setRightTaps((prev) => prev + 1);
    setRightFlash(true);
    setTimeout(() => setRightFlash(false), 150);
  }, []);

  return (
    <View style={styles.container} testID="hands-step">
      <Text variant="body" color={colors.textPrimary} align="center">
        {step.instruction}
      </Text>
      {step.secondaryText ? (
        <Text variant="bodySmall" color={colors.textSecondary} align="center">
          {step.secondaryText}
        </Text>
      ) : null}

      <View style={styles.tapZones}>
        <Pressable
          style={[styles.tapZone, styles.tapZoneLeft, leftFlash && styles.tapZoneFlash]}
          onPress={onLeftTap}
          accessibilityRole="button"
          accessibilityLabel={`Tap left zone for ${leftLabel}`}
          testID="tap-zone-left"
        >
          <Text variant="h3" color={colors.textPrimary}>
            {leftLabel}
          </Text>
          <Text variant="h2" color={colors.layerA}>
            {leftTaps}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tapZone, styles.tapZoneRight, rightFlash && styles.tapZoneFlash]}
          onPress={onRightTap}
          accessibilityRole="button"
          accessibilityLabel={`Tap right zone for ${rightLabel}`}
          testID="tap-zone-right"
        >
          <Text variant="h3" color={colors.textPrimary}>
            {rightLabel}
          </Text>
          <Text variant="h2" color={colors.layerB}>
            {rightTaps}
          </Text>
        </Pressable>
      </View>

      {isCompleted ? (
        <Text variant="body" color={colors.success} align="center">
          Great job! You can keep tapping or move on.
        </Text>
      ) : (
        <Text variant="caption" color={colors.textMuted} align="center">
          {TAPS_TO_COMPLETE - leftTaps - rightTaps > 0
            ? `${TAPS_TO_COMPLETE - leftTaps - rightTaps} more taps to complete`
            : 'Complete!'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tapZones: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  tapZone: {
    flex: 1,
    minHeight: 150,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  tapZoneLeft: {
    backgroundColor: colors.layerAFaded,
    borderWidth: 2,
    borderColor: colors.layerA,
  },
  tapZoneRight: {
    backgroundColor: colors.layerBFaded,
    borderWidth: 2,
    borderColor: colors.layerB,
  },
  tapZoneFlash: {
    opacity: 0.7,
  },
});
