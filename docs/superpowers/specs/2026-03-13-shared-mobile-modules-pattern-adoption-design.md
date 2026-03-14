# Design: Shared-Mobile-Modules Pattern Adoption for GrooveCore

**Date:** 2026-03-13
**Status:** Approved
**Scope:** Architecture restructure + spec hardening before development begins

## Context

GrooveCore has a well-documented spec-driven development system (PRD, 3 foundation specs, 6 feature specs, 4 contracts, 12 stubs, master todolist). However, the engineering patterns lack the rigor of a production React Native codebase. This design adopts proven patterns from a mature RN monorepo architecture and adapts them for a standalone Expo app.

**Guiding principle:** Fork the DNA, not the code. No internal tools or component libraries are borrowed — only architectural patterns, conventions, and engineering guardrails.

**Architecture trade-off note:** This 7-layer architecture provides strong module boundaries for AI agent parallelism, at the cost of overhead for a solo developer. The ESLint import restrictions can be relaxed during rapid prototyping and tightened before release.

**Why not use the source repo's design system (Zest)?** Zest is tightly coupled to the HelloFresh product ecosystem — its components, tokens, and theming assume a food-delivery context. GrooveCore has a fundamentally different visual identity (dark audio-centric UI, baby-warm palette, beat-synced animations). Building a focused, minimal design system from the existing `design-tokens.md` contract gives full control over accessibility, theming, and audio-specific components (tap targets, radial visualizer wrappers) without carrying unnecessary dependencies.

---

## 1. Project Structure

Replace the current flat Expo structure with a layered architecture. `app/` screens become thin compositors; all logic lives in `src/`.

