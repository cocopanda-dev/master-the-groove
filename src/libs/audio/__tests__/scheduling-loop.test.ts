// src/libs/audio/__tests__/scheduling-loop.test.ts
import { createSchedulingLoop } from '../scheduling-loop';
import type { ScheduleEvent } from '@operations/polyrhythm';

describe('SchedulingLoop', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const makeEvents = (): ScheduleEvent[] => [
    { time: 0, layer: 'A', beatIndex: 0 },
    { time: 0, layer: 'B', beatIndex: 0 },
    { time: 1000, layer: 'A', beatIndex: 1 },
    { time: 1500, layer: 'B', beatIndex: 1 },
    { time: 2000, layer: 'A', beatIndex: 2 },
  ];

  it('fires onEvent for each scheduled event', () => {
    const onEvent = jest.fn();
    const onCycleEnd = jest.fn();
    const loop = createSchedulingLoop({
      events: makeEvents(),
      cycleDurationMs: 3000,
      onEvent,
      onCycleEnd,
    });

    loop.start();
    jest.advanceTimersByTime(3000);

    expect(onEvent).toHaveBeenCalledTimes(5);
    expect(onCycleEnd).toHaveBeenCalledTimes(1);
  });

  it('stop() prevents further events', () => {
    const onEvent = jest.fn();
    const loop = createSchedulingLoop({
      events: makeEvents(),
      cycleDurationMs: 3000,
      onEvent,
      onCycleEnd: jest.fn(),
    });

    loop.start();
    jest.advanceTimersByTime(500);
    loop.stop();
    const countAfterStop = onEvent.mock.calls.length;
    jest.advanceTimersByTime(5000);
    expect(onEvent.mock.calls.length).toBe(countAfterStop);
  });

  it('loops continuously until stopped', () => {
    const onCycleEnd = jest.fn();
    const loop = createSchedulingLoop({
      events: makeEvents(),
      cycleDurationMs: 3000,
      onEvent: jest.fn(),
      onCycleEnd,
    });

    loop.start();
    jest.advanceTimersByTime(9000); // 3 full cycles
    loop.stop();
    expect(onCycleEnd).toHaveBeenCalledTimes(3);
  });
});

// Satisfy unused import
const _unused: ScheduleEvent[] = [];
void _unused;
