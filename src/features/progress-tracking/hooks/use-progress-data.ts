import { useMemo } from 'react';
import { useSessionStore } from '@data-access/stores/use-session-store';
import { MVP_RATIOS } from '@types';
import type { ProgressData, PolyrhythmProgress } from '../types';

/**
 * Derives all dashboard data from sessionStore.
 * Returns weekly summary, polyrhythm progress cards, and empty state flag.
 */
const useProgressData = (): ProgressData => {
  const sessionHistory = useSessionStore((s) => s.sessionHistory);
  const getSessionsForPolyrhythm = useSessionStore((s) => s.getSessionsForPolyrhythm);
  const getCurrentFeelState = useSessionStore((s) => s.getCurrentFeelState);
  const getWeeklySummary = useSessionStore((s) => s.getWeeklySummary);

  return useMemo(() => {
    const weeklySummary = getWeeklySummary();
    const hasAnySessions = sessionHistory.length > 0;

    // Get unique polyrhythm IDs from session history, ordered by most recently practiced
    const polyrhythmIdsSeen = new Map<string, number>();
    for (const session of sessionHistory) {
      if (!polyrhythmIdsSeen.has(session.polyrhythmId)) {
        polyrhythmIdsSeen.set(session.polyrhythmId, polyrhythmIdsSeen.size);
      }
    }

    // Build lookup for ratio names from MVP_RATIOS
    const ratioNameMap = new Map<string, string>();
    for (const ratio of MVP_RATIOS) {
      ratioNameMap.set(ratio.id, ratio.name);
    }

    const polyrhythms: PolyrhythmProgress[] = [];
    for (const [polyrhythmId] of polyrhythmIdsSeen) {
      const sessions = getSessionsForPolyrhythm(polyrhythmId);
      const currentFeelState = getCurrentFeelState(polyrhythmId);
      const lastSession = sessions[0]; // newest first

      polyrhythms.push({
        polyrhythmId,
        name: ratioNameMap.get(polyrhythmId) ?? polyrhythmId,
        currentFeelState,
        lastPracticedAt: lastSession?.startedAt ?? null,
        sessionCount: sessions.length,
      });
    }

    return { weeklySummary, polyrhythms, hasAnySessions };
  }, [sessionHistory, getSessionsForPolyrhythm, getCurrentFeelState, getWeeklySummary]);
};

export { useProgressData };
