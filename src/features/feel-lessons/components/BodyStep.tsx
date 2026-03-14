// src/features/feel-lessons/components/BodyStep.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import { useShallow } from 'zustand/shallow';
import type { LessonStep } from '@types';

export interface BodyStepProps {
  readonly step: LessonStep;
  readonly onComplete: () => void;
  readonly isCompleted: boolean;
}

export const BodyStep = ({ step, onComplete, isCompleted }: BodyStepProps) => {
  const { setRatio, setBpm, setStereoSplit, play, stop } = useAudioStore(
    useShallow((s) => ({
      setRatio: s.setRatio,
      setBpm: s.setBpm,
      setStereoSplit: s.setStereoSplit,
      play: s.play,
      stop: s.stop,
    })),
  );
  const audio = step.audioConfig;

  const durationSeconds =
    (step.interactionConfig as { durationSeconds?: number } | undefined)
      ?.durationSeconds ?? 60;

  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (audio) {
      setRatio(audio.ratioA, audio.ratioB);
      setBpm(audio.bpm);
      setStereoSplit(audio.stereoSplit);
    }
    return () => {
      stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = useCallback(() => {
    if (isRunning || isCompleted) return;
    setIsRunning(true);
    play();
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setIsRunning(false);
          stop();
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isRunning, isCompleted, play, stop, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  let timerColor: string = colors.textPrimary;
  if (isCompleted) {
    timerColor = colors.success;
  } else if (isRunning) {
    timerColor = colors.primaryLight;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="body-step"
    >
      <Text variant="body" color={colors.textPrimary}>
        {step.instruction}
      </Text>
      {step.secondaryText ? (
        <Text variant="bodySmall" color={colors.textSecondary}>
          {step.secondaryText}
        </Text>
      ) : null}

      <View style={styles.timerContainer}>
        <Text
          variant="h1"
          color={timerColor}
          align="center"
        >
          {isCompleted ? 'Done!' : formatTime(secondsLeft)}
        </Text>
      </View>

      {!isRunning && !isCompleted ? (
        <Pressable
          style={styles.startButton}
          accessibilityRole="button"
          accessibilityLabel="Start timer"
          onPress={startTimer}
        >
          <Text variant="h3" color={colors.textPrimary} align="center">
            Tap to Start
          </Text>
        </Pressable>
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
  timerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    marginVertical: spacing.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  startButton: {
    minHeight: spacing.tapMinimum,
    minWidth: spacing.tapMinimum,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
