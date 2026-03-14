// src/data-access/stores/use-baby-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@libs/uuid';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { BabyProfile, BabySession, BabyActivityType } from '@types';

type BabyState = {
  babyProfile: BabyProfile | null;
  babySessions: BabySession[];
};

type LogBabySessionParams = {
  babyProfileId: string;
  activityType: BabyActivityType;
  duration: number;
  babyResponse: BabySession['babyResponse'];
  completedAt: string;
};

type BabyActions = {
  setBabyProfile: (profile: BabyProfile) => void;
  updateBabyName: (name: string) => void;
  updateStageOverride: (stage: number | null) => void;
  logBabySession: (params: LogBabySessionParams) => void;
  clearBabyProfile: () => void;
};

const INITIAL: BabyState = {
  babyProfile: null,
  babySessions: [],
};

export const useBabyStore = create<BabyState & BabyActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      setBabyProfile: (profile) => set({ babyProfile: profile }),

      updateBabyName: (name) => {
        const { babyProfile } = get();
        if (!babyProfile) return;
        set({ babyProfile: { ...babyProfile, babyName: name } });
      },

      updateStageOverride: (stage) => {
        const { babyProfile } = get();
        if (!babyProfile) return;
        set({ babyProfile: { ...babyProfile, stageOverride: stage } });
      },

      logBabySession: (params) => {
        const session: BabySession = {
          id: generateId(),
          babyProfileId: params.babyProfileId,
          activityType: params.activityType,
          duration: params.duration,
          babyResponse: params.babyResponse,
          completedAt: params.completedAt,
        };
        set((s) => ({ babySessions: [...s.babySessions, session] }));
      },

      clearBabyProfile: () => set(INITIAL),
    }),
    {
      name: 'baby-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useBabyStore.setState(INITIAL));
