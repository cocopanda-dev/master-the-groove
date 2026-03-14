import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwakeAsync } from 'expo-keep-awake';
import { useAudioStore } from '@data-access/stores/use-audio-store';

interface KeepAwakeOptions {
  /**
   * When true, keep-awake is always active while the component is mounted,
   * regardless of audio playback state. Use for screens like Disappearing Beat,
   * Duet Tap, and Baby Visualizer that should always stay awake.
   */
  always?: boolean;
}

const KEEP_AWAKE_TAG = 'groovecore-playback';

/**
 * Conditionally activates keep-awake based on audio playback state.
 *
 * Usage:
 * - `useKeepAwakeWhilePlaying()` -- activates only when audioStore.isPlaying is true
 * - `useKeepAwakeWhilePlaying({ always: true })` -- activates for entire mount lifecycle
 *
 * Always deactivates on unmount to prevent battery drain.
 */
const useKeepAwakeWhilePlaying = (options?: KeepAwakeOptions): void => {
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const shouldKeepAwake = options?.always === true || isPlaying;

  useEffect(() => {
    if (shouldKeepAwake) {
      activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    } else {
      deactivateKeepAwakeAsync(KEEP_AWAKE_TAG);
    }

    return () => {
      deactivateKeepAwakeAsync(KEEP_AWAKE_TAG);
    };
  }, [shouldKeepAwake]);
};

export { useKeepAwakeWhilePlaying };
export type { KeepAwakeOptions };
