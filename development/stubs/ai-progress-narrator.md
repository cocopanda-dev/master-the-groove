# AI Progress Narrator
**Phase:** P2
**Depends on:** Progress Tracking (weekly overview in Progress tab)

## What It Does
Transforms raw weekly practice statistics into a coach-like narrative paragraph. Claude receives 7 days of session data including polyrhythms practiced, durations, feel state changes, and disappearing beat high-water marks, then returns a personalized narrative summary and a focus suggestion for the coming week. This replaces the stats-only weekly view with something that feels like a real coach checking in.

## Interfaces
```typescript
interface ProgressNarratorRequest {
  sessions: Session[];                    // all sessions from the past 7 days
  feelStateChanges: {
    polyrhythmId: string;
    from: 'executing' | 'hearing' | 'feeling';
    to: 'executing' | 'hearing' | 'feeling';
  }[];
  disappearingBeatHighWater: number;      // highest stage reached this week (1-3)
}

interface ProgressNarratorResponse {
  narrative: string;                      // coach-like paragraph summary
  focusSuggestion: string;               // specific suggestion for next week
}
```

## Extension Points
- **Weekly summary section in Progress tab** — MVP Progress tab shows raw stats (streaks, total time, polyrhythms visited, feel state badges). P2 adds a narrative card below the stats section that displays the AI-generated coach summary and focus suggestion.

## Data Shapes
```
ai_interactions (existing table — reused)
  requestType = 'progress-narrator'

weekly_digests
  id            UUID PRIMARY KEY
  userId        UUID REFERENCES users(id)
  weekStart     DATE NOT NULL          -- Monday of the digest week
  narrative     TEXT NOT NULL           -- generated narrative
  focusSuggestion TEXT NOT NULL
  createdAt     TIMESTAMPTZ
  UNIQUE(userId, weekStart)
```
Weekly digests are generated once per week (on first Progress tab visit after Monday, or via push notification trigger) and cached in `weekly_digests`.
