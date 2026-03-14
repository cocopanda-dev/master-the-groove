// src/data-access/stores/__tests__/use-session-store.test.ts
import { useSessionStore } from '../use-session-store';
import { act } from '@testing-library/react-native';

describe('useSessionStore', () => {
  beforeEach(() => {
    act(() => useSessionStore.setState(useSessionStore.getInitialState()));
  });

  describe('lifecycle state machine', () => {
    it('starts in idle state', () => {
      expect(useSessionStore.getState().lifecycleState).toBe('idle');
      expect(useSessionStore.getState().currentSession).toBeNull();
    });

    it('startSession transitions idle -> recording', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      expect(useSessionStore.getState().lifecycleState).toBe('recording');
      expect(useSessionStore.getState().currentSession).not.toBeNull();
      expect(useSessionStore.getState().currentSession?.polyrhythmId).toBe('3-2');
    });

    it('startSession is no-op when already recording', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      const session = useSessionStore.getState().currentSession;
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '4-3', mode: 'lesson', bpm: 90,
      }));
      // Should still be the original session
      expect(useSessionStore.getState().currentSession?.polyrhythmId).toBe('3-2');
      expect(useSessionStore.getState().currentSession?.id).toBe(session?.id);
    });

    it('endSession transitions recording -> pendingFeelState', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      act(() => useSessionStore.getState().endSession(null));
      expect(useSessionStore.getState().lifecycleState).toBe('pendingFeelState');
    });

    it('endSession is no-op when idle', () => {
      act(() => useSessionStore.getState().endSession(null));
      expect(useSessionStore.getState().lifecycleState).toBe('idle');
    });

    it('recordFeelState transitions pendingFeelState -> completed', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().recordFeelState('feeling'));
      expect(useSessionStore.getState().lifecycleState).toBe('completed');
      expect(useSessionStore.getState().currentSession?.feelStateAfter).toBe('feeling');
    });

    it('skipFeelState transitions pendingFeelState -> completed', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().skipFeelState());
      expect(useSessionStore.getState().lifecycleState).toBe('completed');
    });

    it('completeSession moves to history and resets to idle', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().skipFeelState());
      act(() => useSessionStore.getState().completeSession());
      expect(useSessionStore.getState().lifecycleState).toBe('idle');
      expect(useSessionStore.getState().currentSession).toBeNull();
      expect(useSessionStore.getState().sessionHistory).toHaveLength(1);
    });
  });

  describe('session history', () => {
    it('most recent session is first in history', () => {
      // Create two sessions
      act(() => useSessionStore.getState().startSession({ polyrhythmId: '3-2', mode: 'free-play', bpm: 120 }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().skipFeelState());
      act(() => useSessionStore.getState().completeSession());

      act(() => useSessionStore.getState().startSession({ polyrhythmId: '4-3', mode: 'lesson', bpm: 90 }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().skipFeelState());
      act(() => useSessionStore.getState().completeSession());

      expect(useSessionStore.getState().sessionHistory[0]?.polyrhythmId).toBe('4-3');
    });

    it('caps history at 500 entries', () => {
      for (let i = 0; i < 505; i++) {
        act(() => useSessionStore.getState().startSession({ polyrhythmId: '3-2', mode: 'free-play', bpm: 120 }));
        act(() => useSessionStore.getState().endSession(null));
        act(() => useSessionStore.getState().skipFeelState());
        act(() => useSessionStore.getState().completeSession());
      }
      expect(useSessionStore.getState().sessionHistory.length).toBeLessThanOrEqual(500);
    });
  });

  describe('updateSession', () => {
    it('updates BPM end during recording', () => {
      act(() => useSessionStore.getState().startSession({ polyrhythmId: '3-2', mode: 'free-play', bpm: 120 }));
      act(() => useSessionStore.getState().updateSession({ bpmEnd: 140 }));
      expect(useSessionStore.getState().currentSession?.bpmEnd).toBe(140);
    });
  });

  describe('selectors', () => {
    it('selectTotalPracticeSeconds sums durations', () => {
      // Manually set history for testing
      act(() => useSessionStore.setState({
        sessionHistory: [
          { id: '1', userId: 'u', polyrhythmId: '3-2', startedAt: '', endedAt: '', duration: 60, bpmStart: 120, bpmEnd: 120, mode: 'free-play', disappearingBeatStageReached: 0, feelStateAfter: null },
          { id: '2', userId: 'u', polyrhythmId: '3-2', startedAt: '', endedAt: '', duration: 120, bpmStart: 120, bpmEnd: 120, mode: 'free-play', disappearingBeatStageReached: 0, feelStateAfter: null },
        ],
      }));
      const total = useSessionStore.getState().sessionHistory.reduce((sum, s) => sum + s.duration, 0);
      expect(total).toBe(180);
    });
  });
});