```
master-the-groove/
├── app/                          # Expo Router (THIN — compose from @features, never implement)
│   ├── (tabs)/
│   │   ├── learn/
│   │   │   ├── index.tsx         # Learn tab home (imports LearnScreen from @features)
│   │   │   └── [lessonId].tsx    # Lesson detail
│   │   ├── practice/
│   │   │   ├── index.tsx         # Core player
│   │   │   └── disappearing.tsx  # Disappearing beat
│   │   ├── baby/
│   │   │   ├── index.tsx         # Baby mode home
│   │   │   ├── duet-tap.tsx
│   │   │   └── visualizer.tsx
│   │   ├── progress/
│   │   │   └── index.tsx
│   │   └── settings/
│   │       └── index.tsx
│   ├── onboarding/
│   │   ├── index.tsx
│   │   └── [step].tsx
│   └── _layout.tsx               # Root layout with provider hierarchy
│
├── src/
│   ├── assets/                   # Static resources
│   │   ├── sounds/               # .wav files (click, clave, woodblock, etc.)
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── data-access/              # ALL data interactions (Zustand, Supabase, hooks)
│   │   ├── stores/               # Zustand stores
│   │   │   ├── user-store.ts
│   │   │   ├── session-store.ts
│   │   │   ├── lesson-store.ts
│   │   │   ├── baby-store.ts
│   │   │   ├── settings-store.ts
│   │   │   ├── audio-store.ts
│   │   │   └── index.ts          # Barrel export
│   │   ├── supabase/             # Client, auth, sync queue
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── sync-queue.ts
│   │   │   └── index.ts
│   │   └── hooks/                # Data-fetching hooks
│   │       ├── use-sessions.ts
│   │       ├── use-lesson-progress.ts
│   │       └── index.ts
│   │
│   ├── design-system/            # App's own component library (accessible by default)
│   │   ├── components/
│   │   │   ├── button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── types.ts
│   │   │   │   ├── styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── text/
│   │   │   ├── card/
│   │   │   ├── slider/
│   │   │   ├── icon/
│   │   │   ├── bottom-sheet/      # REMOVED: Use @gorhom/bottom-sheet instead (installed in Epic 3)
│   │   │   ├── dialog/
│   │   │   ├── spinner/
│   │   │   ├── progress-bar/
│   │   │   ├── badge/
│   │   │   └── tap-target/       # Large touch target wrapper (44px min, 80px baby)
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── animations.ts
│   │   │   ├── sounds.ts
│   │   │   └── index.ts
│   │   └── index.ts              # Public API: import { Button, Text } from '@design-system'
│   │
│   ├── features/                 # Self-contained feature modules
│   │   ├── core-player/
│   │   │   ├── components/
│   │   │   │   ├── RadialVisualizer.tsx
│   │   │   │   ├── RatioSelector.tsx
│   │   │   │   ├── BpmControl.tsx
│   │   │   │   ├── SoundSelector.tsx
│   │   │   │   ├── VolumeControl.tsx
│   │   │   │   ├── StereoSplitToggle.tsx
│   │   │   │   └── TransportControls.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-core-player-data.ts
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   └── index.ts
│   │   ├── feel-lessons/
│   │   │   ├── components/
│   │   │   │   ├── LessonScreen.tsx
│   │   │   │   ├── StepRenderer.tsx
│   │   │   │   ├── steps/        # One component per step type
│   │   │   │   │   ├── ContextStep.tsx
│   │   │   │   │   ├── ShapeStep.tsx
│   │   │   │   │   ├── MnemonicStep.tsx
│   │   │   │   │   ├── SingStep.tsx
│   │   │   │   │   ├── BodyStep.tsx
│   │   │   │   │   ├── HandsStep.tsx
│   │   │   │   │   └── DisappearingStep.tsx
│   │   │   │   └── CompletionScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-lesson-engine.ts
│   │   │   ├── data/             # JSON lesson definitions
│   │   │   │   ├── three-two.ts
│   │   │   │   └── four-three.ts
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   └── index.ts
│   │   ├── baby-mode/
│   │   ├── disappearing-beat/
│   │   ├── progress-tracking/
│   │   └── onboarding/
│   │
│   ├── libs/                     # Shared utilities (no JSX in libs)
│   │   ├── audio/                # Audio engine
│   │   │   ├── scheduler.ts      # Pure polyrhythm event generator
│   │   │   ├── sound-pool.ts     # expo-av sound instance management
│   │   │   ├── stereo.ts         # Pan control utilities
│   │   │   ├── tap-tempo.ts      # Tap tempo buffer + BPM calculation
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── accessibility/
│   │   │   ├── focus-management.ts
│   │   │   ├── announcements.ts  # AccessibilityInfo.announceForAccessibility
│   │   │   └── index.ts
│   │   ├── localization/
│   │   │   ├── i18n.ts           # i18next config
│   │   │   ├── en.ts             # English translations
│   │   │   └── index.ts
│   │   ├── analytics/            # Stub for MVP — minimal screen view tracking only
│   │   │   ├── tracker.ts        # Logs screen transitions + session start/end (console in dev, Supabase in prod)
│   │   │   └── index.ts
│   │   └── error-handling/
│   │       ├── error-boundary.tsx
│   │       ├── typed-errors.ts
│   │       └── index.ts
│   │
│   ├── operations/               # Pure business logic (no JSX, no hooks)
│   │   ├── polyrhythm/
│   │   │   ├── calculate-events.ts   # Scheduler math
│   │   │   ├── ratio-utils.ts        # LCM, validation, ratio metadata
│   │   │   └── index.ts
│   │   ├── drift-detection/
│   │   │   ├── calculate-drift.ts
│   │   │   ├── classify-zone.ts      # locked/close/drifting
│   │   │   └── index.ts
│   │   ├── baby/
│   │   │   ├── calculate-stage.ts    # Birth date -> stage
│   │   │   └── index.ts
│   │   ├── progress/
│   │   │   ├── calculate-streak.ts
│   │   │   ├── weekly-summary.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── entry-providers/          # Provider hierarchy (root layout composes these)
│   │   ├── gesture-provider.tsx
│   │   ├── safe-area-provider.tsx
│   │   ├── theme-provider.tsx
│   │   ├── localization-provider.tsx
│   │   └── index.ts
│   │
│   ├── types/                    # Shared TypeScript types
│   │   ├── user.ts
│   │   ├── session.ts
│   │   ├── polyrhythm.ts
│   │   ├── lesson.ts
│   │   ├── baby.ts
│   │   ├── feel-state.ts
│   │   └── index.ts
│   │
│   └── __tests__/                # Test infrastructure
│       ├── jest-setup.ts
│       ├── jest-utils.tsx        # renderWithProviders, mock factories
│       └── mocks/
│           ├── supabase.ts
│           ├── expo-av.ts
│           └── stores.ts
│
├── development/                  # Existing spec-driven docs (unchanged)
│   ├── contracts/
│   ├── features/
│   ├── foundations/
│   ├── stubs/
│   ├── agent-guides/
│   └── master-todolist.md
│
├── docs/
│   └── superpowers/specs/
│
├── .eslintrc.js                  # Strict rules (see Section 3)
├── tsconfig.json                 # Strict TypeScript (see Section 4)
├── jest.config.ts                # Jest + RNTL (see Section 5)
├── babel.config.js
├── app.json                      # Expo config
└── package.json
```

