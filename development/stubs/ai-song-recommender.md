# AI Song Recommender
**Phase:** P2
**Depends on:** Real Music Context Library (P1), Data Layer (user genre preferences from onboarding)

## What It Does
Extends the curated Real Music Context library with personalized, AI-generated song recommendations. Claude receives the polyrhythm ratio, the user's genre preferences (set during onboarding), and their current skill level, then returns 3-4 song recommendations with specific timestamps and listening instructions tailored to the user's musical taste. A hip-hop fan gets J Dilla tracks; a classical listener gets Chopin nocturnes.

## Interfaces
```typescript
interface SongRecommendRequest {
  polyrhythm: string;          // e.g. "3:2"
  genres: string[];            // user's preferred genres from onboarding
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface SongRecommendResponse {
  recommendations: SongExample[];  // reuses SongExample from real-music-context
}
```

## Extension Points
- **"Hear this in real music" button on polyrhythm pages** — Appears below the curated song list from P1's Real Music Context. Tapping triggers the AI recommendation flow and appends personalized results below the curated ones.
- **Reuses `SongExample` display component from real-music-context** — AI-generated recommendations render using the same card component as curated songs, visually distinguished with a subtle "AI pick" badge.

## Data Shapes
AI-generated recommendations are cached in the shared `ai_interactions` table:
```
ai_interactions (existing table from P1 ai-stuck-coach)
  id            UUID PRIMARY KEY
  userId        UUID REFERENCES users(id)
  requestType   TEXT            -- 'song-recommend'
  request       JSONB           -- SongRecommendRequest
  response      JSONB           -- SongRecommendResponse
  createdAt     TIMESTAMPTZ
```
Cached results are served for repeat requests to the same polyrhythm until the user explicitly refreshes.
