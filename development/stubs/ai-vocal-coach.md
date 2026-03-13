# AI Vocal Coach
**Phase:** P1
**Depends on:** Feel Internalization Lessons (step 4 — Sing & Tap), Audio Engine (mic input hook)

## What It Does
Records 4-8 bars of user singing/humming via the device microphone while one polyrhythm layer plays back. On-device onset detection extracts rhythmic timing data from the recording. Claude receives the polyrhythm ratio, extracted timing data, and session tempo, then returns a 2-3 sentence coaching note identifying specific feel issues (e.g., rushing subdivisions, drifting off beat 1).

## Interfaces
```typescript
interface VocalOnsetData {
  onsets: { timeMs: number; confidence: number }[];
  duration: number;
}

interface VocalCoachRequest {
  polyrhythm: string;       // e.g. "3:2"
  onsetData: VocalOnsetData;
  bpm: number;
  lessonStep: number;
}

interface VocalCoachResponse {
  feedback: string;         // 2-3 sentence coaching note
  focusArea: string;        // e.g. "subdivision timing", "beat 1 alignment"
}
```

## Extension Points
- **Mic input hook in audio engine** — MVP audio engine has no mic access; P1 adds a `useMicRecording` hook that handles permission requests, recording start/stop, and raw audio buffer access.
- **Sing step overlay in feel-lessons** — Lesson step 4 (Sing the 3 while tapping the 2) currently runs without feedback. P1 adds a recording overlay with a "Record" button, waveform display, and post-recording coaching card.
- **New permission request for microphone** — First use triggers OS microphone permission dialog with an in-app explainer screen before the system prompt.

## Data Shapes
```
vocal_sessions
  id            UUID PRIMARY KEY
  sessionId     UUID REFERENCES sessions(id)
  onsetData     JSONB           -- VocalOnsetData
  aiFeedback    TEXT            -- raw Claude response
  createdAt     TIMESTAMPTZ
```
