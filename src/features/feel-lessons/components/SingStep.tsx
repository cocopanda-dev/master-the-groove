// src/features/feel-lessons/components/SingStep.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import type { LessonStep } from '@types';
import { ExtensionSlot } from './ExtensionSlot';

interface SingStepProps {
  readonly step: LessonStep;
  readonly onComplete: () => void;
  readonly isCompleted: boolean;
}

export const SingStep = ({ step, onComplete, isCompleted }: SingStepProps) => {
  const { setRatio, setBpm, setVolumeA, setVolumeB, setStereoSplit, play, stop } =
    useAudioStore();
  const audio = step.audioConfig;

  useEffect(() => {
    if (audio) {
      setRatio(audio.ratioA, audio.ratioB);
      setBpm(audio.bpm);
      setVolumeA(audio.volumeA);
      setVolumeB(audio.volumeB);
      setStereoSplit(audio.stereoSplit);
      play();
    }
    return () => {
      stop();
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completionLabel =
    (step.interactionConfig as { completionLabel?: string } | undefined)
      ?.completionLabel ?? 'I did it!';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="sing-step"
    >
      <Text variant="body" color={colors.textPrimary}>
        {step.instruction}
      </Text>
      {step.secondaryText ? (
        <Text variant="bodySmall" color={colors.textSecondary}>
          {step.secondaryText}
        </Text>
      ) : null}

      <View style={styles.buttonContainer}>
        <Button
          accessibilityLabel={completionLabel}
          onPress={onComplete}
          variant={isCompleted ? 'secondary' : 'primary'}
          size="lg"
          disabled={isCompleted}
        >
          {isCompleted ? 'Completed!' : completionLabel}
        </Button>
      </View>

      {/* Extension slot: AI vocal coach (hidden at MVP) */}
      <ExtensionSlot slotId="ai-vocal-coach" label="AI vocal coach" />
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
  buttonContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
