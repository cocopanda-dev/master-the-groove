# Real Music Context Library
**Phase:** P1
**Depends on:** Feel Internalization Lessons (step 1 — Hear it in music), Navigation (new Learn tab screen)

## What It Does
Annotates every polyrhythm in the app with 3-5 curated real song examples, each with specific timestamps and plain-language listening instructions that tell the user exactly where and how to hear the rhythm in familiar music. This is the primary bridge between abstract pattern knowledge and embodied feel — connecting "3:2" to a song you already love collapses the internalization gap.

## Interfaces
```typescript
interface SongExample {
  title: string;
  artist: string;
  genre: string;
  culturalOrigin: string;
  listenFor: string;          // e.g. "The bass holds the 2 while the melody rides the 3"
  timestamp: string;          // e.g. "0:42"
  spotifyUrl?: string;
  youtubeUrl?: string;
}

interface PolyrhythmContext {
  polyrhythmId: string;       // e.g. "3:2"
  songs: SongExample[];       // 3-5 curated examples
}
```

## Extension Points
- **Lesson step 1 content area** — Currently text-only ("Hear it in music first"). P1 replaces this with a scrollable list of `SongExample` cards, each with a "Listen" button that deep-links to Spotify/YouTube at the specified timestamp.
- **New "Real Music" screen in Learn tab** — Expo Router file added under `(tabs)/learn/real-music.tsx`. Browsable library of all polyrhythms and their song examples, filterable by genre and cultural origin.

## Data Shapes
```
song_examples
  id              UUID PRIMARY KEY
  polyrhythmId    TEXT NOT NULL      -- e.g. "3:2", "4:3"
  title           TEXT NOT NULL
  artist          TEXT NOT NULL
  genre           TEXT NOT NULL
  culturalOrigin  TEXT NOT NULL
  listenFor       TEXT NOT NULL
  timestamp       TEXT NOT NULL
  spotifyUrl      TEXT NULLABLE
  youtubeUrl      TEXT NULLABLE
  createdAt       TIMESTAMPTZ
```
All content is editorially curated, not AI-generated. Song data is seeded via migration and updatable via app updates.
