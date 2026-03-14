// src/features/feel-lessons/__tests__/use-lesson-engine.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useLessonEngine } from '../hooks/use-lesson-engine';
import type { LessonStep } from '@types';

const makeStep = (
  stepNumber: LessonStep['stepNumber'],
  type: LessonStep['type'],
): LessonStep => ({
  stepNumber,
  type,
  title: `Step ${stepNumber}`,
  instruction: `Instruction for step ${stepNumber}`,
  audioConfig: null,
});

const MOCK_STEPS: readonly LessonStep[] = [
  makeStep(1, 'context'),      // informational
  makeStep(2, 'shape'),        // informational
  makeStep(3, 'mnemonic'),     // informational
  makeStep(4, 'sing'),         // interactive
  makeStep(5, 'body'),         // interactive
  makeStep(6, 'hands'),        // interactive
  makeStep(7, 'disappearing'), // interactive
];

describe('useLessonEngine', () => {
  it('starts at step 0 with no completed steps', () => {
    const { result } = renderHook(() => useLessonEngine(MOCK_STEPS));

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.completedSteps.size).toBe(0);
    expect(result.current.isLessonComplete).toBe(false);
    expect(result.current.totalSteps).toBe(7);
    expect(result.current.currentStep?.type).toBe('context');
  });

  it('allows forward navigation on informational steps without marking done', () => {
    const { result } = renderHook(() => useLessonEngine(MOCK_STEPS));

    // context step - canGoNext should be true
    expect(result.current.canGoNext).toBe(true);

    act(() => result.current.goNext());
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.currentStep?.type).toBe('shape');

    // shape step - canGoNext should be true
    expect(result.current.canGoNext).toBe(true);

    act(() => result.current.goNext());
    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.currentStep?.type).toBe('mnemonic');

    // mnemonic step - canGoNext should be true
    expect(result.current.canGoNext).toBe(true);
  });

  it('blocks forward navigation on interactive steps until markStepDone', () => {
    const { result } = renderHook(() => useLessonEngine(MOCK_STEPS));

    // Navigate to step 4 (sing - interactive)
    act(() => result.current.goNext()); // past context
    act(() => result.current.goNext()); // past shape
    act(() => result.current.goNext()); // past mnemonic

    expect(result.current.currentStepIndex).toBe(3);
    expect(result.current.currentStep?.type).toBe('sing');
    expect(result.current.canGoNext).toBe(false);

    // Try to advance — should be blocked
    act(() => result.current.goNext());
    expect(result.current.currentStepIndex).toBe(3);

    // Mark step done
    act(() => result.current.markStepDone());
    expect(result.current.canGoNext).toBe(true);

    // Now can advance
    act(() => result.current.goNext());
    expect(result.current.currentStepIndex).toBe(4);
  });

  it('blocks going back on step 0', () => {
    const { result } = renderHook(() => useLessonEngine(MOCK_STEPS));

    expect(result.current.canGoBack).toBe(false);
    act(() => result.current.goBack());
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('allows going back to previous steps', () => {
    const { result } = renderHook(() => useLessonEngine(MOCK_STEPS));

    act(() => result.current.goNext()); // step 1
    act(() => result.current.goNext()); // step 2
    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.canGoBack).toBe(true);

    act(() => result.current.goBack());
    expect(result.current.currentStepIndex).toBe(1);
  });

  it('completes the lesson after advancing past the last step', () => {
    const shortSteps: readonly LessonStep[] = [
      makeStep(1, 'context'),
      makeStep(2, 'shape'),
    ];
    const { result } = renderHook(() => useLessonEngine(shortSteps));

    act(() => result.current.goNext()); // past step 1
    act(() => result.current.goNext()); // past step 2

    expect(result.current.isLessonComplete).toBe(true);
    expect(result.current.currentStepIndex).toBe(2);
  });

  it('marks informational steps as completed when advancing past them', () => {
    const { result } = renderHook(() => useLessonEngine(MOCK_STEPS));

    act(() => result.current.goNext()); // past context (step 0)
    expect(result.current.completedSteps.has(0)).toBe(true);

    act(() => result.current.goNext()); // past shape (step 1)
    expect(result.current.completedSteps.has(1)).toBe(true);
  });

  it('handles all interactive step types correctly', () => {
    const interactiveSteps: readonly LessonStep[] = [
      makeStep(1, 'sing'),
      makeStep(2, 'body'),
      makeStep(3, 'hands'),
      makeStep(4, 'disappearing'),
    ];
    const { result } = renderHook(() => useLessonEngine(interactiveSteps));

    // Each step should block navigation
    for (let i = 0; i < 4; i++) {
      expect(result.current.canGoNext).toBe(false);
      act(() => result.current.markStepDone());
      expect(result.current.canGoNext).toBe(true);
      act(() => result.current.goNext());
    }

    expect(result.current.isLessonComplete).toBe(true);
  });
});