### Import Aliases

Configure in `tsconfig.json` and `babel.config.js`:

```typescript
// Allowed imports — always use aliases, never relative paths across layers
import { Button, Text } from '@design-system';
import { useAudioStore } from '@data-access/stores';
import { syncQueue } from '@data-access/supabase';
import { CorePlayerScreen } from '@features/core-player';
import { scheduler } from '@libs/audio';
import { calculateDrift } from '@operations/drift-detection';
import type { Session } from '@types';
```

### Import Restrictions (ESLint-enforced)

```
- No deep imports: @features/core-player/components/RadialVisualizer  (BLOCKED)
- Allowed:         @features/core-player                               (OK)
- Exception:       @libs/audio/*                                       (OK — leaf utilities)
- Exception:       @data-access/stores/*                               (OK — individual stores)
- Exception:       @data-access/supabase/*                             (OK)
- No cross-feature imports: @features/baby-mode cannot import from @features/core-player
  - Shared components go to @design-system
  - Shared logic goes to @operations
```

---

## 2. Critical Spec Fixes

### 2.1 Bar vs Cycle Clarification (disappearing-beat/spec.md)

**Problem:** Spec uses "bars" but audio engine works in "cycles." For 3:2, bar = cycle. For 4:3, they differ.

**Fix:** Replace all references to "bars" with "cycles." The `cyclesPerStage` config replaces `barsPerStage`.

**Cycle definition (applies everywhere — audio engine, disappearing beat, baby mode, visualizer):**

> **One cycle = one LCM period of the polyrhythm, measured from beat-1 to the next beat-1.**
> - For 3:2 at 120 BPM: LCM(3,2) = 6 subdivision beats. Cycle duration = (60/120) * 2 = 1000ms
> - For 4:3 at 120 BPM: LCM(4,3) = 12 subdivision beats. Cycle duration = (60/120) * 3 = 1500ms
> - `onCycleComplete` fires when the scheduler reaches beat-1 of the next cycle
> - All stage transitions, visualizer rotations, and baby mode beat counts use this definition
> - There is no separate concept of "bar" — the cycle IS the repeating unit

### 2.2 Session Creation Ownership

**Problem:** Core Player, Feel Lessons, and Disappearing Beat all create sessions and show feel-state prompts. Unclear who owns what.

**Fix:** Standardize across all features:
1. Feature calls `sessionStore.startSession(mode, polyrhythmId)` on play/start
2. Feature calls `sessionStore.endSession()` on stop/complete — this creates the session record
3. Progress Tracking's `FeelStatePrompt` bottom sheet appears (triggered by `sessionStore.pendingFeelState`)
4. User selects feel state -> `sessionStore.setFeelState(sessionId, state)` updates the record
5. Prompt can be dismissed (null feel state is valid)

