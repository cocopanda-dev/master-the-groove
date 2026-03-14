// src/libs/sync/__tests__/sync-triggers.test.ts
import { startSyncTriggers, stopSyncTriggers, triggerSyncAfterSessionEnd } from '../sync-triggers';
import NetInfo from '@react-native-community/netinfo';
import { flushSyncQueue } from '../sync-service';

jest.mock('../sync-service', () => ({
  flushSyncQueue: jest.fn().mockResolvedValue(undefined),
}));

describe('syncTriggers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopSyncTriggers();
  });

  it('startSyncTriggers registers a netinfo listener', () => {
    startSyncTriggers();
    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });

  it('stopSyncTriggers cleans up without error', () => {
    startSyncTriggers();
    expect(() => stopSyncTriggers()).not.toThrow();
  });

  it('triggerSyncAfterSessionEnd calls flushSyncQueue', () => {
    triggerSyncAfterSessionEnd();
    expect(flushSyncQueue).toHaveBeenCalled();
  });

  it('flushes on connectivity restore', () => {
    const mockAddEventListener = NetInfo.addEventListener as jest.Mock;
    const captured: { listener: ((state: { isConnected: boolean; isInternetReachable: boolean }) => void) | null } = { listener: null };
    mockAddEventListener.mockImplementationOnce(
      (cb: (state: { isConnected: boolean; isInternetReachable: boolean }) => void) => {
        captured.listener = cb;
        return () => {};
      }
    );

    startSyncTriggers();
    captured.listener?.({ isConnected: true, isInternetReachable: true });
    expect(flushSyncQueue).toHaveBeenCalled();
  });
});
