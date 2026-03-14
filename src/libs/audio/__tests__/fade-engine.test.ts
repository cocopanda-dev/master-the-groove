// src/libs/audio/__tests__/fade-engine.test.ts
import { createFadeEngine } from '../fade-engine';

describe('FadeEngine', () => {
  it('computes volume steps for a linear fade', () => {
    const setVolume = jest.fn();
    const engine = createFadeEngine();

    engine.startFade({
      layer: 'A',
      fromVolume: 1.0,
      targetVolume: 0.0,
      totalSteps: 4,
      setVolume,
    });

    // Simulate 4 beat ticks
    engine.tick('A'); // step 1: 0.75
    engine.tick('A'); // step 2: 0.50
    engine.tick('A'); // step 3: 0.25
    engine.tick('A'); // step 4: 0.00

    expect(setVolume).toHaveBeenCalledTimes(4);
    expect(setVolume).toHaveBeenLastCalledWith('A', 0);
  });

  it('fade is interruptible -- new fade cancels previous', () => {
    const setVolume = jest.fn();
    const engine = createFadeEngine();

    engine.startFade({ layer: 'A', fromVolume: 1.0, targetVolume: 0.0, totalSteps: 4, setVolume });
    engine.tick('A'); // step 1: 0.75

    // Start new fade
    engine.startFade({ layer: 'A', fromVolume: 0.75, targetVolume: 1.0, totalSteps: 2, setVolume });
    engine.tick('A'); // step 1: 0.875
    engine.tick('A'); // step 2: 1.0

    const lastCall = setVolume.mock.calls[setVolume.mock.calls.length - 1];
    expect(lastCall).toEqual(['A', 1.0]);
  });

  it('cancelFade stops fade for a layer', () => {
    const setVolume = jest.fn();
    const engine = createFadeEngine();

    engine.startFade({ layer: 'A', fromVolume: 1.0, targetVolume: 0.0, totalSteps: 4, setVolume });
    engine.tick('A');
    engine.cancelFade('A');
    setVolume.mockClear();
    engine.tick('A');
    expect(setVolume).not.toHaveBeenCalled();
  });

  it('independent fades on A and B', () => {
    const setVolume = jest.fn();
    const engine = createFadeEngine();

    engine.startFade({ layer: 'A', fromVolume: 1.0, targetVolume: 0.0, totalSteps: 2, setVolume });
    engine.startFade({ layer: 'B', fromVolume: 0.0, targetVolume: 1.0, totalSteps: 2, setVolume });

    engine.tick('A');
    engine.tick('B');
    engine.tick('A');
    engine.tick('B');

    const aCalls = setVolume.mock.calls.filter((c: unknown[]) => c[0] === 'A');
    const bCalls = setVolume.mock.calls.filter((c: unknown[]) => c[0] === 'B');
    expect(aCalls[aCalls.length - 1]).toEqual(['A', 0]);
    expect(bCalls[bCalls.length - 1]).toEqual(['B', 1.0]);
  });
});
