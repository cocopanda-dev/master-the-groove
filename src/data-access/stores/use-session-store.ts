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

type SessionSelectors = {
  getSessionsForPolyrhythm: (polyrhythmId: string) => Session[];
  getSessionsThisWeek: () => Session[];
  getCurrentFeelState: (polyrhythmId: string) => FeelState | null;
  getCurrentStreak: () => number;
  getWeeklySummary: () => {
    totalMinutes: number;
    sessionCount: number;
    polyrhythmsVisited: string[];
    streak: number;
    feelStateChanges: { polyrhythmId: string; from: FeelState; to: FeelState }[];
  };
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

/**
 * Get the Monday 00:00:00 of the ISO week (Mon-Sun) containing `date`,
 * using local timezone.
 */
const getISOWeekStart = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d;
};

/**
 * Get the local calendar date string (YYYY-MM-DD) for a given ISO timestamp.
 */
const toLocalDateString = (isoString: string): string => {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const INITIAL: SessionState = {
  currentSession: null,
  sessionHistory: [],
  lifecycleState: 'idle',
};

export const useSessionStore = create<SessionState & SessionActions & SessionSelectors>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      // --- Selectors ---

      getSessionsForPolyrhythm: (polyrhythmId: string) =>
        get().sessionHistory.filter((s) => s.polyrhythmId === polyrhythmId),

      getSessionsThisWeek: () => {
        const now = new Date();
        const weekStart = getISOWeekStart(now);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7); // Sunday 23:59:59 → next Monday 00:00

        return get().sessionHistory.filter((s) => {
          const started = new Date(s.startedAt);
          return started >= weekStart && started < weekEnd;
        });
      },

      getCurrentFeelState: (polyrhythmId: string) => {
        // Most recent feelStateAfter for that polyrhythm (sessionHistory is sorted newest-first)
        const sessions = get().sessionHistory;
        for (const session of sessions) {
          if (session.polyrhythmId === polyrhythmId && session.feelStateAfter) {
            return session.feelStateAfter;
          }
        }
        return null;
      },

      getCurrentStreak: () => {
        const { sessionHistory } = get();
        if (sessionHistory.length === 0) return 0;

        // Collect unique local dates from all sessions
        // Streak calculation uses device local timezone.
        // Timezone changes during travel may cause a missed day or double day.
        // Accepted for MVP — streaks are motivational, not contractual.
        const dateSet = new Set<string>();
        for (const session of sessionHistory) {
          dateSet.add(toLocalDateString(session.startedAt));
        }

        const today = new Date();
        const todayStr = toLocalDateString(today.toISOString());

        // Start counting from today; if today has no sessions, start from yesterday
        const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (!dateSet.has(todayStr)) {
          currentDate.setDate(currentDate.getDate() - 1);
          const yesterdayStr = toLocalDateString(currentDate.toISOString());
          if (!dateSet.has(yesterdayStr)) {
            return 0;
          }
        }

        let streak = 0;
        while (true) {
          const dateStr = toLocalDateString(currentDate.toISOString());
          if (dateSet.has(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
        return streak;
      },

      getWeeklySummary: () => {
        const state = get();
        const weekSessions = state.getSessionsThisWeek();
        const streak = state.getCurrentStreak();

        const totalSeconds = weekSessions.reduce((sum, s) => sum + s.duration, 0);
        const totalMinutes = Math.round(totalSeconds / 60);
        const sessionCount = weekSessions.length;
        const polyrhythmsVisited = [...new Set(weekSessions.map((s) => s.polyrhythmId))];

        // Compute feel state changes: compare earliest and latest feelStateAfter per polyrhythm this week
        const feelStateChanges: { polyrhythmId: string; from: FeelState; to: FeelState }[] = [];
        const polyMap = new Map<string, { earliest: FeelState; latest: FeelState; earliestTime: number; latestTime: number }>();

        for (const session of weekSessions) {
          if (!session.feelStateAfter) continue;
          const existing = polyMap.get(session.polyrhythmId);
          const time = new Date(session.startedAt).getTime();
          if (!existing) {
            polyMap.set(session.polyrhythmId, {
              earliest: session.feelStateAfter,
              latest: session.feelStateAfter,
              earliestTime: time,
              latestTime: time,
            });
          } else {
            if (time < existing.earliestTime) {
              existing.earliest = session.feelStateAfter;
              existing.earliestTime = time;
            }
            if (time > existing.latestTime) {
              existing.latest = session.feelStateAfter;
              existing.latestTime = time;
            }
          }
        }

        for (const [polyrhythmId, data] of polyMap) {
          if (data.earliest !== data.latest) {
            feelStateChanges.push({ polyrhythmId, from: data.earliest, to: data.latest });
          }
        }

        return { totalMinutes, sessionCount, polyrhythmsVisited, streak, feelStateChanges };
      },

      // --- Actions ---

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
