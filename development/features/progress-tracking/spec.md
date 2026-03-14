# Progress Tracking — Feature Spec

Shows practice history, feel state progression, and weekly summaries. This feature provides the reflective loop that makes GrooveCore's learning model work — self-reporting feel state after each session is as important as the practice itself. The Progress tab is the user's dashboard for understanding their rhythmic growth over time.

---

## Feel Status Dashboard

The primary view on the Progress tab. Displays the user's relationship with each polyrhythm they've practiced.

### Layout
- Grid or list of polyrhythm cards, one per polyrhythm the user has interacted with
- Ordered by most recently practiced
- Each card shows:
  - **Ratio name** (e.g., "3:2")
  - **Current feel state** as a colored badge:
    - **Executing** — gray/neutral badge, empty circle indicator
    - **Hearing** — amber badge, half-filled circle indicator
    - **Feeling** — green badge, fully filled circle indicator
  - **Last practiced** date (relative: "today", "2 days ago", etc.)
  - **Total sessions** count (small, secondary text)

### Three-State Indicator
A visual indicator showing progression through the three feel states:
- Three circles in a row (or stacked vertically within the card)
- **Empty circle** = Executing (has practiced but feel is mechanical)
- **Half-filled circle** = Hearing (can hear the rhythm internally)
- **Filled circle** = Feeling (rhythm is embodied, felt in the body)
- Current state is highlighted; previous states are filled; future states are outlined
- The indicator uses traffic-light-like coloring: gray -> amber -> green

### Interaction
- Tapping a polyrhythm card navigates to its **Session History** view (filtered to that polyrhythm)
- If no polyrhythms have been practiced yet: display an empty state with a prompt: "Start a practice session to see your progress here" and a button linking to the Practice tab

---

## Feel-State Self-Report

The feel-state prompt appears ONLY for sessions meeting ALL criteria:
- Duration >= 30 seconds
- Mode is 'free-play', 'lesson', or 'disappearing-beat' (not 'duet-tap')
- User has not already reported for this session

This prevents gaming the feel-state system with trivially short sessions.

## Self-Report Prompt

Appears after each qualifying practice session ends. This is the core feedback mechanism for the feel progression system.

### Trigger
- When the user exits a practice session (Core Player stop, lesson completion, Disappearing Beat completion)
- Only if session meets the feel-state criteria above
- Displayed as a **bottom sheet** or **modal** that slides up over the current screen

### Content
- Header: "How did [ratio] feel today?" (e.g., "How did 3:2 feel today?")
- Three tappable option buttons, vertically stacked:
  1. **"Still mechanical"** -> maps to `executing`
     - Subtitle: "I'm following the pattern but it doesn't feel natural yet"
  2. **"I could hear it"** -> maps to `hearing`
     - Subtitle: "I can hear the rhythm in my head even without the audio"
  3. **"I felt it in my body"** -> maps to `feeling`
     - Subtitle: "The rhythm lives in me — I don't have to think about it"
- Each option styled as a card with the state color (gray, amber, green) and the three-circle indicator showing the corresponding state

### Behavior
- One tap selects, saves, and dismisses the prompt
- The selected feel state is saved to the session record in `sessionStore`
- The polyrhythm's current feel state in the dashboard updates to the most recently reported state
- **Dismissible:** user can swipe down or tap outside to skip. No state change is recorded for skipped prompts.
- The prompt appears at most once per session (not on every pause/resume, only on session end)

### Feel State Progression
- Feel state is **not cumulative or locked** -- it is purely self-reported per session
- A user can report "feeling" one day and "executing" the next (regression is normal and expected)
- The dashboard shows the **most recent** self-report as the current state
- History of all reports is preserved in `sessionStore.feelStateReports` for trend analysis

## Feel-State Trend

In addition to the current feel-state badge, show a chronological timeline:
- Small colored dots (one per session that has a feel-state report)
- Colors: executing (layerA blue), hearing (warning amber), feeling (success green)
- Scrollable horizontally if many sessions
- Shows that progress is non-linear (regression is normal and visible)

If current state is lower than a previous peak, show encouraging message:
"You've felt it before -- it'll come back with practice."

---

## Session History

Chronological list of all practice sessions, accessible from the Progress tab or by tapping a polyrhythm card.

### Layout
- Chronological list, **grouped by day** (headers: "Today", "Yesterday", "March 11", etc.)
- Each session entry shows:
  - **Polyrhythm** ratio badge (e.g., "3:2" pill)
  - **Session type** icon: Core Player, Lesson, Disappearing Beat
  - **Duration** (e.g., "8 min")
  - **BPM range** covered (e.g., "60–80 BPM")
  - **Disappearing Beat stage** reached (if applicable, e.g., "Stage 3")
  - **Feel state** reported (if any): small colored dot matching the state
  - **Timestamp** (e.g., "2:30 PM")
- If filtered to a specific polyrhythm (from dashboard card tap): show only that polyrhythm's sessions with a "Show All" option

### Data Source
- `sessionStore.sessionHistory` — sorted by startedAt descending
- Pull to refresh: MVP pulls from local store only; post-MVP syncs from Supabase

### Empty State
- "No sessions yet. Start practicing to build your history!"
- Button: "Go to Practice"

---

## Weekly Overview

Summary card displayed at the top of the Progress tab, above the Feel Status Dashboard.

### Content