**One owner rule:** `sessionStore` owns session lifecycle. Features just call start/end.

**Session lifecycle state diagram:**

```
[idle] --startSession(mode, polyrhythmId)--> [recording]
  |                                              |
  |   (app killed: orphaned session cleaned      |
  |    up on next app launch via                 |
  |    sessionStore.cleanOrphanedSessions())     |
  |                                              |
  |                          endSession() -------+
  |                                              |
  |                                    [pendingFeelState]
  |                                        |         |
  |                     setFeelState() ----+    dismiss() --+
  |                                        |                |
  |                                   [completed]     [completed]
  |                                   (with feel)     (feel=null)
  |                                        |                |
  |                          syncQueue.enqueue() -----------+
  |                                        |
  |                                    [synced]
```

**Edge cases:**
- App killed during `[recording]`: on next launch, `cleanOrphanedSessions()` finds sessions without `endedAt`, sets duration to `startedAt` to last known timestamp, marks as completed with `feelStateAfter: null`
- `startSession()` while already recording: calls `endSession()` on current session first (auto-close)
- Network error during sync: stays in sync queue, retried with exponential backoff + jitter (max 5 retries)

### 2.2.1 Feature-to-Store Ownership Matrix

| Feature | Reads | Writes |
|---------|-------|--------|
| **Onboarding** | — | `userStore.setProfile()`, `babyStore.setBabyProfile()`, `supabase.auth.signInAnonymously()` |
| **Core Player** | `audioStore.*`, `settingsStore.lastUsed` | `audioStore.play/pause/stop()`, `sessionStore.startSession()`, `sessionStore.endSession()`, `settingsStore.saveLastUsed()` |
| **Feel Lessons** | `lessonStore.getProgress()`, `audioStore.*` | `audioStore.play/pause/stop()`, `sessionStore.startSession()`, `sessionStore.endSession()`, `lessonStore.completeStep()`, `lessonStore.awardBadge()` |
| **Disappearing Beat** | `audioStore.*`, `sessionStore.currentSession` | `audioStore.fadeLayer()`, `audioStore.muteAll()`, `sessionStore.startSession()`, `sessionStore.endSession()` |
| **Baby Mode** | `babyStore.profile`, `babyStore.sessions`, `settingsStore.babyPrefs` | `audioStore.play/stop()`, `babyStore.logSession()`, `babyStore.updateResponse()` |
| **Progress Tracking** | `sessionStore.sessions`, `lessonStore.badges`, `sessionStore.pendingFeelState` | `sessionStore.setFeelState()` |
| **Settings** | `userStore.profile`, `settingsStore.*` | `userStore.updateProfile()`, `settingsStore.update()` |

**Rules:**
- Stores never import other stores (no circular dependencies)
- Features read via selector hooks, write via store actions
- Only `sessionStore` creates/ends practice sessions
- Only `babyStore` creates baby-specific sessions (separate entity)
- `audioStore` is ephemeral (not persisted) — holds runtime playback state only

### 2.3 Audio Scheduler During Mute (audio-engine/spec.md)

**Problem:** Disappearing Beat assumes scheduler keeps ticking during `muteAll()`. Audio engine spec doesn't confirm this.

**Fix:** Add to audio engine spec:
> `muteAll()` sets all layer volumes to 0 but does NOT stop the scheduler. `onCycleComplete` callbacks continue firing. `onBeat` callbacks continue firing (with `audible: false` flag). This ensures beat-1 timestamps remain accurate for drift detection.

**Scheduler lifecycle:**
- Starts when `audioStore.play()` is called
- Runs continuously while `isPlaying === true`, even during mute/fade
- Stops ONLY when `audioStore.stop()` is called (which features trigger via transport controls or session end)
- On app background: scheduler pauses (via AppState listener). On foreground: resumes with wall-clock re-anchor

