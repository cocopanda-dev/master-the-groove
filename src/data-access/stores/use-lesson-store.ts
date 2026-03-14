// src/data-access/stores/use-lesson-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@libs/uuid';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { LessonProgress } from '@types';

type LessonState = {
  progressByPolyrhythm: Record<string, LessonProgress>;
};

type LessonActions = {
  startLesson: (polyrhythmId: string, totalSteps: number) => void;
  advanceStep: (polyrhythmId: string) => void;
  completeLesson: (polyrhythmId: string) => void;
  awardFeelBadge: (polyrhythmId: string) => void;
  resetLesson: (polyrhythmId: string) => void;
  markLessonSynced: (polyrhythmId: string) => void;
};

const INITIAL: LessonState = { progressByPolyrhythm: {} };

export const useLessonStore = create<LessonState & LessonActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      startLesson: (polyrhythmId) => {
        const existing = get().progressByPolyrhythm[polyrhythmId];
        if (existing) return; // don't overwrite

        const entry: LessonProgress = {
          id: generateId(),
          userId: '',
          polyrhythmId,
          currentStep: 1,
          completed: false,
          feelBadgeEarned: false,
          lastAttemptAt: new Date().toISOString(),
        };

        set((s) => ({
          progressByPolyrhythm: { ...s.progressByPolyrhythm, [polyrhythmId]: entry },
        }));
      },

      advanceStep: (polyrhythmId) => {
        set((s) => {
          const progress = s.progressByPolyrhythm[polyrhythmId];
          if (!progress || progress.currentStep >= 7) return s;
          return {
            progressByPolyrhythm: {
              ...s.progressByPolyrhythm,
              [polyrhythmId]: {
                ...progress,
                currentStep: (progress.currentStep + 1) as LessonProgress['currentStep'],
                lastAttemptAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      completeLesson: (polyrhythmId) => {
        set((s) => {
          const progress = s.progressByPolyrhythm[polyrhythmId];
          if (!progress) return s;
          return {
            progressByPolyrhythm: {
              ...s.progressByPolyrhythm,
              [polyrhythmId]: { ...progress, completed: true, lastAttemptAt: new Date().toISOString() },
            },
          };
        });
      },

      awardFeelBadge: (polyrhythmId) => {
        set((s) => {
          const progress = s.progressByPolyrhythm[polyrhythmId];
          if (!progress) return s;
          return {
            progressByPolyrhythm: {
              ...s.progressByPolyrhythm,
              [polyrhythmId]: { ...progress, feelBadgeEarned: true },
            },
          };
        });
      },

      resetLesson: (polyrhythmId) => {
        set((s) => {
          const { [polyrhythmId]: _, ...rest } = s.progressByPolyrhythm;
          return { progressByPolyrhythm: rest };
        });
      },

      markLessonSynced: (_polyrhythmId) => {
        // Placeholder for sync status tracking
      },
    }),
    {
      name: 'lesson-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useLessonStore.setState(INITIAL));