| Metric | Description | Source |
|---|---|---|
| **Total practice minutes** | Sum of all session durations this week (Mon–Sun) | `sessionStore.sessionHistory` |
| **Number of sessions** | Count of sessions this week | `sessionStore.sessionHistory` |
| **Polyrhythms visited** | Unique polyrhythm ratios practiced this week | `sessionStore.sessionHistory` |
| **Current streak** | Consecutive days with at least one session (including today) | `sessionStore.sessionHistory` |
| **Feel state changes** | Any polyrhythm that changed feel state this week | Derived from `sessionStore.sessionHistory` (compare earliest and latest `feelStateAfter` per polyrhythm this week) |

### Layout
- Compact card with key metrics displayed as labeled values:
  - "42 min this week" (with a small chart icon)
  - "6 sessions" (with a count icon)
  - "3:2, 4:3" (polyrhythms visited)
  - "5-day streak" (with a flame icon)
- Below the metrics: if any feel state changed this week, display a callout:
  - "3:2 moved from Executing to Hearing this week" (with arrow indicating progression)
  - Multiple changes listed if applicable
  - Regression changes shown neutrally: "3:2 moved from Hearing to Executing — that's normal, keep going"

### "Week" Definition

## Weekly Overview

Weeks are ISO 8601 weeks (Monday through Sunday), NOT rolling 7-day windows.

```typescript
// Use date-fns or manual calculation for ISO week boundaries
const weekStart = startOfISOWeek(new Date());
const weekEnd = endOfISOWeek(new Date());
```

All "this week" selectors use ISO week boundaries for consistency.

Displayed as "This Week (Mar 9 -- Mar 15)"

### Extension Point (P2)
- Slot for **AI-generated narrative summary** (AI Progress Narrator)
- When implemented: below the metrics, a paragraph of coaching narrative generated by Claude based on the week's session data
- MVP: slot is hidden or shows a "Weekly insights coming soon" placeholder

---

## State

### Consumed
- `sessionStore` — all session records, feel state reports
- `lessonStore` — lesson completion data, badges (for showing lesson progress alongside practice)

### Written
- `sessionStore.endSession(feelStateAfter)` — saves the self-reported feel state to the `Session.feelStateAfter` field (canonical type from `contracts/data-models.md`)

---

## Session Record Schema

**Uses the canonical `Session` type from `contracts/data-models.md`.** Key fields for display:
- `mode`: `'free-play' | 'lesson' | 'disappearing-beat' | 'duet-tap'` — determines session type icon
- `bpmStart` / `bpmEnd` — displayed as BPM range
- `disappearingBeatStageReached` — shown only when > 0
- `feelStateAfter` — colored dot in session list
- `duration` — seconds, formatted as "X min"
- `startedAt` — timestamp for grouping and display

---

## Store Integration

**Uses `sessionStore` from `foundations/data-layer/spec.md`.** Key actions and selectors:
- `endSession(feelStateAfter)` — saves feel state to session
- `getSessionHistory()` — returns sessions sorted by startedAt descending
- `getSessionsForPolyrhythm(polyrhythmId)` — filtered view
- `selectSessionCountThisWeek` — for weekly overview
- `selectTotalPracticeSeconds` — for weekly overview

The feel state dashboard shows the **most recent** `feelStateAfter` value per polyrhythm as the current state.

---

## Returning User (Gap > 14 days)

If no sessions exist in the last 14 days:
- Show "Welcome back!" banner on the Progress tab
- Display last session date: "Last practice: X days ago"
- Suggest a re-entry action: "Start with a quick 3:2 warm-up?"
- Do NOT show stale feel-state prominently -- show it dimmed with "Last reported X days ago"

---

## Empty States

### No Sessions Yet
- Illustration: simple musical note icon
- "Start your first practice to see your progress here"
- CTA button: "Go to Practice" -> navigates to Practice tab

### No Feel-State Reports
- "Practice for 30+ seconds and we'll ask how it felt"

### No Streaks Yet
- "Practice on 2 consecutive days to start a streak"

---

## Streak Calculation

Streaks use the device's local timezone at the time of each session recording.
Each session's `startedAt` is converted to a local calendar date for comparison.

Known edge case: timezone changes during travel may cause a missed day or double day.
This is accepted for MVP -- streaks are motivational, not contractual.

---

## Session Ownership

Each feature owns its own session creation:
- Core player: creates 'free-play' sessions
- Feel lessons: creates 'lesson' sessions (one per full lesson run)
- Disappearing beat: creates 'disappearing-beat' sessions

Step 7 of a lesson (inline disappearing beat) does NOT create a separate session.
It contributes data to the parent lesson session instead. The lesson owns the session lifecycle.

The feel-state prompt is triggered by the feature that owns the session, NOT by progress tracking.
Progress tracking only DISPLAYS data -- it never creates sessions or prompts.

---

## Edge Cases

- **First session ever:** Weekly overview shows "Your first week! Keep going." instead of zero-value metrics.
- **No feel state reported:** session appears in history without a feel dot. Dashboard shows the polyrhythm card but with no state badge until a report is submitted.
- **Multiple sessions same polyrhythm same day:** each session appears individually in history. Feel state dashboard shows the most recent report for that day.
- **Streak calculation:** a streak breaks if an entire calendar day passes with zero sessions. The streak counts today if at least one session exists today. Uses device local timezone (see Streak Calculation section).
- **Week boundary:** summary resets every Monday. Previous week's summary is not preserved at MVP (post-MVP: historical weekly summaries).
- **Clock manipulation:** use device time for all timestamps. No server-side validation at MVP.
