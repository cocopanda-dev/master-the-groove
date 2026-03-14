// src/operations/progress/weekly-summary.ts
import type { Session, WeeklySummary, FeelState } from '@types';

export const computeWeeklySummary = (
  userId: string,
  weekStart: string,
  sessions: Session[],
): WeeklySummary => {
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const weekSessions = sessions.filter((s) => {
    const started = new Date(s.startedAt);
    return started >= weekStartDate && started < weekEndDate;
  });

  const totalSeconds = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  const polyrhythmsVisited = [...new Set(weekSessions.map((s) => s.polyrhythmId))];

  const feelStateChanges: Record<string, { from: FeelState; to: FeelState }> = {};

  return {
    userId,
    weekStart,
    totalPracticeMinutes: Math.round(totalSeconds / 60),
    sessionsCount: weekSessions.length,
    polyrhythmsVisited,
    feelStateChanges,
  };
};
