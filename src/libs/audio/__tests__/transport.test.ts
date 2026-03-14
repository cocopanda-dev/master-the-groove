// src/libs/audio/__tests__/transport.test.ts
import { createTransport } from '../transport';

jest.mock('../sound-loader', () => ({
  playSound: jest.fn().mockResolvedValue(undefined),
}));

describe('Transport', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('play() starts playback', () => {
    const transport = createTransport();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    expect(transport.isPlaying()).toBe(true);
  });

  it('stop() resets state', () => {
    const transport = createTransport();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(5000);
    transport.stop();
    expect(transport.isPlaying()).toBe(false);
    expect(transport.getCycleCount()).toBe(0);
  });

  it('pause() preserves cycle count', () => {
    const transport = createTransport();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(3500); // past 1 cycle (3000ms for 3:2 at 120)
    transport.pause();
    expect(transport.isPlaying()).toBe(false);
    expect(transport.getCycleCount()).toBeGreaterThan(0);
  });

  it('fires onBeat callbacks', () => {
    const transport = createTransport();
    const handler = jest.fn();
    transport.onBeat(handler);
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(3000); // 1 full cycle = 5 events
    expect(handler).toHaveBeenCalled();
  });

  it('fires onCycleComplete callback', () => {
    const transport = createTransport();
    const handler = jest.fn();
    transport.onCycleComplete(handler);
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(3000);
    expect(handler).toHaveBeenCalledWith(1);
  });

  it('onBeat returns unsubscribe function', () => {
    const transport = createTransport();
    const handler = jest.fn();
    const unsub = transport.onBeat(handler);
    unsub();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(3000);
    expect(handler).not.toHaveBeenCalled();
  });

  it('applies stereo split panning when enabled', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { playSound: mockPlay } = require('../sound-loader');
    const transport = createTransport();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.setStereoSplit(true);
    transport.play();
    jest.advanceTimersByTime(100);
    // Verify playSound called with pan -1 or 1
    const calls = mockPlay.mock.calls;
    expect(calls.some((c: unknown[]) => c[2] === -1 || c[2] === 1)).toBe(true);
  });
});
