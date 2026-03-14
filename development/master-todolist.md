# GrooveCore — Master Todolist

**Last Updated:** 2026-03-13
**PRD Version:** 0.1
**Status:** Pre-MVP

> **Epic numbering updated 2026-03-13** per unified numbering scheme.
> Old "Epic 1: Project Scaffolding" has been absorbed into Epic 0 (Developer Infrastructure).
> All subsequent epics renumbered accordingly. See the numbering table below.

---

## How to Use This File

This is the single source of truth for build order. Before starting any work:

1. Find your epic below
2. Confirm all dependency epics are marked complete
3. Read **only** the files listed in the "Read" column
4. Open the epic's `tasks.md` for granular task breakdown
5. Update checkboxes here when an epic is fully complete

---

## Epic Numbering (Canonical)

| Epic | Name | Old Number |
|------|------|------------|
| 0 | Developer Infrastructure | Was Epic 0 in plans |
| 1 | Audio Engine | Was Epic 2 |
| 2 | Data Layer | Was Epic 3 |
| 3 | Navigation Shell | Was Epic 4 |
| 4 | Onboarding | Was Epic 5 |
| 5 | Core Player | Was Epic 6 |
| 6 | Feel Lessons | Was Epic 7 |
| 7 | Disappearing Beat | Was Epic 8 |
| 8 | Baby Mode | Was Epic 9 |
| 9 | Progress Tracking | Was Epic 10 |
| 10 | Integration | Was Epic 11 |
| 11 | Testing & QA | Was Epic 12 |

> Project scaffolding is part of Epic 0 (Developer Infrastructure).

---

## Epic Build Order

### Phase 0: Foundations

| Status | Epic | Name | Dependencies | Read Before Starting |
|--------|------|------|--------------|----------------------|
| [ ] | **Epic 0** | Developer Infrastructure | None | `contracts/coding-conventions.md`, [Epic 0 Plan](../docs/superpowers/plans/2026-03-13-epic-0-developer-infrastructure.md) |
| [ ] | **Epic 1** | Audio Engine | Epic 0 | `foundations/audio-engine/spec.md`, `contracts/data-models.md` |
| [ ] | **Epic 2** | Data Layer | Epic 0 | `foundations/data-layer/spec.md`, `contracts/data-models.md`, `contracts/api-contracts.md` |
| [ ] | **Epic 3** | Navigation Shell | Epic 0 | `foundations/navigation-shell/spec.md`, `contracts/design-tokens.md` |

### Phase 1: MVP Features

| Status | Epic | Name | Dependencies | Read Before Starting |
|--------|------|------|--------------|----------------------|
| [ ] | **Epic 4** | Onboarding Flow | Epic 2, Epic 3 | `features/onboarding/spec.md`, `contracts/data-models.md`, `contracts/design-tokens.md` |
| [ ] | **Epic 5** | Core Player | Epic 1, Epic 3 | `features/core-player/spec.md`, `foundations/audio-engine/spec.md`, `contracts/design-tokens.md` |
| [ ] | **Epic 6** | Feel Lessons (3:2) | Epic 1, Epic 5 | `features/feel-lessons/spec.md`, `foundations/audio-engine/spec.md`, `contracts/data-models.md` |
| [ ] | **Epic 7** | Disappearing Beat Mode | Epic 1, Epic 5 | `features/disappearing-beat/spec.md`, `foundations/audio-engine/spec.md` |
| [ ] | **Epic 8** | Baby Mode | Epic 1, Epic 2, Epic 3 | `features/baby-mode/spec.md`, `foundations/audio-engine/spec.md`, `contracts/design-tokens.md`, `contracts/data-models.md` |
| [ ] | **Epic 9** | Progress Tracking | Epic 2, Epic 3 | `features/progress-tracking/spec.md`, `contracts/data-models.md` |

### Phase 2: Integration & Polish

| Status | Epic | Name | Dependencies | Read Before Starting |
|--------|------|------|--------------|----------------------|
| [ ] | **Epic 10** | End-to-End Integration | Epics 4-9 | All feature specs, `contracts/api-contracts.md`, `contracts/data-models.md` |
| [ ] | **Epic 11** | Testing & QA | Epic 10 | All specs (full regression scope) |