**Audio store role (`audio-store.ts`):**
- Holds **ephemeral runtime state only** — NOT persisted to AsyncStorage
- State: `isPlaying`, `bpm`, `ratioA`, `ratioB`, `layerAVolume`, `layerBVolume`, `stereoSplit`, `soundA`, `soundB`, `currentBeat`
- Actions: `play()`, `pause()`, `stop()`, `setBpm()`, `setRatio()`, `fadeLayer()`, `muteAll()`, `unmuteAll()`
- Exposes callbacks: `onBeat(callback)`, `onCycleComplete(callback)` — return unsubscribe functions
- Does NOT own sessions or persistence — that's `sessionStore`'s job

### 2.4 Auth Token Storage (api-contracts.md)

**Problem:** Token storage location not specified. Mixed use of SecureStore and AsyncStorage.

**Fix:** Add to STORAGE_KEYS:
```typescript
const STORAGE_KEYS = {
  // ... existing keys
  AUTH_SESSION: 'groovecore:auth-session',  // expo-secure-store (encrypted)
} as const;
```

Rule: Auth credentials use `expo-secure-store`. All other data uses `AsyncStorage`.

---

## 3. New Contract: Accessibility

Add `development/contracts/accessibility.md`:

### Rules

1. **Every interactive element** must have:
   - `accessibilityRole` (button, slider, tab, etc.)
   - `accessibilityLabel` (translated, describes what the element is)
   - `accessibilityHint` (translated, describes what happens on activation)
   - `accessibilityState` ({ disabled, selected, busy } as applicable)

2. **Touch targets:** minimum 44x44px for adults, 80x80px for baby mode
   - Use `hitSlop` to extend small visual elements to meet minimum

3. **Images and icons:**
   - Meaningful: `accessibilityLabel` required
   - Decorative: `accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants"`

4. **Dynamic content:** Use `AccessibilityInfo.announceForAccessibility()` for:
   - BPM changes
   - Stage transitions in Disappearing Beat
   - Feel state changes
   - Session completion

5. **Focus management:**
   - Modal/bottom sheet: trap focus inside when open
   - Screen transitions: focus moves to screen title

6. **Contrast ratios:** All text/background pairs must meet WCAG 2.2 AA (4.5:1 normal text, 3:1 large text)

### Design System Integration

All `@design-system` components enforce accessibility by default:
- `Button` requires `accessibilityLabel` prop (TypeScript enforced)
- `Slider` announces value changes
- `TapTarget` wraps children with minimum 44px hit area
- `Icon` requires either `accessibilityLabel` or `decorative={true}`

---

## 4. New Contract: Testing Strategy

Add `development/contracts/testing-strategy.md`:

### File Naming and Location
- Always `.test.ts` or `.test.tsx` — never `.spec.ts`
- Tests live in a `__tests__/` folder adjacent to the source file's directory:

```
src/features/core-player/
├── components/
│   ├── RadialVisualizer.tsx
│   └── BpmControl.tsx
├── hooks/
│   └── use-core-player-data.ts
├── __tests__/
│   ├── RadialVisualizer.test.tsx
│   ├── BpmControl.test.tsx
│   └── use-core-player-data.test.ts
├── types.ts
├── constants.ts
└── index.ts

src/operations/polyrhythm/
├── calculate-events.ts
├── ratio-utils.ts
├── __tests__/
│   ├── calculate-events.test.ts
│   └── ratio-utils.test.ts
└── index.ts
```

### Test Utilities
- `renderWithProviders()` in `src/__tests__/jest-utils.tsx` wraps components with all required providers (theme, i18n, gesture handler, safe area)
- Store mock factories in `src/__tests__/mocks/stores.ts`
- Supabase mock in `src/__tests__/mocks/supabase.ts`

### Coverage Targets
- Unit tests (operations, libs): 80%+
- Component tests (features, design-system): 60%+
- Integration tests (cross-feature flows): key happy paths

### What to Test
- Operations: pure function input/output
- Hooks: state transitions, side effects
- Components: user interactions, accessibility, conditional rendering
- Stores: action results, persistence

