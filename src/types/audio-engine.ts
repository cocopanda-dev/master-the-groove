// src/types/audio-engine.ts
// Extension point interfaces -- type-only, no implementation until P1

export type MicInputHook = {
  onOnsetDetected: (timestamp: number, amplitude: number) => void;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  isListening: boolean;
};

export type AccelerometerHook = {
  onStompDetected: (timestamp: number, magnitude: number) => void;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  isTracking: boolean;
  sensitivity: number;
};

export type OnsetRecord = {
  timestamp: number;
  layer: 'A' | 'B';
  expectedTimestamp: number;
  deviationMs: number;
  accuracy: 'early' | 'late' | 'on-beat';
};

export type OnsetDetectionCallback = {
  reportOnset: (timestamp: number, layer: 'A' | 'B', deviationMs: number) => void;
  getSessionOnsets: () => OnsetRecord[];
  clearSessionOnsets: () => void;
};
