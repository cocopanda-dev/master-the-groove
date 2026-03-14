// src/libs/sync/sync-triggers.ts
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { flushSyncQueue } from './sync-service';

let netInfoUnsub: (() => void) | null = null;
let appStateUnsub: { remove: () => void } | null = null;

export const startSyncTriggers = (): void => {
  // Trigger on connectivity restore
  netInfoUnsub = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      flushSyncQueue().catch(console.error);
    }
  }) as unknown as () => void;

  // Trigger on app foreground
  const handleAppState = (nextState: AppStateStatus): void => {
    if (nextState === 'active') {
      flushSyncQueue().catch(console.error);
    }
  };
  appStateUnsub = AppState.addEventListener('change', handleAppState);
};

export const stopSyncTriggers = (): void => {
  netInfoUnsub?.();
  netInfoUnsub = null;
  appStateUnsub?.remove();
  appStateUnsub = null;
};

export const triggerSyncAfterSessionEnd = (): void => {
  flushSyncQueue().catch(console.error);
};