### What NOT to Test
- Styling/layout
- Internal implementation details
- Third-party library behavior
- Static content rendering

### Mocking Strategy
- Mock at module boundaries (`@libs/audio`, `@data-access/supabase`)
- Never mock `@operations` — test them directly
- Use `jest.mock()` for native modules (expo-av, expo-secure-store)

---

## 5. New Contract: Localization

Add to `development/contracts/coding-conventions.md`:

### Translation Keys

All user-facing strings must use i18next `t()` function. Never hardcode text.

Key format: `feature.component.element.type`

```typescript
// Examples:
t('corePlayer.bpmControl.slider.label')           // "Tempo"
t('corePlayer.bpmControl.slider.a11yHint')         // "Adjust tempo between 40 and 160 BPM"
t('corePlayer.stereoSplit.toggle.label')            // "Stereo Split"
t('babyMode.duetTap.celebration.announcement')      // "Great job! You tapped together!"
t('progress.feelState.executing.label')             // "Executing"
t('progress.feelState.hearing.label')               // "Hearing"
t('progress.feelState.feeling.label')               // "Feeling"
```

### Hook Pattern

```typescript
// In hooks/use-core-player-data.ts
const useTranslations = () => {
  const { t } = useTranslation();
  return {
    bpmLabel: t('corePlayer.bpmControl.slider.label'),
    bpmA11yHint: t('corePlayer.bpmControl.slider.a11yHint'),
    // ...
  };
};
```

---

## 6. TypeScript Strict Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false
  }
}
```

---

## 7. Code Style Enforcements

Add to coding-conventions.md:

- **TypeScript only** — no .js/.jsx files (except config)
- **Arrow functions only** (enforced by ESLint)
- **No default exports** — named exports only (`import/no-default-export: error`)
- **Type imports:** `import type { Foo } from 'bar'`
- **Alphabetized imports** with newlines between groups (aliases, third-party, relative)
- **No inline styles** — use `StyleSheet.create` or design system tokens

---

## 8. Updated Epic Order

> **Epic numbering updated 2026-03-13 per unified numbering scheme. Old Epic 1 (Project Scaffolding) absorbed into Epic 0.**

```
Epic 0: Developer Infrastructure (absorbs old Epic 1: Project Scaffolding)
  - Project scaffold (Expo + TypeScript strict + ESLint + Jest)
  - Path aliases configuration
  - Design system scaffold (Button, IconButton, typography components)
  - i18next setup with English translations
  - ErrorBoundary component
  - Test utilities (renderWithProviders, mock factories)
  - CI: lint + typecheck + test

