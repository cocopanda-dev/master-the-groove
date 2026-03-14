// src/features/feel-lessons/components/LessonScreen.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useLessonStore } from '@data-access/stores';
import { useShallow } from 'zustand/shallow';
import { useLessonData } from '../hooks/use-lesson-data';
import { useLessonEngine } from '../hooks/use-lesson-engine';
import { STEP_TYPE_LABELS, TOTAL_LESSON_STEPS } from '../constants';
import { LessonProgressBar } from './LessonProgressBar';
import { StepNavigation } from './StepNavigation';
import { ContextStep } from './ContextStep';
import { ShapeStep } from './ShapeStep';
import { MnemonicStep } from './MnemonicStep';
import { SingStep } from './SingStep';
import { BodyStep } from './BodyStep';
import { HandsStep } from './HandsStep';
import { DisappearingStep } from './DisappearingStep';
import { LessonComplete } from './LessonComplete';

interface LessonScreenProps {
  readonly polyrhythmId: string;
}

export const LessonScreen = ({ polyrhythmId }: LessonScreenProps) => {
  const lessonData = useLessonData(polyrhythmId);
  const { startLesson, advanceStep } = useLessonStore(
    useShallow((s) => ({ startLesson: s.startLesson, advanceStep: s.advanceStep })),
  );

  const steps = lessonData?.steps ?? [];
  const engine = useLessonEngine(steps);

  useEffect(() => {
    startLesson(polyrhythmId, TOTAL_LESSON_STEPS);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync step advancement with the lesson store
  useEffect(() => {
    if (engine.currentStepIndex > 0) {
      advanceStep(polyrhythmId);
    }
    // Only sync when step changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.currentStepIndex]);

  if (!lessonData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="h3" color={colors.error}>
            Lesson not found
          </Text>
          <Text variant="body" color={colors.textSecondary}>
            No lesson data available for &quot;{polyrhythmId}&quot;.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show completion screen when all steps are done
  if (engine.isLessonComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <LessonComplete
          polyrhythmId={polyrhythmId}
          lessonTitle={lessonData.title}
        />
      </SafeAreaView>
    );
  }

  const { currentStep, currentStepIndex, completedSteps, totalSteps } = engine;
  if (!currentStep) return null;

  const isStepCompleted = completedSteps.has(currentStepIndex);
  const isLastStep = currentStepIndex === totalSteps - 1;

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'context':
        return <ContextStep step={currentStep} />;
      case 'shape':
        return <ShapeStep step={currentStep} />;
      case 'mnemonic':
        return <MnemonicStep step={currentStep} />;
      case 'sing':
        return (
          <SingStep
            step={currentStep}
            onComplete={engine.markStepDone}
            isCompleted={isStepCompleted}
          />
        );
      case 'body':
        return (
          <BodyStep
            step={currentStep}
            onComplete={engine.markStepDone}
            isCompleted={isStepCompleted}
          />
        );
      case 'hands':
        return (
          <HandsStep
            step={currentStep}
            onComplete={engine.markStepDone}
            isCompleted={isStepCompleted}
          />
        );
      case 'disappearing':
        return (
          <DisappearingStep
            step={currentStep}
            onComplete={engine.markStepDone}
          />
        );
      default:
        return (
          <Text variant="body" color={colors.error}>
            Unknown step type
          </Text>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LessonProgressBar
        totalSteps={totalSteps}
        currentStepIndex={currentStepIndex}
        completedSteps={completedSteps}
      />

      <View style={styles.header}>
        <Text variant="caption" color={colors.textMuted}>
          Step {currentStepIndex + 1} of {totalSteps} {'\u2022'}{' '}
          {STEP_TYPE_LABELS[currentStep.type]}
        </Text>
        <Text variant="h3" color={colors.textPrimary}>
          {currentStep.title}
        </Text>
      </View>

      <View style={styles.contentArea}>{renderStepContent()}</View>

      <StepNavigation
        canGoBack={engine.canGoBack}
        canGoNext={engine.canGoNext}
        onBack={engine.goBack}
        onNext={engine.goNext}
        isLastStep={isLastStep}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  contentArea: {
    flex: 1,
  },
});
