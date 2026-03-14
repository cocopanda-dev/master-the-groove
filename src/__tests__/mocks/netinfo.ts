const listeners: Array<(state: { isConnected: boolean; isInternetReachable: boolean }) => void> = [];

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((cb: (state: { isConnected: boolean; isInternetReachable: boolean }) => void) => {
    listeners.push(cb);
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }),
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  }),
}));

export { listeners as netInfoListeners };
