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

## Self-Report Prompt

Appears after each practice session ends. This is the core feedback mechanism for the feel progression system.

### Trigger
- When the user exits a practice session (Core Player stop, lesson completion, Disappearing Beat completion)
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
- Feel state is **not cumulative or locked** — it is purely self-reported per session
- A user can report "feeling" one day and "executing" the next (regression is normal and expected)
- The dashboard shows the **most recent** self-report as the current state
- History of all reports is preserved in `sessionStore.feelStateReports` for trend analysis

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
- Monday through Sunday (ISO week)
- Displayed as "This Week (Mar 9 – Mar 15)"

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

## Edge Cases

- **First session ever:** Weekly overview shows "Your first week! Keep going." instead of zero-value metrics.
- **No feel state reported:** session appears in history without a feel dot. Dashboard shows the polyrhythm card but with no state badge until a report is submitted.
- **Multiple sessions same polyrhythm same day:** each session appears individually in history. Feel state dashboard shows the most recent report for that day.
- **Streak calculation:** a streak breaks if an entire calendar day passes with zero sessions. The streak counts today if at least one session exists today.
- **Week boundary:** summary resets every Monday. Previous week's summary is not preserved at MVP (post-MVP: historical weekly summaries).
- **Clock manipulation:** use device time for all timestamps. No server-side validation at MVP.
