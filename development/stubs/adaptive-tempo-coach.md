# Adaptive Tempo Coach
**Phase:** P2
**Depends on:** Core Polyrhythm Player (tempo control), Data Layer (session analysis / session history)

## What It Does
Analyzes a user's practice history to suggest optimal tempo progression for each polyrhythm. Detects when the user is comfortable at a given BPM (consistent feel state, completing disappearing beat stages) and suggests a small increase, or detects struggle (regression in feel state, repeated failures) and suggests slowing down. The suggestion appears as a non-intrusive badge near the tempo control, respecting the user's autonomy over their practice.

## Interfaces
```typescript
interface TempoAnalysis {
  currentComfortBpm: number;              // estimated BPM where user is solid
  suggestedNextBpm: number;               // recommended next target BPM
  reasoning: string;                      // human-readable explanation
  confidenceLevel: 'high' | 'medium' | 'low';
}

interface TempoCoachConfig {
  aggressiveness: 'gentle' | 'moderate' | 'push';
}
```

## Extension Points
- **Tempo control area in core player** — MVP tempo control is a simple BPM slider/stepper. P2 adds a suggestion badge next to the tempo display (e.g., a small upward arrow with "Try 78 BPM") that the user can tap to accept or dismiss.
- **Post-session summary** — After a practice session ends, the session summary card includes a tempo insight line (e.g., "You seemed comfortable at 72 BPM today. Next session, try 78.").

## Data Shapes
```
tempo_progression
  id              UUID PRIMARY KEY
  userId          UUID REFERENCES users(id)
  polyrhythmId    TEXT NOT NULL          -- e.g. "3:2"
  bpm             INTEGER NOT NULL
  comfortScore    REAL NOT NULL          -- 0.0-1.0, derived from session metrics
  timestamp       TIMESTAMPTZ NOT NULL
```
The comfort score is computed locally from session signals: feel state self-report, disappearing beat stage reached, session duration at this BPM, and consistency across recent sessions. No AI call required for the core analysis — this is algorithmic. The `reasoning` string in `TempoAnalysis` is template-generated, not AI-generated.
