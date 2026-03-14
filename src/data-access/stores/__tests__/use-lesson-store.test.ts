// src/data-access/stores/__tests__/use-lesson-store.test.ts
import { useLessonStore } from '../use-lesson-store';
import { act } from '@testing-library/react-native';

describe('useLessonStore', () => {
  beforeEach(() => {
    act(() => useLessonStore.setState({ progressByPolyrhythm: {} }));
  });

  it('starts with empty progress', () => {
    expect(useLessonStore.getState().progressByPolyrhythm).toEqual({});
  });

  it('startLesson creates a new progress entry', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    const progress = useLessonStore.getState().progressByPolyrhythm['3-2'];
    expect(progress).toBeDefined();
    expect(progress?.currentStep).toBe(1);
    expect(progress?.completed).toBe(false);
    expect(progress?.feelBadgeEarned).toBe(false);
  });

  it('advanceStep increments currentStep', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    act(() => useLessonStore.getState().advanceStep('3-2'));
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.currentStep).toBe(2);
  });

  it('advanceStep does not exceed 7', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    for (let i = 0; i < 10; i++) {
      act(() => useLessonStore.getState().advanceStep('3-2'));
    }
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.currentStep).toBe(7);
  });

  it('completeLesson marks completed', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    act(() => useLessonStore.getState().completeLesson('3-2'));
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.completed).toBe(true);
  });

  it('awardFeelBadge sets flag', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    act(() => useLessonStore.getState().awardFeelBadge('3-2'));
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.feelBadgeEarned).toBe(true);
  });

  it('resetLesson removes the entry', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    act(() => useLessonStore.getState().resetLesson('3-2'));
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']).toBeUndefined();
  });

  it('multiple polyrhythms are independent', () => {
    act(() => {
      useLessonStore.getState().startLesson('3-2', 7);
      useLessonStore.getState().startLesson('4-3', 7);
      useLessonStore.getState().advanceStep('3-2');
    });
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.currentStep).toBe(2);
    expect(useLessonStore.getState().progressByPolyrhythm['4-3']?.currentStep).toBe(1);
  });
});