Epic 1: Audio Engine (add scheduler-during-mute clarification)
Epic 2: Data Layer (add auth token storage fix)
Epic 3: Navigation Shell (installs @gorhom/bottom-sheet)
Epic 4: Onboarding (add i18n keys)
Epic 5: Core Player (add session ownership rule)
Epic 6: Feel Lessons (unchanged)
Epic 7: Disappearing Beat (fix bar->cycle, add session ownership)
Epic 8: Baby Mode (fix activityType type safety)
Epic 9: Progress Tracking (add session ownership)
Epic 10: Integration (add "done" criteria checklist)
Epic 11: Testing & QA (add coverage targets)
```

### Updated Parallelization

```
T0: Epic 0 (Developer Infrastructure) — 1 agent, ~5-7 days
T1: Epics 1 + 2 + 3 (Audio, Data, Nav) — 3 agents parallel
T2: Epics 4 + 5 + 8 + 9 (Onboarding, Player, Baby, Progress) — 4 agents parallel
T3: Epics 6 + 7 (Lessons, Disappearing Beat) — 2 agents parallel
T4: Epic 10 (Integration) — 1 agent
T5: Epic 11 (QA) — 1 agent
```

---

## 9. Design System Components (MVP Scope)

Minimal set needed before features start. Each component has accessibility props baked in.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Primary actions | variant, size, accessibilityLabel (required), loading, disabled |
| `Text` | All typography | variant (h1-h4, body, caption), color, accessibilityRole |
| `Card` | Content containers | variant (elevated, outlined), onPress, accessibilityLabel |
| `Slider` | BPM, volume | min, max, step, accessibilityLabel (required), onValueChange |
| `Icon` | Iconography | name, size, accessibilityLabel OR decorative (one required) |
| `TapTarget` | Touch area wrapper | minSize (44 default, 80 baby), children |
| ~~`BottomSheet`~~ | ~~Modals/prompts~~ | REMOVED: Use `@gorhom/bottom-sheet` instead (installed in Epic 3/Navigation Shell) |
| `ProgressBar` | Lesson progress | progress (0-1), accessibilityLabel |
| `Badge` | Feel state dots | variant (executing, hearing, feeling), size |
| `Spinner` | Loading states | size, accessibilityLabel |
| `Dialog` | Confirmations | visible, title, actions, accessibilityLabel |

---

## 10. Design System Token Mapping

Design system components consume tokens defined in `development/contracts/design-tokens.md`. Here's how they map:

### Color Tokens (`src/design-system/tokens/colors.ts`)

```typescript
export const colors = {
  // Core palette (from design-tokens.md)
  primary: '#818CF8',        // Indigo — layerA, primary actions
  secondary: '#FB923C',      // Orange — layerB, secondary actions
  background: '#0F0D1A',     // Deep navy — app background
  surface: '#1A1726',        // Card/elevated surface
  textPrimary: '#F8FAFC',    // White-ish — headings, primary text
  textSecondary: '#94A3B8',  // Gray — secondary text
  success: '#4ADE80',        // Green — "Feeling" state, success
  warning: '#FBBF24',        // Amber — "Hearing" state, caution
  error: '#F87171',          // Red — errors, destructive
  disabled: '#475569',       // Muted gray

  // Baby mode warm palette (applied via ThemeProvider)
  babyBackground: '#FFF7ED',
  babySurface: '#FFEDD5',
  babyPrimary: '#F97316',
  babyText: '#431407',
} as const;
```

### Component Token Usage

| Component | Tokens Used |
|-----------|-------------|
| `Button` | `colors.primary` (default), `colors.secondary` (variant), `colors.disabled`, `typography.button`, `spacing.md` padding, `borderRadius.md` |
| `Text` | `colors.textPrimary/Secondary`, `typography.h1-h4/body/caption` |
| `Card` | `colors.surface`, `shadows.sm/md`, `borderRadius.lg`, `spacing.md` padding |
| `Slider` | `colors.primary` (track fill), `colors.surface` (track bg), `spacing.xs` height |
| `Badge` | `colors.success` (feeling), `colors.warning` (hearing), `colors.disabled` (executing) |
| `TapTarget` | `spacing.tapMinimum` (44px), `spacing.tapMinimumBaby` (80px) |
| ~~`BottomSheet`~~ | REMOVED: Use `@gorhom/bottom-sheet` (Epic 3). Wrapper component `BottomSheetContainer` in Epic 3 consumes these tokens. |
| `ProgressBar` | `colors.primary` (fill), `colors.surface` (track), `borderRadius.full` |

### Spacing Scale (`src/design-system/tokens/spacing.ts`)

```typescript
export const spacing = {
  xxs: 2,   xs: 4,   sm: 8,   md: 16,
  lg: 24,   xl: 32,  xxl: 48,
  tapMinimum: 44,      // WCAG minimum touch target
  tapMinimumBaby: 80,  // Baby mode enlarged touch target
} as const;
```

---

## 11. Configuration Files

### ESLint (`.eslintrc.js`)

Uses `eslint-plugin-import` for boundary enforcement:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'prefer-arrow', 'react-native-a11y'],
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // No default exports
    'import/no-default-export': 'error',

    // Arrow functions only
    'prefer-arrow/prefer-arrow-functions': ['error', { singleReturnOnly: false }],

    // Type imports
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

    // Import depth restrictions
    'no-restricted-imports': ['error', {
      patterns: [
        // Block deep feature imports
        { group: ['@features/*/*/**'], message: 'Import from @features/<name> barrel only' },
        // Block deep lib imports (with exceptions)
        { group: ['@libs/*/*/**'], message: 'Import from @libs/<name> barrel only' },
        // Block cross-feature imports
        { group: ['../features/*'], message: 'Use @features alias, not relative paths' },
        // Block direct design-system internals
        { group: ['@design-system/components/*/**'], message: 'Import from @design-system barrel only' },
      ],
    }],

    // No inline styles
    'react-native/no-inline-styles': 'error',

    // Accessibility
    'react-native-a11y/has-accessibility-props': 'warn',
    'react-native-a11y/has-valid-accessibility-role': 'error',
  },
  overrides: [
    // Allow default exports in Expo Router app/ directory (required by framework)
    { files: ['app/**/*.tsx'], rules: { 'import/no-default-export': 'off' } },
    // Allow default exports in config files
    { files: ['*.config.*'], rules: { 'import/no-default-export': 'off' } },
  ],
};
```