---

## Cross-Cutting: Content Creation

These content tasks must be completed before their dependent epics:
- Audio assets (click.wav, clave.wav, woodblock.wav, soft-chime.wav, soft-bell.wav) → blocks Epic 1
- 3:2 lesson content (7 steps with cultural context, mnemonics, instructions) → blocks Epic 6
- Baby activity card content (curated activities per stage) → blocks Epic 8
- Placeholder lesson structures for 4:3 and 2:3 → blocks Epic 6

---

## Cross-Cutting: Deployment & CI

Not a separate epic, but must be addressed:
- CI pipeline: lint + typecheck + test (part of Epic 0)
- EAS Build configuration (before first device testing)
- App store setup: bundle IDs, provisioning (before Epic 11)
- Environment configuration: dev vs staging

---

## Epic Details

### Epic 0: Developer Infrastructure

**Goal:** Scaffold the GrooveCore Expo project with all engineering guardrails (TypeScript strict, ESLint, Jest, path aliases, design system, i18n, error handling, test utilities) so every subsequent epic inherits production-grade infrastructure. This epic absorbs all of the former "Epic 1: Project Scaffolding" scope.

**Scope:**
- `npx create-expo-app` with TypeScript template
- Install core dependencies: zustand, expo-router, react-native-reanimated
- Configure path aliases (`@features`, `@libs`, etc.)
- Set up ESLint + Prettier with project conventions
- Create folder skeleton per `coding-conventions.md`
- Configure Jest + React Native Testing Library
- Verify app builds and runs on iOS simulator and Android emulator
- Design system tokens (colors, typography, spacing)
- Essential design system components (Button, IconButton, typography components)
- i18n setup, error handling, test utilities
- CI pipeline (lint + typecheck + test)

**Read:**
- `contracts/coding-conventions.md`
- [Epic 0 Plan](../docs/superpowers/plans/2026-03-13-epic-0-developer-infrastructure.md)

**Outputs:** A runnable Expo app with correct folder structure, all dependencies installed, linting passing, design tokens implemented, essential components built, and one placeholder screen.

---

### Epic 1: Audio Engine

**Goal:** Build the polyrhythm scheduling engine, sound loader, stereo split, per-layer volume control, tempo engine, and transport controls. This is the rhythmic heart of the app.

**Scope:**
- Polyrhythm scheduler (precise timing for arbitrary A:B ratios)
- Sound loader with preloaded sound bank (click, clave, woodblock, djembe, handpan, soft-chime, soft-bell)
- Stereo split mode (layer A to left channel, layer B to right channel)
- Per-layer volume control with fade curves
- BPM engine (range 20-240, tap tempo)
- Transport controls (play, pause, stop, reset)
- Beat callbacks (emit beat events for UI synchronization)
- Zustand audio store slice
- Extension points: mic input hook, accelerometer hook, onset detection hook (all P1 stubs)

**Read:**
- `foundations/audio-engine/spec.md`
- `contracts/data-models.md`

**Outputs:** `audioStore` with full playback control, sound bank loaded, stereo split functional, beat callbacks firing. No UI — just the engine and store.

---

### Epic 2: Data Layer

**Goal:** Establish all Zustand stores, Supabase integration, offline-first persistence, and session recording lifecycle.

**Scope:**
- Zustand stores: `userStore`, `sessionStore`, `lessonStore`, `babyStore`, `settingsStore`
- AsyncStorage persistence layer for offline-first writes
- Supabase client configuration and table creation (users, sessions, baby_profiles, baby_sessions, lesson_progress)
- Anonymous auth for MVP
- Background sync: queue local writes, flush to Supabase when online
- Conflict resolution: last-write-wins for MVP
- Session recording lifecycle (start, update, end, persist)
- Extension points: AI response cache store (P2), vocal analysis storage (P1)

**Read:**
- `foundations/data-layer/spec.md`
- `contracts/data-models.md`
- `contracts/api-contracts.md`

**Outputs:** All stores functional with typed state, persistence working, Supabase tables created, sync queue operational.

---

### Epic 3: Navigation Shell

**Goal:** Set up Expo Router with 5-tab layout, screen registry, and modal/sheet patterns.

