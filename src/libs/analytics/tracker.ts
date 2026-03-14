export const trackScreenView = (screenName: string) => {
  if (__DEV__) {
    console.log(`[analytics] screen: ${screenName}`);
  }
};

export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  if (__DEV__) {
    console.log(`[analytics] event: ${event}`, properties);
  }
};
