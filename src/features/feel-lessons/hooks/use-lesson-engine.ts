// src/features/feel-lessons/hooks/use-lesson-engine.ts
import { useState, useCallback, useMemo } from 'react';
import type { LessonStep } from '@types';
import { INFORMATIONAL_STEPS } from '../constants';
import type { LessonEngineState, LessonEngineActions } from '../types';

/**
 * Data-driven lesson engine that manages step navigation and completion gating.
 *
 * - Informational steps (context, shape, mnemonic) always allow forward navigation.
 * - Interactive steps (sing, body, hands, disappearing) require calling markStepDone()
 *   before the user can advance.
 */
export const useLessonEngine = (
  steps: readonly LessonStep[],
): LessonEngineState & LessonEngineActions => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];
  const isLessonComplete = currentStepIndex >= totalSteps;

  const isCurrentStepInformational = currentStep
    ? INFORMATIONAL_STEPS.has(currentStep.type)
    : false;

  const isCurrentStepCompleted = completedSteps.has(currentStepIndex);

  const canGoNext = useMemo(() => {
    if (isLessonComplete) return false;
    return isCurrentStepInformational || isCurrentStepCompleted;
  }, [isLessonComplete, isCurrentStepInformational, isCurrentStepCompleted]);

  const canGoBack = currentStepIndex > 0 && !isLessonComplete;

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    // Mark informational steps as completed when advancing past them
    if (isCurrentStepInformational && !completedSteps.has(currentStepIndex)) {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(currentStepIndex);
        return next;
      });
    }
    setCurrentStepIndex((prev) => prev + 1);
  }, [canGoNext, isCurrentStepInformational, completedSteps, currentStepIndex]);

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    setCurrentStepIndex((prev) => prev - 1);
  }, [canGoBack]);

  const markStepDone = useCallback(() => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStepIndex);
      return next;
    });
  }, [currentStepIndex]);

  return {
    currentStepIndex,
    completedSteps,
    isLessonComplete,
    currentStep,
    totalSteps,
    goNext,
    goBack,
    markStepDone,
    canGoNext,
    canGoBack,
  };
};
