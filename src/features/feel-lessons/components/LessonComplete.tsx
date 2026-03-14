// src/features/feel-lessons/components/LessonComplete.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, Button } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';
import { useLessonStore } from '@data-access/stores';
import { useShallow } from 'zustand/shallow';
import { useRouter } from 'expo-router';
import type { FeelState } from '@types';
import { FEEL_STATE_OPTIONS } from '../constants';

interface LessonCompleteProps {
  readonly polyrhythmId: string;
  readonly lessonTitle: string;
}

export const LessonComplete = ({ polyrhythmId, lessonTitle }: LessonCompleteProps) => {
  const { completeLesson, awardFeelBadge } = useLessonStore(
    useShallow((s) => ({ completeLesson: s.completeLesson, awardFeelBadge: s.awardFeelBadge })),
  );
  const router = useRouter();
  const [selectedFeelState, setSelectedFeelState] = useState<FeelState | null>(null);

  useEffect(() => {
    completeLesson(polyrhythmId);
    awardFeelBadge(polyrhythmId);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToLibrary = useCallback(() => {
    router.back();
  }, [router]);

  const handlePractice = useCallback(() => {
    router.replace('/(tabs)/practice');
  }, [router]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="lesson-complete"
    >
      <Text variant="h2" color={colors.accent} align="center">
        Lesson Complete!
      </Text>

      <Text variant="body" color={colors.textPrimary} align="center">
        You&apos;ve earned the {lessonTitle} Feel Badge!
      </Text>

      <View style={styles.badgeContainer}>
        <Text variant="h1" align="center">
          {'\u2B50'}
        </Text>
      </View>

      <Text variant="h4" color={colors.textPrimary} align="center">
        How does {polyrhythmId.replace('-', ':')} feel?
      </Text>

      <View style={styles.feelOptions}>
        {FEEL_STATE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.feelOption,
              selectedFeelState === option.value && styles.feelOptionSelected,
            ]}
            onPress={() => setSelectedFeelState(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedFeelState === option.value }}
            accessibilityLabel={`${option.label}: ${option.description}`}
            testID={`feel-option-${option.value}`}
          >
            <Text
              variant="body"
              color={
                selectedFeelState === option.value
                  ? colors.textPrimary
                  : colors.textSecondary
              }
            >
              {option.label}
            </Text>
            <Text
              variant="caption"
              color={
                selectedFeelState === option.value
                  ? colors.textSecondary
                  : colors.textMuted
              }
            >
              {option.description}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          accessibilityLabel="Back to library"
          onPress={handleBackToLibrary}
          variant="ghost"
        >
          Back to Library
        </Button>
        <Button
          accessibilityLabel={`Practice ${polyrhythmId.replace('-', ':')}`}
          onPress={handlePractice}
          variant="primary"
        >
          Practice {polyrhythmId.replace('-', ':')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
    paddingTop: spacing['2xl'],
  },
  badgeContainer: {
    marginVertical: spacing.md,
  },
  feelOptions: {
    width: '100%',
    gap: spacing.sm,
  },
  feelOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: spacing.tapMinimum,
    justifyContent: 'center',
  },
  feelOptionSelected: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.surfaceLight,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
