# Progress Tracking — Implementation Tasks

Feature: Progress Tracking
Spec: `development/features/progress-tracking/spec.md`
Priority: P0 (MVP)

---

## 1. Session Store

- [ ] **Task 1.1: Create sessionStore (Zustand)**
  - State: `sessions: PracticeSession[]`, `feelStateReports: FeelStateReport[]`
  - Actions: `addSession`, `updateSessionFeelState`, `addFeelStateReport`
  - Selectors: `getSessionsForPolyrhythm`, `getSessionsThisWeek`, `getCurrentFeelState`, `getCurrentStreak`, `getWeeklySummary`
  - Persistence: Zustand persist middleware with AsyncStorage
  - Generate unique IDs for sessions (uuid or nanoid)
  - **AC:** Store initializes, persists, and restores correctly. All actions mutate state as expected. Selectors return correct filtered/computed data.

- [ ] **Task 1.2: Define PracticeSession and FeelStateReport types**
  - `PracticeSession`: id, type, polyrhythmId, duration, bpmMin, bpmMax, disappearingBeatStage (optional), feelState (optional), timestamp
  - `FeelStateReport`: polyrhythmId, state, timestamp
  - Export from shared types file
  - **AC:** Types compile and cover all fields from the spec.

- [ ] **Task 1.3: Implement streak calculation**
  - `getCurrentStreak()`: count consecutive days (going backward from today) with at least one session
  - Today counts if it has sessions; if not, streak starts from yesterday
  - Use ISO date comparison (ignore time, compare calendar days)
  - **AC:** Unit tests pass for: no sessions (streak 0), single day (streak 1), consecutive days, gap breaks streak, today-only, yesterday-and-today.

---

## 2. Self-Report Prompt

- [ ] **Task 2.1: Build FeelStatePrompt bottom sheet component**
  - Bottom sheet or modal component
  - Header: "How did [ratio] feel today?"
  - Three vertically stacked option cards:
    - "Still mechanical" (executing) — gray, empty circle, subtitle
    - "I could hear it" (hearing) — amber, half-filled circle, subtitle
    - "I felt it in my body" (feeling) — green, filled circle, subtitle
  - Each card styled with the state color and three-circle indicator
  - **AC:** Component renders correctly with all three options. Props accept polyrhythmId for the header text.

- [ ] **Task 2.2: Wire self-report to sessionStore**
  - On option tap: call `sessionStore.updateSessionFeelState(sessionId, state)` and `sessionStore.addFeelStateReport({ polyrhythmId, state })`
  - Dismiss the prompt after save
  - On dismiss without selection: no state written, prompt closes cleanly
  - **AC:** Tapping an option saves both the session feel state and a feel state report. Dismissing without selection writes nothing.

- [ ] **Task 2.3: Integrate self-report trigger into practice flows**
  - After Core Player stop (only on explicit stop, not pause): show `FeelStatePrompt` with the current polyrhythm and session ID
  - After Feel Lesson completion: show `FeelStatePrompt` (lesson completion flow already includes this — ensure no double prompt)
  - After Disappearing Beat completion: show `FeelStatePrompt` with the session's polyrhythm
  - Ensure the prompt fires at most once per session
  - **AC:** Prompt appears after session end for all three practice types. Does not appear on pause or during active practice.

---

## 3. Feel Status Dashboard

- [ ] **Task 3.1: Build FeelStatusDashboard component**
  - Grid or list of polyrhythm cards
  - Each card shows: ratio name, current feel state badge (colored), last practiced date, total session count
  - Ordered by most recently practiced
  - Data: derived from `sessionStore` — unique polyrhythm IDs from sessions, current feel state from `getCurrentFeelState(id)`, session count, last session date
  - **AC:** Dashboard shows all practiced polyrhythms with correct states and metadata. Ordering matches most-recently-practiced.

- [ ] **Task 3.2: Build three-state indicator component**
  - Reusable component showing three circles in a row
  - Props: `currentState: 'executing' | 'hearing' | 'feeling' | null`
  - Visual:
    - Executing: first circle filled (gray), others outlined
    - Hearing: first two circles filled (gray, amber), third outlined
    - Feeling: all three circles filled (gray, amber, green)
    - Null: all circles outlined
  - **AC:** Component renders correctly for all four states. Colors match spec.

- [ ] **Task 3.3: Build polyrhythm card component**
  - Card component used within the dashboard
  - Shows: ratio text (large), three-state indicator, "Last: 2 days ago", "12 sessions"
  - Tappable: navigates to filtered session history
  - Styled with subtle background color matching the current feel state
  - **AC:** Card renders all data correctly. Tapping navigates to session history filtered to that polyrhythm.

- [ ] **Task 3.4: Implement empty state**
  - When `sessionStore.sessions` is empty: show a friendly empty state
  - Text: "Start a practice session to see your progress here"
  - Button: "Go to Practice" — navigates to Practice tab
  - **AC:** Empty state renders when there are no sessions. Button navigates correctly.

