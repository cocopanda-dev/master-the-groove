// src/features/core-player/hooks/use-core-player.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import { useSessionStore } from '@data-access/stores/use-session-store';
import { useSettingsStore } from '@data-access/stores/use-settings-store';
import { MVP_RATIOS, ACTIVE_RATIO_IDS, MIN_SESSION_DURATION_S, FEEL_STATE_PROMPT_THRESHOLD_S } from '../constants';
import type { CorePlayerStatus, FeelStatePromptState } from '../types';
import type { PolyrhythmRatio, FeelState } from '@types';

type UseCorePlayerReturn = {
  status: CorePlayerStatus;
  selectedRatio: PolyrhythmRatio;
  feelStatePrompt: FeelStatePromptState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSelectRatio: (ratio: PolyrhythmRatio) => void;
  onDismissFeelState: () => void;
  onSubmitFeelState: (state: FeelState) => void;
  onSkipFeelState: () => void;
};

export const useCorePlayer = (): UseCorePlayerReturn => {
  const audio = useAudioStore();
  const session = useSessionStore();
  const settings = useSettingsStore();

  // Restore settings on mount
  const hasRestoredSettings = useRef(false);
  useEffect(() => {
    if (hasRestoredSettings.current) return;
    hasRestoredSettings.current = true;
    audio.setBpm(settings.defaultBpm);
    audio.setSoundA(settings.preferredSoundA);
    audio.setSoundB(settings.preferredSoundB);
    audio.setMasterVolume(settings.masterVolume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedRatio, setSelectedRatio] = useState<PolyrhythmRatio>(
    () => MVP_RATIOS[0] ?? { id: '3-2', ratioA: 3, ratioB: 2, name: '3:2', displayName: 'Three against Two', culturalOrigin: '', mnemonic: '' },
  );

  const [feelStatePrompt, setFeelStatePrompt] = useState<FeelStatePromptState>({
    visible: false,
    sessionDuration: 0,
  });

  // Track when the session started for duration check before saving
  const sessionStartRef = useRef<number | null>(null);

  const status: CorePlayerStatus = audio.isPlaying
    ? 'playing'
    : audio.isPaused
    ? 'paused'
    : 'idle';

  const onPlay = useCallback(() => {
    if (session.lifecycleState === 'idle') {
      session.startSession({
        polyrhythmId: selectedRatio.id,
        mode: 'free-play',
        bpm: audio.bpm,
      });
      sessionStartRef.current = Date.now();
    }
    audio.play();
  }, [audio, session, selectedRatio.id]);

  const onPause = useCallback(() => {
    audio.pause();
  }, [audio]);

  const onStop = useCallback(() => {
    audio.stop();

    if (session.lifecycleState !== 'recording') {
      sessionStartRef.current = null;
      return;
    }

    const startedAt = sessionStartRef.current;
    sessionStartRef.current = null;
    const durationMs = startedAt ? Date.now() - startedAt : 0;
    const durationS = durationMs / 1000;

    if (durationS < MIN_SESSION_DURATION_S) {
      // Discard — reset lifecycle manually
      // endSession with null will move to pendingFeelState; we need to bypass it
      // We reset by calling endSession then skipFeelState then completeSession
      session.endSession(null);
      session.skipFeelState();
      session.completeSession();
      return;
    }

    if (durationS >= FEEL_STATE_PROMPT_THRESHOLD_S) {
      session.endSession(null);
      setFeelStatePrompt({ visible: true, sessionDuration: Math.round(durationS) });
    } else {
      // Short session — end without feel-state
      session.endSession(null);
      session.skipFeelState();
      session.completeSession();
    }
  }, [audio, session]);

  const onSelectRatio = useCallback(
    (ratio: PolyrhythmRatio) => {
      if (!ACTIVE_RATIO_IDS.has(ratio.id)) return;
      // Stop playback if playing
      if (audio.isPlaying || audio.isPaused) {
        onStop();
      }
      setSelectedRatio(ratio);
      audio.setRatio(ratio.ratioA, ratio.ratioB);
    },
    [audio, onStop],
  );

  const onDismissFeelState = useCallback(() => {
    setFeelStatePrompt({ visible: false, sessionDuration: 0 });
  }, []);

  const onSubmitFeelState = useCallback(
    (state: FeelState) => {
      if (session.lifecycleState === 'pendingFeelState') {
        session.recordFeelState(state);
        session.completeSession();
      }
      setFeelStatePrompt({ visible: false, sessionDuration: 0 });
    },
    [session],
  );

  const onSkipFeelState = useCallback(() => {
    if (session.lifecycleState === 'pendingFeelState') {
      session.skipFeelState();
      session.completeSession();
    }
    setFeelStatePrompt({ visible: false, sessionDuration: 0 });
  }, [session]);

  return {
    status,
    selectedRatio,
    feelStatePrompt,
    onPlay,
    onPause,
    onStop,
    onSelectRatio,
    onDismissFeelState,
    onSubmitFeelState,
    onSkipFeelState,
  };
};
