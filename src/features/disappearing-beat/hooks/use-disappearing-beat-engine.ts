// src/features/disappearing-beat/hooks/use-disappearing-beat-engine.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import type { DisappearingBeatStage, StageConfig, DisappearingBeatResult } from '../types';
import {
  MIN_WARMUP_MS,
  FADE_DURATION_CYCLES,
  STAGE_NUMBER,
} from '../constants';
import type { DriftResult } from '@operations/drift-detection';

type EngineState = {
  stage: DisappearingBeatStage;
  barCount: number;
  volumeA: number;
  volumeB: number;
  startTime: number | null;
};

type UseDisappearingBeatEngineReturn = {
  stage: DisappearingBeatStage;
  barCount: number;
  volumeA: number;
  volumeB: number;
  start: () => void;
  stop: () => void;
  onDriftResult: (driftResult: DriftResult) => void;
};

/**
 * Core state machine for the Disappearing Beat mode.
 *
 * Manages stage progression:
 * warmup -> stage1 (fade to 50%) -> stage2 (fade to 0%) -> stage3 (both muted) -> return -> completed
 *
 * Subscribes to audioStore.onCycleComplete for bar counting.
 * Triggers fades/mutes at stage transitions on cycle boundaries (beat 1).
 */
export const useDisappearingBeatEngine = (
  config: StageConfig,
  onComplete: (result: DisappearingBeatResult) => void,
): UseDisappearingBeatEngineReturn => {
  const [state, setState] = useState<EngineState>({
    stage: 'idle',
    barCount: 0,
    volumeA: 1,
    volumeB: 1,
    startTime: null,
  });

  const driftResultRef = useRef<DriftResult | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Store refs for state machine access inside callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  const {
    play: audioPlay,
    stop: audioStop,
    setRatio: audioSetRatio,
    setBpm: audioSetBpm,
    fadeLayer: audioFadeLayer,
    muteAll: audioMuteAll,
    unmuteAll: audioUnmuteAll,
    setVolumeA: audioSetVolumeA,
    setVolumeB: audioSetVolumeB,
    onCycleComplete: audioOnCycleComplete,
  } = useAudioStore(
    useShallow((s) => ({
      play: s.play,
      stop: s.stop,
      setRatio: s.setRatio,
      setBpm: s.setBpm,
      fadeLayer: s.fadeLayer,
      muteAll: s.muteAll,
      unmuteAll: s.unmuteAll,
      setVolumeA: s.setVolumeA,
      setVolumeB: s.setVolumeB,
      onCycleComplete: s.onCycleComplete,
    })),
  );

  const completeSession = useCallback(() => {
    const cfg = configRef.current;
    const startTime = stateRef.current.startTime;
    const durationSeconds = startTime
      ? Math.round((Date.now() - startTime) / 1000)
      : 0;

    const result: DisappearingBeatResult = {
      config: cfg,
      highestStage: STAGE_NUMBER[stateRef.current.stage] ?? 0,
      driftResult: driftResultRef.current,
      durationSeconds,
      completed: true,
    };

    setState((prev) => ({ ...prev, stage: 'completed' }));
    audioStop();
    onCompleteRef.current(result);
  }, [audioStop]);

  const transitionToStage = useCallback(
    (nextStage: DisappearingBeatStage) => {
      const cfg = configRef.current;

      switch (nextStage) {
        case 'stage1': {
          // Fade target layer to 50% over 2 bars
          audioFadeLayer(cfg.targetLayer, 0.5, FADE_DURATION_CYCLES);
          const newVol =
            cfg.targetLayer === 'A'
              ? { volumeA: 0.5, volumeB: 1 }
              : { volumeA: 1, volumeB: 0.5 };
          setState((prev) => ({
            ...prev,
            stage: 'stage1',
            barCount: 0,
            ...newVol,
          }));
          break;
        }
        case 'stage2': {
          // Fade target layer to 0% over 2 bars
          audioFadeLayer(cfg.targetLayer, 0, FADE_DURATION_CYCLES);
          const newVol =
            cfg.targetLayer === 'A'
              ? { volumeA: 0, volumeB: 1 }
              : { volumeA: 1, volumeB: 0 };
          setState((prev) => ({
            ...prev,
            stage: 'stage2',
            barCount: 0,
            ...newVol,
          }));
          break;
        }
        case 'stage3': {
          // Mute both layers
          audioMuteAll();
          setState((prev) => ({
            ...prev,
            stage: 'stage3',
            barCount: 0,
            volumeA: 0,
            volumeB: 0,
          }));
          break;
        }
        case 'return': {
          // Snap both layers back to 100%
          audioUnmuteAll();
          audioSetVolumeA(1);
          audioSetVolumeB(1);
          setState((prev) => ({
            ...prev,
            stage: 'return',
            barCount: 0,
            volumeA: 1,
            volumeB: 1,
          }));
          break;
        }
        case 'completed': {
          completeSession();
          break;
        }
        default:
          break;
      }
    },
    [audioFadeLayer, audioMuteAll, audioUnmuteAll, audioSetVolumeA, audioSetVolumeB, completeSession],
  );

  // Subscribe to cycle completions for bar counting
  useEffect(() => {
    const unsub = audioOnCycleComplete(() => {
      setState((prev) => {
        const current = prev.stage;
        if (current === 'idle' || current === 'completed') return prev;

        const cfg = configRef.current;
        const newBarCount = prev.barCount + 1;

        if (current === 'warmup') {
          const elapsed = prev.startTime
            ? Date.now() - prev.startTime
            : 0;
          if (elapsed >= MIN_WARMUP_MS && newBarCount >= cfg.barsPerStage) {
            // Schedule transition outside setState
            setTimeout(() => transitionToStage('stage1'), 0);
            return prev;
          }
          return { ...prev, barCount: newBarCount };
        }

        if (current === 'stage1' && newBarCount >= cfg.barsPerStage) {
          setTimeout(() => transitionToStage('stage2'), 0);
          return prev;
        }

        if (current === 'stage2' && newBarCount >= cfg.barsPerStage) {
          setTimeout(() => transitionToStage('stage3'), 0);
          return prev;
        }

        if (current === 'stage3' && newBarCount >= cfg.barsPerStage) {
          setTimeout(() => transitionToStage('return'), 0);
          return prev;
        }

        if (current === 'return' && newBarCount >= cfg.returnCycles) {
          setTimeout(() => transitionToStage('completed'), 0);
          return prev;
        }

        return { ...prev, barCount: newBarCount };
      });
    });

    return unsub;
  }, [audioOnCycleComplete, transitionToStage]);

  const start = useCallback(() => {
    const cfg = configRef.current;

    // Configure audio
    audioSetRatio(cfg.ratioA, cfg.ratioB);
    audioSetBpm(cfg.bpm);
    audioSetVolumeA(1);
    audioSetVolumeB(1);

    // Reset drift result
    driftResultRef.current = null;

    setState({
      stage: 'warmup',
      barCount: 0,
      volumeA: 1,
      volumeB: 1,
      startTime: Date.now(),
    });

    audioPlay();
  }, [audioSetRatio, audioSetBpm, audioSetVolumeA, audioSetVolumeB, audioPlay]);

  const stop = useCallback(() => {
    const startTime = stateRef.current.startTime;
    const durationSeconds = startTime
      ? Math.round((Date.now() - startTime) / 1000)
      : 0;

    audioStop();

    const result: DisappearingBeatResult = {
      config: configRef.current,
      highestStage: STAGE_NUMBER[stateRef.current.stage] ?? 0,
      driftResult: driftResultRef.current,
      durationSeconds,
      completed: false,
    };

    setState({
      stage: 'idle',
      barCount: 0,
      volumeA: 1,
      volumeB: 1,
      startTime: null,
    });

    onCompleteRef.current(result);
  }, [audioStop]);

  const onDriftResult = useCallback((driftResult: DriftResult) => {
    driftResultRef.current = driftResult;
  }, []);

  return {
    stage: state.stage,
    barCount: state.barCount,
    volumeA: state.volumeA,
    volumeB: state.volumeB,
    start,
    stop,
    onDriftResult,
  };
};
