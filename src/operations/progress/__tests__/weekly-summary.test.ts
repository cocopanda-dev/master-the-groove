// src/operations/progress/__tests__/weekly-summary.test.ts
import { computeWeeklySummary } from '../weekly-summary';
import type { Session } from '@types';

const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session-1',
  userId: 'user-1',
  polyrhythmId: '3-2',
  startedAt: '2026-03-09T10:00:00Z',
  endedAt: '2026-03-09T10:10:00Z',
  duration: 600,
  bpmStart: 90,
  bpmEnd: 90,
  mode: 'free-play',
  disappearingBeatStageReached: 0,
  feelStateAfter: null,
  ...overrides,
});

describe('computeWeeklySummary', () => {
  const weekStart = '2026-03-09T00:00:00Z'; // Monday

  it('returns empty summary for no sessions', () => {
    const result = computeWeeklySummary('user-1', weekStart, []);
    expect(result.sessionsCount).toBe(0);
    expect(result.totalPracticeMinutes).toBe(0);
    expect(result.polyrhythmsVisited).toEqual([]);
  });

  it('sums total practice minutes', () => {
    const sessions = [
      makeSession({ id: '1', duration: 600, startedAt: '2026-03-09T10:00:00Z' }),
      makeSession({ id: '2', duration: 1200, startedAt: '2026-03-10T10:00:00Z' }),
    ];
    const result = computeWeeklySummary('user-1', weekStart, sessions);
    expect(result.totalPracticeMinutes).toBe(30); // 1800 sec / 60
  });

  it('counts sessions correctly', () => {
    const sessions = [
      makeSession({ id: '1', startedAt: '2026-03-09T10:00:00Z' }),
      makeSession({ id: '2', startedAt: '2026-03-11T10:00:00Z' }),
    ];
    const result = computeWeeklySummary('user-1', weekStart, sessions);
    expect(result.sessionsCount).toBe(2);
  });

  it('collects unique polyrhythms visited', () => {
    const sessions = [
      makeSession({ id: '1', polyrhythmId: '3-2', startedAt: '2026-03-09T10:00:00Z' }),
      makeSession({ id: '2', polyrhythmId: '4-3', startedAt: '2026-03-10T10:00:00Z' }),
      makeSession({ id: '3', polyrhythmId: '3-2', startedAt: '2026-03-11T10:00:00Z' }),
    ];
    const result = computeWeeklySummary('user-1', weekStart, sessions);
    expect(result.polyrhythmsVisited).toHaveLength(2);
    expect(result.polyrhythmsVisited).toContain('3-2');
    expect(result.polyrhythmsVisited).toContain('4-3');
  });

  it('excludes sessions outside the week', () => {
    const sessions = [
      makeSession({ id: '1', startedAt: '2026-03-08T23:59:59Z' }), // day before
      makeSession({ id: '2', startedAt: '2026-03-09T10:00:00Z' }), // in week
      makeSession({ id: '3', startedAt: '2026-03-16T00:00:00Z' }), // day after
    ];
    const result = computeWeeklySummary('user-1', weekStart, sessions);
    expect(result.sessionsCount).toBe(1);
  });
});