**Scope:**
- Expo Router `app/` directory with `(tabs)` group
- 5 tabs: Learn, Practice, Baby Mode, Progress, Settings
- Tab bar with icons and labels
- Baby mode visual switch (warm color theme when baby tab active)
- Modal/sheet patterns for overlays (lesson steps, settings panels)
- Screen-awake behavior for practice screens
- Deep linking structure (placeholder routes)
- Skeleton screens for each tab (placeholder content)
- Settings tab: basic Settings screen with:
  - Sound preferences (default sound selection)
  - Default BPM
  - Stereo split default
  - Play in background toggle
  - Baby profile management (link to baby profile edit)
  - About/version info

**Read:**
- `foundations/navigation-shell/spec.md`
- `contracts/design-tokens.md`

**Outputs:** Navigable 5-tab app shell with placeholder screens, correct routing, modal support, and basic Settings screen.

---

### Epic 4: Onboarding Flow

**Goal:** Build the 4-screen first-launch onboarding that collects user profile data and configures the app experience.

**Scope:**
- Screen 1: "What do you want to feel?" — polyrhythm interest selector
- Screen 2: Background — musician / parent / both role selector
- Screen 3: Genre preferences (multi-select grid)
- Screen 4: Baby age input (conditional, shown only if parent/both selected)
- Write profile to `userStore` on completion
- Determine tab visibility (hide Baby Mode tab if role is 'musician')
- Skip onboarding on subsequent launches
- Animated transitions between screens

**Read:**
- `features/onboarding/spec.md`
- `contracts/data-models.md`
- `contracts/design-tokens.md`

**Outputs:** Complete onboarding flow that writes a valid `UserProfile` and configures navigation.

---

### Epic 5: Core Player

**Goal:** Build the main polyrhythm player screen with all controls and the radial visualizer.

**Scope:**
- Ratio selector (3:2, 4:3 for MVP, extensible to 9:8)
- BPM slider (40-160 for MVP) with numeric display
- Tap tempo button
- Sound selector per layer (click, clave, woodblock)
- Stereo split toggle (with headphone detection hint)
- Per-layer volume sliders
- Radial/circular beat visualizer (animated dots on circle, pulse on beat)
- Play/pause/stop transport controls
- Screen stays awake during playback
- Connects to `audioStore` for all audio interaction

**Read:**
- `features/core-player/spec.md`
- `foundations/audio-engine/spec.md`
- `contracts/design-tokens.md`

**Outputs:** Fully functional polyrhythm player screen with visualizer, stereo split, and all controls wired to the audio engine.

---

### Epic 6: Feel Lessons (3:2)

**Goal:** Build the step-based lesson engine and the complete 3:2 feel internalization lesson.

**Scope:**
- Lesson engine: step-based progression through 7 lesson steps
- JSON-driven content model (lesson content defined as data, not hardcoded UI)
- Step 1: Context — "Hear it in music" (text + external link for MVP)
- Step 2: Shape — visual explanation of the 3:2 feel
- Step 3: Mnemonic — display "not diff-i-cult" (static for MVP, extensible for AI generation)
- Step 4: Sing exercise — on-screen prompt (no mic for MVP, extensible for P1 AI vocal coach)
- Step 5: Body exercise — "Walk in 2, clap in 3" prompt with animated cue
- Step 6: Both hands — tap interface using core player in guided mode
- Step 7: Disappearing Beat challenge — launches disappearing beat mode for this ratio
- Feel badge on lesson completion
- Progress written to `lessonStore`
- Content for 3:2 lesson (Afro-Cuban clave origin)
- Placeholder content structure for 4:3 and 2:3 (extensible)

**Read:**
- `features/feel-lessons/spec.md`
- `foundations/audio-engine/spec.md`
- `contracts/data-models.md`

**Outputs:** Complete 3:2 lesson playable end-to-end, feel badge awarded, lesson engine reusable for additional ratios.

---

### Epic 7: Disappearing Beat Mode

**Goal:** Build the staged muting engine that trains internal pulse.

**Scope:**
- 3-stage muting flow:
  - Stage 1: Target layer fades to 50% volume
  - Stage 2: Target layer mutes completely
  - Stage 3: Both layers mute — user holds internal pulse
