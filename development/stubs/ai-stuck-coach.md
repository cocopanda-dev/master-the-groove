# AI "I'm Stuck" Coach
**Phase:** P1
**Depends on:** Feel Internalization Lessons, Core Polyrhythm Player, Disappearing Beat Mode

## What It Does
Provides a "Help" button across lesson, practice, and disappearing beat screens. When tapped, the app asks one quick clarifying question ("Are you losing the 3 or the 2?"), then sends full session context to Claude. Claude returns a personalized micro-lesson of 3-5 concrete steps tailored to the user's specific struggle point, along with encouragement and a suggested follow-up exercise.

## Interfaces
```typescript
interface StuckCoachRequest {
  polyrhythm: string;              // e.g. "3:2"
  mode: 'lesson' | 'practice' | 'disappearing-beat';
  durationAtStage: number;         // seconds spent at current stage
  feelState: 'executing' | 'hearing' | 'feeling';
  losingLayer: 'A' | 'B' | null;  // which layer user reports losing (matches api-contracts.md)
}

interface StuckCoachResponse {
  steps: string[];                 // 3-5 step micro-lesson
  encouragement: string;           // motivational closing line
  suggestedExercise: string;       // specific follow-up exercise name/description
}
```

## Extension Points
- **Help button placeholder on lesson screen** — MVP lesson screen reserves a help button slot (rendered as no-op). P1 wires it to the stuck coach flow.
- **Help button on practice screen** — Same pattern on the core player / free practice screen.
- **Help button on disappearing beat screen** — Appears when user has been on a stage longer than a threshold (e.g., 60 seconds).
- **`useAICoach` hook** — MVP ships a no-op hook (`useAICoach`) that returns `{ isAvailable: false }`. P1 replaces the implementation to handle request/response with Claude API.

## Data Shapes
```
ai_interactions
  id            UUID PRIMARY KEY
  userId        UUID REFERENCES users(id)
  requestType   TEXT            -- 'stuck-coach' | 'vocal-coach' | 'song-recommend' | etc.
  request       JSONB           -- full request payload
  response      JSONB           -- full response payload
  createdAt     TIMESTAMPTZ
```
This table is shared across all AI features as a unified interaction log.