### TypeScript (`tsconfig.json`)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@features/*": ["src/features/*"],
      "@data-access/*": ["src/data-access/*"],
      "@libs/*": ["src/libs/*"],
      "@operations/*": ["src/operations/*"],
      "@design-system": ["src/design-system"],
      "@design-system/*": ["src/design-system/*"],
      "@types": ["src/types"],
      "@types/*": ["src/types/*"],
      "@entry-providers": ["src/entry-providers"],
      "@entry-providers/*": ["src/entry-providers/*"],
      "@assets/*": ["src/assets/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Babel (`babel.config.js`)

```javascript
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@features': './src/features',
          '@data-access': './src/data-access',
          '@libs': './src/libs',
          '@operations': './src/operations',
          '@design-system': './src/design-system',
          '@types': './src/types',
          '@entry-providers': './src/entry-providers',
          '@assets': './src/assets',
        },
      }],
    ],
  };
};
```

### Jest (`jest.config.ts`)

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  setupFilesAfterSetup: ['./src/__tests__/jest-setup.ts'],
  moduleNameMapper: {
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@data-access/(.*)$': '<rootDir>/src/data-access/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@operations/(.*)$': '<rootDir>/src/operations/$1',
    '^@design-system$': '<rootDir>/src/design-system',
    '^@design-system/(.*)$': '<rootDir>/src/design-system/$1',
    '^@types$': '<rootDir>/src/types',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@entry-providers$': '<rootDir>/src/entry-providers',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: { branches: 60, functions: 60, lines: 60, statements: 60 },
    './src/operations/': { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};

export default config;
```

---

## 12. What Stays Unchanged

- PRD.md (product vision is solid)
- All feature spec content (just add i18n keys and a11y props to component specs)
- All foundation spec content (just the targeted fixes above)
- Extension point stubs (excellent foresight, no changes needed)
- Master todolist structure (just prepend Epic 0)
- Agent-centric workflow (scoped reading lists still work)
- Technology choices (Expo, Zustand, Supabase, Claude API, Reanimated, Skia)

---

## 13. Decision Log

| Decision | Rationale |
|----------|-----------|
| Own design system over third-party | Ensures accessibility baked in, matches app's unique visual identity, avoids dependency risk |
| Operations layer for shared logic | Prevents duplication of polyrhythm math, drift detection, stage calculation across features |
| i18next for localization | Industry standard, works well with Expo, enables future multi-language support |
| ESLint import restrictions | Prevents spaghetti dependencies, enforces module boundaries |
| TypeScript strict mode | Catches bugs at compile time, reduces runtime errors |
| Epic 0 before everything | Every subsequent epic benefits from guardrails -- investment pays back immediately |
| No dark mode in MVP | Simplifies design system scope; can be added post-MVP via token layer |