- Configurable: which layer disappears, bars per stage, number of cycles
- Fade logic: smooth volume curves (not abrupt cuts)
- Return moment: both layers return on beat 1
- Drift feedback: visual indicator showing how close user's tap was to beat 1 on return
- Standalone mode (from Practice tab) and guided mode (from lesson step 7)
- Connects to `audioStore` fade API

**Read:**
- `features/disappearing-beat/spec.md`
- `foundations/audio-engine/spec.md`

**Outputs:** Disappearing Beat mode playable in both standalone and lesson contexts, with drift feedback.

---

### Epic 8: Baby Mode

**Goal:** Build the parent-child rhythm experience with age-stage system, activity cards, duet tap, visualizer, and session logging.

**Scope:**
- Baby profile setup (name, birth date, auto-stage detection)
- Stage system (Stage 1-3 for MVP: bounce mode, pat-a-cake, tap mode)
- Manual stage override
- Activity cards: swipeable, large font, illustrated instructions
  - Stage 1 (3-6 months): parent bounce activities
  - Stage 2 (6-12 months): pat-a-cake call-response
  - Stage 3 (12-18 months): oversized tap targets
- Duet Tap screen: two large zones, distinct sounds per zone, visual celebration on near-simultaneous taps
- Baby Visualizer: full-screen pulsing shapes, high-contrast warm colors, gentle animation synced to rhythm
- Session log: manual entry (duration, baby response: calm/excited/disengaged)
- Warm UI theme (baby mode design token overrides)
- Extension points: Stage 4-5 (P3), AI activity generator (P2)

**Read:**
- `features/baby-mode/spec.md`
- `foundations/audio-engine/spec.md`
- `contracts/design-tokens.md`
- `contracts/data-models.md`

**Outputs:** Complete baby mode tab with stage-appropriate activities, duet tap, visualizer, and session logging.

### Scope Note: Baby Mode (Epic 8)

Baby Mode represents ~30-40% of MVP engineering effort for a secondary audience.
Consider: could ship MVP without Baby Mode (Epics 0-7, 9-11) and add Baby Mode
as a fast-follow release. This would significantly reduce MVP timeline risk.
Decision: [TO BE DECIDED -- product strategy question]

---

### Epic 9: Progress Tracking

**Goal:** Build the feel status dashboard, self-report prompt, session history, and weekly overview.

**Scope:**
- Feel Status dashboard: card per polyrhythm showing current state (Executing / Hearing / Feeling)
- Self-report prompt after each session: "How did [ratio] feel today?" with 3 tap options
- Session history list: date, ratio, duration, BPM range, disappearing beat stage reached
- Weekly overview: total practice minutes, sessions count, polyrhythms visited, feel state changes
- Data reads from `sessionStore` and `lessonStore`
- Extension points: AI Progress Narrator (P2), practice streaks (P3)

**Read:**
- `features/progress-tracking/spec.md`
- `contracts/data-models.md`

**Outputs:** Progress tab with feel dashboard, session history, and weekly summary.

---

### Epic 10: End-to-End Integration

**Goal:** Wire all features together, verify cross-feature flows, fix integration gaps.

**Scope:**
- Onboarding -> tab configuration -> first lesson flow
- Lesson step 7 -> disappearing beat mode -> feel badge -> progress update
- Core player session -> session log -> progress dashboard
- Baby mode session -> baby session log -> weekly summary
- Supabase sync verification (write locally, sync when online, verify data integrity)
- Navigation edge cases (deep links, back button behavior, modal dismissal)
- Performance audit (animation frame rate, audio latency, memory usage)
- Error boundary verification at tab level

**Read:**
- All feature specs
- `contracts/api-contracts.md`
- `contracts/data-models.md`

**Outputs:** All features working together in a coherent app flow with no broken paths.

---

### Epic 11: Testing & QA

**Goal:** Full test coverage, manual QA, and release preparation.

