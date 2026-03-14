// src/features/feel-lessons/__tests__/use-lesson-data.test.ts
import { renderHook } from '@testing-library/react-native';
import { useLessonData } from '../hooks/use-lesson-data';

describe('useLessonData', () => {
  it('loads 3-2 lesson data correctly', () => {
    const { result } = renderHook(() => useLessonData('3-2'));

    expect(result.current).not.toBeNull();
    expect(result.current?.polyrhythmId).toBe('3-2');
    expect(result.current?.title).toBe('Feel 3:2');
    expect(result.current?.steps).toHaveLength(7);
  });

  it('has correct step types for 3-2 lesson', () => {
    const { result } = renderHook(() => useLessonData('3-2'));

    const steps = result.current?.steps;
    expect(steps?.[0]?.type).toBe('context');
    expect(steps?.[1]?.type).toBe('shape');
    expect(steps?.[2]?.type).toBe('mnemonic');
    expect(steps?.[3]?.type).toBe('sing');
    expect(steps?.[4]?.type).toBe('body');
    expect(steps?.[5]?.type).toBe('hands');
    expect(steps?.[6]?.type).toBe('disappearing');
  });

  it('has correct step numbers for 3-2 lesson', () => {
    const { result } = renderHook(() => useLessonData('3-2'));

    const steps = result.current?.steps;
    steps?.forEach((step, index) => {
      expect(step.stepNumber).toBe(index + 1);
    });
  });

  it('has audio config where expected for 3-2 lesson', () => {
    const { result } = renderHook(() => useLessonData('3-2'));

    const steps = result.current?.steps;
    // context step has no audio
    expect(steps?.[0]?.audioConfig).toBeNull();
    // shape step has audio
    expect(steps?.[1]?.audioConfig).not.toBeNull();
    expect(steps?.[1]?.audioConfig?.bpm).toBe(72);
    // mnemonic step has no audio
    expect(steps?.[2]?.audioConfig).toBeNull();
    // sing step has audio
    expect(steps?.[3]?.audioConfig).not.toBeNull();
    expect(steps?.[3]?.audioConfig?.bpm).toBe(68);
  });

  it('loads 4-3 lesson data correctly', () => {
    const { result } = renderHook(() => useLessonData('4-3'));

    expect(result.current).not.toBeNull();
    expect(result.current?.polyrhythmId).toBe('4-3');
    expect(result.current?.title).toBe('Feel 4:3');
    expect(result.current?.steps).toHaveLength(7);
  });

  it('returns null for unknown polyrhythm ID', () => {
    const { result } = renderHook(() => useLessonData('9-9'));

    expect(result.current).toBeNull();
  });
});
