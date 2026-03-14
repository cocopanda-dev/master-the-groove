// src/data-access/stores/use-session-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { Session, FeelState } from '@types';

type LifecycleState = 'idle' | 'recording' | 'pendingFeelState' | 'completed';

type SessionState = {
  currentSession: Session | null;
  sessionHistory: Session[];
  lifecycleState: LifecycleState;
};

type StartSessionParams = {
  polyrhythmId: string;
  mode: Session['mode'];
  bpm: number;
};

type SessionActions = {
  startSession: (params: StartSessionParams) => void;
  updateSession: (updates: Partial<Pick<Session, 'bpmEnd' | 'disappearingBeatStageReached'>>) => void;
  endSession: (feelStateAfter: FeelState | null) => void;
  recordFeelState: (feelState: FeelState) => void;
  skipFeelState: () => void;
  completeSession: () => void;
};

const HISTORY_CAP = 500;

const INITIAL: SessionState = {
  currentSession: null,
  sessionHistory: [],
  lifecycleState: 'idle',
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      startSession: ({ polyrhythmId, mode, bpm }) => {
        if (get().lifecycleState !== 'idle') return;

        const session: Session = {
          id: uuid(),
          userId: '',
          polyrhythmId,
          startedAt: new Date().toISOString(),
          endedAt: null,
          duration: 0,
          bpmStart: bpm,
          bpmEnd: bpm,
          mode,
          disappearingBeatStageReached: 0,
          feelStateAfter: null,
        };

        set({ currentSession: session, lifecycleState: 'recording' });
      },

      updateSession: (updates) => {
        const { currentSession, lifecycleState } = get();
        if (lifecycleState !== 'recording' || !currentSession) return;
        set({ currentSession: { ...currentSession, ...updates } });
      },

      endSession: (feelStateAfter) => {
        const { currentSession, lifecycleState } = get();
        if (lifecycleState !== 'recording' || !currentSession) return;

        const endedAt = new Date().toISOString();
        const duration = Math.round(
          (new Date(endedAt).getTime() - new Date(currentSession.startedAt).getTime()) / 1000,
        );

        if (feelStateAfter) {
          set({
            currentSession: { ...currentSession, endedAt, duration, feelStateAfter },
            lifecycleState: 'completed',
          });
        } else {
          set({
            currentSession: { ...currentSession, endedAt, duration },
            lifecycleState: 'pendingFeelState',
          });
        }
      },

      recordFeelState: (feelState) => {
        const { currentSession, lifecycleState } = get();
        if (lifecycleState !== 'pendingFeelState' || !currentSession) return;
        set({
          currentSession: { ...currentSession, feelStateAfter: feelState },
          lifecycleState: 'completed',
        });
      },

      skipFeelState: () => {
        if (get().lifecycleState !== 'pendingFeelState') return;
        set({ lifecycleState: 'completed' });
      },

      completeSession: () => {
        const { currentSession, lifecycleState, sessionHistory } = get();
        if (lifecycleState !== 'completed' || !currentSession) return;

        const updated = [currentSession, ...sessionHistory].slice(0, HISTORY_CAP);
        set({
          currentSession: null,
          sessionHistory: updated,
          lifecycleState: 'idle',
        });
      },
    }),
    {
      name: 'session-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useSessionStore.setState(INITIAL));