**Scope:**
- Unit tests for all store slices (Zustand)
- Unit tests for audio scheduler logic
- Component tests for all screens (React Native Testing Library)
- Integration tests for critical flows (onboarding, lesson completion, session recording)
- Manual QA on iOS and Android (real devices)
- Audio latency testing on multiple Android devices
- Accessibility audit (screen reader, tap targets, contrast)
- Baby mode safety review (no unsafe content, appropriate tap targets)
- Performance profiling (startup time, animation smoothness, memory)
- Bug fixes from QA

**Read:**
- All specs (full regression scope)

**Outputs:** Test suite passing, QA sign-off, release candidate ready.

---

## Parallelization Map

The following diagram shows which epics can run simultaneously. Epics on the same vertical level can be dispatched to separate agents at the same time.

```
Timeline    Work
--------    ----

  T0        [ Epic 0: Developer Infrastructure ]
             |
  T1        [ Epic 1: Audio ]    [ Epic 2: Data ]    [ Epic 3: Nav ]
             |                    |         |          |
             |                    |         |          |
  T2        [ Epic 5: Player ]   [ Epic 4: Onboard ]  [ Epic 8: Baby ]   [ Epic 9: Progress ]
             |         |                               (needs 1+2+3)
  T3        [ Epic 6 ] [ Epic 7 ]
             |          |
             v          v
  T4        [       Epic 10: Integration        ]
             |
  T5        [       Epic 11: Testing & QA       ]
```

### Parallel Execution Windows

```
Window 1 (T0):  Epic 0 alone — everything depends on it
                +-----------+
                |  Epic 0   |
                +-----------+

Window 2 (T1):  Epics 1, 2, 3 — all depend only on Epic 0, fully parallel
                +-----------+  +-----------+  +-----------+
                |  Epic 1   |  |  Epic 2   |  |  Epic 3   |
                +-----------+  +-----------+  +-----------+

Window 3 (T2):  Epics 4, 5, 8, 9 — once their deps complete
                +-----------+  +-----------+  +-----------+  +-----------+
                |  Epic 4   |  |  Epic 5   |  |  Epic 8   |  |  Epic 9   |
                +-----------+  +-----------+  +-----------+  +-----------+
                (needs 2+3)    (needs 1+3)    (needs 1+2+3)  (needs 2+3)

Window 4 (T3):  Epics 6, 7 — both need Epic 5 complete
                +-----------+  +-----------+
                |  Epic 6   |  |  Epic 7   |
                +-----------+  +-----------+
                (needs 1+5)    (needs 1+5)

Window 5 (T4):  Epic 10 — all features must be done
                +-------------------------------+
                |        Epic 10                |
                +-------------------------------+

Window 6 (T5):  Epic 11 — integration must be done
                +-------------------------------+
                |        Epic 11                |
                +-------------------------------+
```

### Maximum Parallelism Summary

| Window | Epics | Max Parallel Agents |
|--------|-------|---------------------|
| T0 | 0 | 1 |
| T1 | 1, 2, 3 | 3 |
| T2 | 4, 5, 8, 9 | 4 |
| T3 | 6, 7 | 2 |
| T4 | 10 | 1 |
| T5 | 11 | 1 |

**Theoretical minimum wall-clock time:** 6 serial windows, regardless of agent count.
**Maximum useful agents at peak:** 4 (during Window T2).

### Timeline Reality Check

Original estimate: 8 weeks (PRD Phase 1).
With 12 epics (now 0-11), 6 serial dependency windows, content creation overhead,
and the audio latency spike prerequisite, realistic estimate is 10-14 weeks
for a single developer with AI agent assistance.

Critical path: Epic 0 → Epic 1 (audio spike must pass) → Epics 2+3 (parallel) → Features

---

## Progress Tracking

When marking an epic complete, update the checkbox above and add a completion note here:

| Epic | Completed Date | Agent/Session | Notes |
|------|---------------|---------------|-------|
| 0 | -- | -- | -- |
| 1 | -- | -- | -- |
| 2 | -- | -- | -- |
| 3 | -- | -- | -- |
| 4 | -- | -- | -- |
| 5 | -- | -- | -- |
| 6 | -- | -- | -- |
| 7 | -- | -- | -- |
| 8 | -- | -- | -- |
| 9 | -- | -- | -- |
| 10 | -- | -- | -- |
| 11 | -- | -- | -- |
