// src/design-system/tokens/animations.ts

/**
 * Beat pulse animation constants.
 * Layer dots scale up on beat hit and decay back to rest.
 */
export const beatPulse = {
  /** Scale factor when a beat fires */
  scaleActive: 1.3,
  /** Resting scale */
  scaleRest: 1.0,
  /** ms to reach peak scale */
  attackMs: 80,
  /** ms to return to rest */
  decayMs: 70,
} as const;

/**
 * Generic spring/timing durations.
 */
export const duration = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
