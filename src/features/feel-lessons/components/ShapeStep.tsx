// src/features/feel-lessons/components/ShapeStep.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import { RadialVisualizer } from '@features/core-player';
import type { LessonStep } from '@types';

interface ShapeStepProps {
  readonly step: LessonStep;
}

export const ShapeStep = ({ step }: ShapeStepProps) => {
  const { setRatio, setBpm, setStereoSplit, play, stop } = useAudioStore();
  const audio = step.audioConfig;

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="shape-step"
    >
      <Text variant="body" color={colors.textPrimary}>
        {step.instruction}
      </Text>
      {audio ? (
        <RadialVisualizer
          ratioA={audio.ratioA}
          ratioB={audio.ratioB}
          interactive={false}
        />
      ) : null}
      {step.secondaryText ? (
        <Text variant="bodySmall" color={colors.textSecondary}>
          {step.secondaryText}
        </Text>
      ) : null}
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
    alignItems: 'center',
  },
});
