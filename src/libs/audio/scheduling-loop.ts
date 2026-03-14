// src/libs/audio/scheduling-loop.ts
import type { ScheduleEvent } from '@operations/polyrhythm';

type SchedulingLoopConfig = {
  events: ScheduleEvent[];
  cycleDurationMs: number;
  onEvent: (event: ScheduleEvent) => void;
  onCycleEnd: (cycleCount: number) => void;
};

type SchedulingLoop = {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isRunning: () => boolean;
};

export const createSchedulingLoop = (config: SchedulingLoopConfig): SchedulingLoop => {
  let running = false;
  let cycleCount = 0;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let cycleTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTimers = (): void => {
    timers.forEach(clearTimeout);
    timers = [];
    if (cycleTimer) {
      clearTimeout(cycleTimer);
      cycleTimer = null;
    }
  };

  const scheduleCycle = (): void => {
    if (!running) return;

    for (const event of config.events) {
      const delay = Math.max(0, event.time);
      const timer = setTimeout(() => {
        if (running) {
          config.onEvent(event);
        }
      }, delay);
      timers.push(timer);
    }

    cycleTimer = setTimeout(() => {
      if (running) {
        cycleCount++;
        config.onCycleEnd(cycleCount);
        clearTimers();
        scheduleCycle();
      }
    }, config.cycleDurationMs);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    cycleCount = 0;
    scheduleCycle();
  };

  const stop = (): void => {
    running = false;
    cycleCount = 0;
    clearTimers();
  };

  const pause = (): void => {
    running = false;
    clearTimers();
  };

  const resume = (): void => {
    if (running) return;
    running = true;
    scheduleCycle();
  };

  const isRunning = (): boolean => running;

  return { start, stop, pause, resume, isRunning };
};
