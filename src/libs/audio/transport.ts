// src/libs/audio/transport.ts
import { generatePolyrhythmSchedule } from '@operations/polyrhythm';
import { createSchedulingLoop } from './scheduling-loop';
import { playSound } from './sound-loader';
import { computeFinalVolume } from './volume-utils';
import { createCallbackRegistry } from './callbacks';
import type { ScheduleEvent } from '@operations/polyrhythm';
import type { SoundId } from '@types';

type BeatCallback = (layer: 'A' | 'B', beatIndex: number, timestamp: number) => void;
type CycleCallback = (cycleCount: number) => void;

type TransportState = {
  ratioA: number;
  ratioB: number;
  bpm: number;
  soundA: SoundId;
  soundB: SoundId;
  volumeA: number;
  volumeB: number;
  masterVolume: number;
  stereoSplit: boolean;
};

export const createTransport = () => {
  let playing = false;
  let paused = false;
  let cycleCount = 0;
  let loop: ReturnType<typeof createSchedulingLoop> | null = null;
  let beat1Timestamp = 0;

  const state: TransportState = {
    ratioA: 3,
    ratioB: 2,
    bpm: 90,
    soundA: 'click',
    soundB: 'clave',
    volumeA: 0.8,
    volumeB: 0.8,
    masterVolume: 1.0,
    stereoSplit: false,
  };

  const beatCallbacks = createCallbackRegistry<[layer: 'A' | 'B', beatIndex: number, timestamp: number]>();
  const cycleCallbacks = createCallbackRegistry<[cycleCount: number]>();

  const handleEvent = (event: ScheduleEvent): void => {
    const sound = event.layer === 'A' ? state.soundA : state.soundB;
    const layerVol = event.layer === 'A' ? state.volumeA : state.volumeB;
    const finalVol = computeFinalVolume(layerVol, state.masterVolume);
    const pan = state.stereoSplit ? (event.layer === 'A' ? -1 : 1) : 0;

    if (finalVol > 0) {
      playSound(sound, finalVol, pan).catch(() => {});
    }

    beatCallbacks.fire(event.layer, event.beatIndex, Date.now());

    if (event.beatIndex === 0 && event.layer === 'A') {
      beat1Timestamp = Date.now();
    }
  };

  const handleCycleEnd = (count: number): void => {
    cycleCount = count;
    cycleCallbacks.fire(count);
  };

  const play = (): void => {
    if (playing) return;
    playing = true;
    paused = false;

    const schedule = generatePolyrhythmSchedule(state.ratioA, state.ratioB, state.bpm);
    loop = createSchedulingLoop({
      events: schedule.events,
      cycleDurationMs: schedule.cycleDurationMs,
      onEvent: handleEvent,
      onCycleEnd: handleCycleEnd,
    });
    loop.start();
  };

  const pause = (): void => {
    if (!playing) return;
    playing = false;
    paused = true;
    loop?.pause();
  };

  const stop = (): void => {
    playing = false;
    paused = false;
    cycleCount = 0;
    beat1Timestamp = 0;
    loop?.stop();
    loop = null;
  };

  return {
    play,
    pause,
    stop,
    isPlaying: () => playing,
    isPaused: () => paused,
    getCycleCount: () => cycleCount,
    getBeat1Timestamp: () => beat1Timestamp,
    setRatio: (a: number, b: number) => {
      state.ratioA = a;
      state.ratioB = b;
    },
    setBpm: (bpm: number) => {
      state.bpm = Math.max(20, Math.min(240, bpm));
    },
    setSoundA: (s: SoundId) => {
      state.soundA = s;
    },
    setSoundB: (s: SoundId) => {
      state.soundB = s;
    },
    setVolumeA: (v: number) => {
      state.volumeA = v;
    },
    setVolumeB: (v: number) => {
      state.volumeB = v;
    },
    setMasterVolume: (v: number) => {
      state.masterVolume = v;
    },
    setStereoSplit: (enabled: boolean) => {
      state.stereoSplit = enabled;
    },
    getState: () => ({ ...state }),
    onBeat: (cb: BeatCallback) => beatCallbacks.subscribe(cb),
    onCycleComplete: (cb: CycleCallback) => cycleCallbacks.subscribe(cb),
  };
};
