import { useSessionStore } from '@data-access/stores/use-session-store';
import { act } from '@testing-library/react-native';
import type { Session } from '@types';

const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: `session-${Math.random().toString(36).slice(2)}`,
  userId: 'user-1',
  polyrhythmId: '3-2',
  startedAt: new Date().toISOString(),
  endedAt: new Date().toISOString(),
  duration: 600,
  bpmStart: 90,
  bpmEnd: 90,
  mode: 'free-play',
  disappearingBeatStageReached: 0,
  feelStateAfter: null,
  ...overrides,
});

/**
 * Helper: create a Date for a specific number of days ago at noon local time.
 */
const daysAgo = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d;
};

describe('session store selectors', () => {
  beforeEach(() => {
    act(() => useSessionStore.setState(useSessionStore.getInitialState()));
  });

  describe('getSessionsForPolyrhythm', () => {
    it('filters sessions by polyrhythmId', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({ polyrhythmId: '3-2' }),
            makeSession({ polyrhythmId: '4-3' }),
            makeSession({ polyrhythmId: '3-2' }),
          ],
        }),
      );
      const result = useSessionStore.getState().getSessionsForPolyrhythm('3-2');
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.polyrhythmId === '3-2')).toBe(true);
    });

    it('returns empty array for unknown polyrhythmId', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [makeSession({ polyrhythmId: '3-2' })],
        }),
      );
      expect(useSessionStore.getState().getSessionsForPolyrhythm('unknown')).toEqual([]);
    });
  });

  describe('getCurrentFeelState', () => {
    it('returns the most recent feelStateAfter for a polyrhythm', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({ polyrhythmId: '3-2', feelStateAfter: 'hearing', startedAt: daysAgo(0).toISOString() }),
            makeSession({ polyrhythmId: '3-2', feelStateAfter: 'executing', startedAt: daysAgo(1).toISOString() }),
          ],
        }),
      );
      // Sessions are newest-first in history
      expect(useSessionStore.getState().getCurrentFeelState('3-2')).toBe('hearing');
    });

    it('returns null when no feel state reported', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [makeSession({ polyrhythmId: '3-2', feelStateAfter: null })],
        }),
      );
      expect(useSessionStore.getState().getCurrentFeelState('3-2')).toBeNull();
    });

    it('skips sessions with null feelStateAfter', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({ polyrhythmId: '3-2', feelStateAfter: null }),
            makeSession({ polyrhythmId: '3-2', feelStateAfter: 'feeling' }),
          ],
        }),
      );
      expect(useSessionStore.getState().getCurrentFeelState('3-2')).toBe('feeling');
    });
  });

  describe('getCurrentStreak', () => {
    it('returns 0 when no sessions', () => {
      expect(useSessionStore.getState().getCurrentStreak()).toBe(0);
    });

    it('returns 1 for sessions only today', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [makeSession({ startedAt: daysAgo(0).toISOString() })],
        }),
      );
      expect(useSessionStore.getState().getCurrentStreak()).toBe(1);
    });

    it('counts consecutive days including today', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({ startedAt: daysAgo(0).toISOString() }),
            makeSession({ startedAt: daysAgo(1).toISOString() }),
            makeSession({ startedAt: daysAgo(2).toISOString() }),
          ],
        }),
      );
      expect(useSessionStore.getState().getCurrentStreak()).toBe(3);
    });

    it('gap breaks streak', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({ startedAt: daysAgo(0).toISOString() }),
            // gap at day 1
            makeSession({ startedAt: daysAgo(2).toISOString() }),
            makeSession({ startedAt: daysAgo(3).toISOString() }),
          ],
        }),
      );
      expect(useSessionStore.getState().getCurrentStreak()).toBe(1);
    });

    it('today counts even if only session', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [makeSession({ startedAt: daysAgo(0).toISOString() })],
        }),
      );
      expect(useSessionStore.getState().getCurrentStreak()).toBe(1);
    });

    it('streak can start from yesterday if no sessions today', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({ startedAt: daysAgo(1).toISOString() }),
            makeSession({ startedAt: daysAgo(2).toISOString() }),
          ],
        }),
      );
      expect(useSessionStore.getState().getCurrentStreak()).toBe(2);
    });

    it('returns 0 if no sessions today or yesterday', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [makeSession({ startedAt: daysAgo(3).toISOString() })],
        }),
      );
      expect(useSessionStore.getState().getCurrentStreak()).toBe(0);
    });

    it('handles multiple sessions on the same day', () => {
      const today = daysAgo(0);
      const todayAlt = new Date(today);
      todayAlt.setHours(today.getHours() + 2);
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({ startedAt: today.toISOString() }),
            makeSession({ startedAt: todayAlt.toISOString() }),
            makeSession({ startedAt: daysAgo(1).toISOString() }),
          ],
        }),
      );
      expect(useSessionStore.getState().getCurrentStreak()).toBe(2);
    });
  });

  describe('getWeeklySummary', () => {
    it('computes a typical week summary', () => {
      // Create sessions for "this week" (today)
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({
              startedAt: daysAgo(0).toISOString(),
              duration: 600,
              polyrhythmId: '3-2',
              feelStateAfter: 'hearing',
            }),
            makeSession({
              startedAt: daysAgo(0).toISOString(),
              duration: 300,
              polyrhythmId: '4-3',
              feelStateAfter: 'executing',
            }),
          ],
        }),
      );
      const summary = useSessionStore.getState().getWeeklySummary();
      expect(summary.sessionCount).toBe(2);
      expect(summary.totalMinutes).toBe(15); // (600+300)/60
      expect(summary.polyrhythmsVisited).toContain('3-2');
      expect(summary.polyrhythmsVisited).toContain('4-3');
      expect(summary.streak).toBeGreaterThanOrEqual(1);
    });

    it('returns empty summary for empty week', () => {
      // Sessions from 30 days ago (won't be in current week)
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({ startedAt: daysAgo(30).toISOString() }),
          ],
        }),
      );
      const summary = useSessionStore.getState().getWeeklySummary();
      expect(summary.sessionCount).toBe(0);
      expect(summary.totalMinutes).toBe(0);
      expect(summary.polyrhythmsVisited).toEqual([]);
    });

    it('detects feel state changes within the week', () => {
      const earlier = daysAgo(0);
      earlier.setHours(8, 0, 0, 0);
      const later = daysAgo(0);
      later.setHours(18, 0, 0, 0);

      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({
              startedAt: later.toISOString(),
              polyrhythmId: '3-2',
              feelStateAfter: 'hearing',
            }),
            makeSession({
              startedAt: earlier.toISOString(),
              polyrhythmId: '3-2',
              feelStateAfter: 'executing',
            }),
          ],
        }),
      );
      const summary = useSessionStore.getState().getWeeklySummary();
      expect(summary.feelStateChanges).toHaveLength(1);
      expect(summary.feelStateChanges[0]).toEqual({
        polyrhythmId: '3-2',
        from: 'executing',
        to: 'hearing',
      });
    });

    it('does not report feel state change when state is the same', () => {
      act(() =>
        useSessionStore.setState({
          sessionHistory: [
            makeSession({
              startedAt: daysAgo(0).toISOString(),
              polyrhythmId: '3-2',
              feelStateAfter: 'executing',
            }),
            makeSession({
              startedAt: daysAgo(0).toISOString(),
              polyrhythmId: '3-2',
              feelStateAfter: 'executing',
            }),
          ],
        }),
      );
      const summary = useSessionStore.getState().getWeeklySummary();
      expect(summary.feelStateChanges).toHaveLength(0);
    });
  });
});