---

## 4. Session History

- [ ] **Task 4.1: Build SessionHistoryScreen component**
  - Route: accessible from Progress tab or by tapping a dashboard card
  - Accepts optional `polyrhythmId` filter param
  - Chronological list grouped by day (section headers: "Today", "Yesterday", "March 11")
  - Each entry: polyrhythm badge, session type icon, duration, BPM range, disappearing beat stage (if applicable), feel state dot, timestamp
  - If filtered: "Show All" button at top to clear filter
  - **AC:** Sessions render in correct chronological order grouped by day. Filtering by polyrhythm works. "Show All" clears the filter.

- [ ] **Task 4.2: Build session entry row component**
  - Reusable row component for a single session
  - Props: `session: PracticeSession`
  - Renders:
    - Polyrhythm ratio pill (e.g., "3:2" with layer A color)
    - Session type icon (player, book, fade icons for core-player, lesson, disappearing-beat)
    - "8 min" duration
    - "60–80 BPM" range
    - "Stage 3" disappearing beat indicator (conditional)
    - Small colored dot for feel state (conditional, absent if no report)
    - "2:30 PM" timestamp
  - **AC:** Row renders all fields correctly. Optional fields are hidden when not present.

- [ ] **Task 4.3: Implement empty state for session history**
  - When no sessions (or no sessions for the filtered polyrhythm): show empty state
  - Text: "No sessions yet. Start practicing to build your history!"
  - Button: "Go to Practice"
  - **AC:** Empty state appears when appropriate. Button navigates correctly.

---

## 5. Weekly Overview

- [ ] **Task 5.1: Build WeeklyOverviewCard component**
  - Displayed at the top of the Progress tab, above the Feel Status Dashboard
  - Content:
    - "This Week (Mar 9 – Mar 15)" header
    - Total practice minutes
    - Number of sessions
    - Polyrhythms visited (listed as ratio pills)
    - Current streak with flame icon
  - Uses `sessionStore.getWeeklySummary()` for data
  - **AC:** Card renders with correct metrics for the current week. Week boundaries are Monday–Sunday.

- [ ] **Task 5.2: Implement getWeeklySummary selector**
  - Returns: `{ totalMinutes, sessionCount, polyrhythmsVisited: string[], streak, feelStateChanges: FeelStateChange[] }`
  - `totalMinutes`: sum of durations for sessions this week, converted to minutes
  - `sessionCount`: count of sessions this week
  - `polyrhythmsVisited`: unique polyrhythm IDs from this week's sessions
  - `streak`: from `getCurrentStreak()`
  - `feelStateChanges`: compare earliest and latest feel state report for each polyrhythm this week; report changes
  - Week = Monday 00:00 to Sunday 23:59 (ISO week)
  - **AC:** Unit tests pass for: typical week data, empty week, feel state progression, feel state regression, multiple polyrhythms.

- [ ] **Task 5.3: Build feel state change callout**
  - If `feelStateChanges` is non-empty, render callouts below the metrics:
    - Progression: "3:2 moved from Executing to Hearing this week" (with upward arrow, encouraging color)
    - Regression: "3:2 moved from Hearing to Executing — that's normal, keep going" (neutral tone, no negative color)
  - Multiple changes listed as separate lines
  - **AC:** Callouts render for both progression and regression. Tone is encouraging in both cases.

- [ ] **Task 5.4: Add AI narrative summary placeholder (P2 stub)**
  - Below the weekly metrics: a slot for the AI Progress Narrator
  - MVP: hidden entirely or shows a subtle "Weekly insights coming soon" text
  - P2: Claude generates a coaching paragraph based on the week's data
  - **AC:** Placeholder exists without disrupting the MVP layout. No AI call is made.

---

## 6. Progress Tab Screen

- [ ] **Task 6.1: Assemble ProgressScreen**
  - Route: Progress tab root screen
  - Layout (top to bottom):
    1. Weekly Overview Card (task 5.1)
    2. Feel Status Dashboard (task 3.1)
    3. "View All Sessions" link/button at the bottom (navigates to full SessionHistoryScreen)
  - ScrollView wrapping all content
  - **AC:** Progress tab renders with all three sections. Scrolling works. "View All Sessions" navigates correctly.

---

## Dependency Notes

- Task 2.3 requires integration points in the Core Player, Feel Lessons, and Disappearing Beat features. Each must call `sessionStore.addSession()` on session end and trigger the `FeelStatePrompt`.
- Task 1.1 is a foundational dependency — most other tasks in this feature depend on `sessionStore` being available.
- Task 3.2 (three-state indicator) is reusable — also used in the Learn tab's polyrhythm library and in the self-report prompt.
- Weekly overview (task 5.x) depends on accurate session timestamps — ensure all practice flows record sessions with ISO timestamps at session end.
