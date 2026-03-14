// src/features/feel-lessons/hooks/use-lesson-data.ts
import { useMemo } from 'react';
import type { LessonData } from '../types';

// Import lesson JSON data statically.
// Dynamic require/import is not reliable in React Native bundles,
// so we use a registry of known lessons.
import lesson3_2 from '../../../../data/lessons/3-2.json';
import lesson4_3 from '../../../../data/lessons/4-3.json';

const LESSON_REGISTRY: Record<string, LessonData> = {
  '3-2': lesson3_2 as unknown as LessonData,
  '4-3': lesson4_3 as unknown as LessonData,
};

/**
 * Load lesson data for a given polyrhythm ID.
 * Returns the LessonData or null if the lesson is not found.
 */
export const useLessonData = (polyrhythmId: string): LessonData | null => {
  return useMemo(() => LESSON_REGISTRY[polyrhythmId] ?? null, [polyrhythmId]);
};
