// src/operations/polyrhythm/generate-schedule.ts
import { lcm } from './math-utils';

export type ScheduleEvent = {
  time: number;
  layer: 'A' | 'B';
  beatIndex: number;
};

export type PolyrhythmSchedule = {
  events: ScheduleEvent[];
  cycleDurationMs: number;
  lcm: number;
};

export const generatePolyrhythmSchedule = (
  ratioA: number,
  ratioB: number,
  bpm: number,
): PolyrhythmSchedule => {
  if (ratioA <= 0 || ratioB <= 0) {
    throw new Error(`Invalid ratio: ${ratioA}:${ratioB}. Both must be positive integers.`);
  }
  if (bpm < 20 || bpm > 240) {
    throw new Error(`Invalid BPM: ${bpm}. Must be between 20 and 240.`);
  }

  const cycleLength = lcm(ratioA, ratioB);
  const cycleDurationMs = (cycleLength / bpm) * 60000;
  const intervalA = cycleDurationMs / ratioA;
  const intervalB = cycleDurationMs / ratioB;

  const events: ScheduleEvent[] = [];

  for (let i = 0; i < ratioA; i++) {
    events.push({ time: i * intervalA, layer: 'A', beatIndex: i });
  }

  for (let i = 0; i < ratioB; i++) {
    events.push({ time: i * intervalB, layer: 'B', beatIndex: i });
  }

  events.sort((a, b) => a.time - b.time || (a.layer === 'A' ? -1 : 1));

  return { events, cycleDurationMs, lcm: cycleLength };
};
