# Social Streaks
**Phase:** P3
**Depends on:** Progress Tracking (streaks — MVP tracks locally), Navigation (new social feed screen)

## What It Does
Extends MVP's local-only practice streaks into a social feature. Users can see friends' current streaks, last-practiced polyrhythm, and feel state. A social feed shows recent friend activity with options to send encouragement. An optional leaderboard ranks practice consistency (days practiced, not accuracy scores) — reinforcing the app's "feel over competition" philosophy.

## Interfaces
```typescript
interface Streak {
  userId: string;
  currentDays: number;                    // consecutive days practiced
  longestDays: number;                    // all-time longest streak
  lastPracticeDate: string;               // ISO date string
}

interface FriendActivity {
  userId: string;
  displayName: string;
  streak: Streak;
  lastPolyrhythm: string;                // e.g. "3:2"
  lastFeelState: 'executing' | 'hearing' | 'feeling';
  lastSessionAt: string;                  // ISO datetime
}
```

## Extension Points
- **Streak widget on Progress tab** — MVP Progress tab tracks streaks locally and displays a simple streak counter. P3 syncs streaks to the server and adds a social streak widget showing the user's streak alongside friends' streaks.
- **New social feed screen** — New Expo Router screen accessible from Progress tab or as a dedicated section. Shows a chronological feed of friend activity with "Send encouragement" quick actions.
- **Share button on session complete** — Post-session summary screen gains a "Share" button that posts the session highlight (polyrhythm, feel state, streak count) to the activity feed.

## Data Shapes
```
streaks
  id                UUID PRIMARY KEY
  userId            UUID REFERENCES users(id) UNIQUE
  currentDays       INTEGER NOT NULL DEFAULT 0
  longestDays       INTEGER NOT NULL DEFAULT 0
  lastPracticeDate  DATE NULLABLE
  updatedAt         TIMESTAMPTZ

friend_connections
  id              UUID PRIMARY KEY
  userId          UUID REFERENCES users(id)
  friendId        UUID REFERENCES users(id)
  status          TEXT NOT NULL          -- 'pending' | 'accepted' | 'blocked'
  createdAt       TIMESTAMPTZ
  UNIQUE(userId, friendId)

activity_feed
  id              UUID PRIMARY KEY
  userId          UUID REFERENCES users(id)
  eventType       TEXT NOT NULL          -- 'session_complete' | 'streak_milestone' | 'feel_state_change' | 'encouragement'
  payload         JSONB NOT NULL         -- event-specific data
  createdAt       TIMESTAMPTZ
```
