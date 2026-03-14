# Epic 0 Review -- First Principles Analysis

**Date:** 2026-03-13
**Reviewer:** Claude (automated first-principles review)
**Artifact under review:** `docs/superpowers/plans/2026-03-13-epic-0-developer-infrastructure.md`

---

## Review Status

This review was conducted on 2026-03-13.

### Findings Incorporated
- [ ] Epic numbering unified (new scheme applied across all docs)
- [ ] BottomSheet conflict resolved (using @gorhom/bottom-sheet)
- [ ] Design system reduced to essential components
- [ ] Type drift addressed (data-models.md is canonical source)
- [ ] Build verification added (expo start in done criteria)
- [ ] Hardcoded paths fixed

All plans should be updated to reflect these findings before implementation begins.

---

## Executive Summary

Epic 0 is well-structured and covers the critical engineering guardrails (TypeScript strict, ESLint, Jest, path aliases, design tokens, i18n, error handling). However, it has five material issues: (1) Old Epic 1 (Project Scaffolding) from the master todolist is almost entirely redundant with Epic 0 and should be eliminated (now resolved -- absorbed into Epic 0); (2) Epic 0 installs `expo-av` speculatively -- no code in Epic 0 consumes it, and its Jest mock belongs closer to Epic 1/Audio Engine; (3) there is no build verification step -- the plan never runs the app on an iOS simulator or Android emulator, meaning subsequent epics may inherit a broken foundation; (4) the design system builds 11 components via TDD, but only 4 are consumed by the next three epics, meaning 7 components are speculative work; (5) shared TypeScript types drift from the canonical `data-models.md` contract in several field names and missing types (e.g., `AudioConfig`, `SoundId`, `DisappearingBeatConfig`, `WeeklySummary` are all absent).

---

## A. Epic 1 Elimination

### Overlap Analysis

Epic 1 (Project Scaffolding) from `master-todolist.md` has eight items. Here is a line-by-line comparison with Epic 0:

| Epic 1 Item | Covered by Epic 0? | Where in Epic 0 |
|---|---|---|
| `npx create-expo-app` with TypeScript template | Yes | Task 1 |
| Install core deps (zustand, expo-av, expo-router, reanimated, skia) | Partially -- Epic 0 installs zustand, expo-av, expo-router, reanimated but NOT `@shopify/react-native-skia` | Task 2 |
| Configure path aliases | Yes | Tasks 3 + 4 |
| ESLint + Prettier | Partially -- Epic 0 has ESLint but no Prettier configuration | Task 5 |
| Folder skeleton | Yes | Task 20 |
| Jest + RNTL | Yes | Task 6 |
| Verify builds on iOS/Android simulators | NO -- Critical gap | Missing entirely |
| Supabase project setup | NO -- Connection config only needed by Epic 3 | Not in Epic 0 |

**Score: 6 of 8 items fully or mostly covered.**

### Recommendation: Eliminate Epic 1

Absorb its two uncovered items as follows:

1. **Build verification on simulators** -- Add to Epic 0 as a new Task (between Task 21 and Task 22). This is the most important missing piece. Without it, you are shipping an untested foundation.

2. **Supabase project setup** -- Move to Epic 2 (Data Layer). Supabase is consumed exclusively by the Data Layer. First principles says: set up infrastructure where it is consumed, not speculatively in a foundational layer that does not use it.

3. **Prettier configuration** -- Add to Epic 0 Task 5 (ESLint). It is a one-file addition (`.prettierrc`) and should be part of the linting guardrails.

4. **`@shopify/react-native-skia`** -- Do NOT install in Epic 0. It is consumed only by the radial visualizer in Epic 5 (Core Player). Install it in Epic 5.

After elimination, renumber all subsequent epics (this renumbering has been applied):

- Old Epic 2 (Audio Engine) is now Epic 1
- Old Epic 3 (Data Layer) is now Epic 2
- Old Epic 4 (Navigation Shell) is now Epic 3
- And so on through Epic 11 (was Epic 12)

---

## B. Missing Items for Consuming Epics

### For Epic 1 (Audio Engine, formerly Epic 2)

| Requirement | Provided by Epic 0? | Details |
|---|---|---|
| Types: `SoundId` | NO | Epic 0's `src/types/` has no audio types. `SoundId` is defined in `data-models.md` but missing from Epic 0's Task 8 |
| Types: `AudioConfig` | NO | Defined in `data-models.md`, absent from Epic 0 |
| Types: `ScheduleEvent` | NO | Defined in audio-engine spec, not in shared types (correct -- this is internal to the audio engine) |
| Types: `AudioState`, `AudioActions` | NO, but acceptable | These are internal to the audio store and should be defined in Epic 2, not Epic 0 |
| Path alias `@libs/audio` | YES | `@libs/*` alias covers this |
| Jest mock for `expo-av` | YES | Task 6, Step 4 |
| Operations directory for polyrhythm math | YES | Task 20 creates `src/operations/polyrhythm/` |
| `expo-av` installed | YES | Task 2 (but see Section F -- this is premature) |

**Gap: Add `SoundId` and `AudioConfig` to `src/types/` in Task 8.** These are shared types consumed by multiple epics (Audio Engine, Core Player, Feel Lessons, Disappearing Beat).

### For Epic 2 (Data Layer, formerly Epic 3)

| Requirement | Provided by Epic 0? | Details |
|---|---|---|
| Types: `UserProfile` | YES, but drifted | Epic 0 defines `UserProfile` with `preferredGenres` instead of `genrePreferences`, `isOnboarded` as a field (should be in store state, not the entity), and missing `email`, `selectedRhythms` |
| Types: `Session` | YES, but drifted | Epic 0 defines `Session` with `bpm` (single field) instead of `bpmStart`/`bpmEnd`, `durationSeconds` instead of `duration`, missing `disappearingBeatStageReached` |
| Types: `BabyProfile` | YES, but drifted | Epic 0 uses `BabyStage = 1|2|3|4|5` but `data-models.md` defines stage 0 (passive listening). Missing `stageOverride` field |
| Types: `BabySession` | YES, but drifted | Epic 0 uses `BabyActivityType` with different values than `data-models.md` (`BABY_ACTIVITY_TYPES`). Missing `completedAt` vs using `startedAt`/`endedAt` |
| Types: `LessonProgress` | YES, but drifted | Epic 0 has `totalSteps`, `isComplete`, `feelStateAwarded` instead of `completed`, `feelBadgeEarned`, `lastAttemptAt` |
| Types: `DisappearingBeatConfig` | NO | Defined in `data-models.md`, absent from Epic 0 |
| Types: `WeeklySummary` | NO | Defined in `data-models.md`, absent from Epic 0 |
| Types: `FeelState` | YES | Matches correctly |
| Types: `PolyrhythmRatio` | YES, but drifted | Epic 0 uses `label` instead of `name`, `mnemonicPhrase` instead of `mnemonic`, missing `id`, `displayName` fields. Only has 2 MVP ratios instead of 3 (missing `2:3`) |
| Jest mock for AsyncStorage | NO | Not in any mock file |
| Jest mock for Supabase client | YES | Task 6, Step 6 |
| Path alias `@data-access/stores` | YES | `@data-access/*` covers this |
| Zustand installed | YES | Task 2 |

**Critical gap: The shared types in Epic 0 Task 8 have significant drift from `data-models.md`.** This will cause either (a) Epic 3 must rewrite all types, negating Epic 0's work, or (b) Epic 3 inherits wrong types and builds on a broken contract.

**Fix: Rewrite Task 8 to be a direct transcription of `data-models.md` types, not a reinterpretation.** Every field name, every type, every union value must match the canonical contract exactly.

**Missing mock: Add an AsyncStorage mock** to `src/__tests__/mocks/async-storage.ts`. Every store that uses Zustand's `persist` middleware needs this in tests.

### For Epic 3 (Navigation Shell, formerly Epic 4)

| Requirement | Provided by Epic 0? | Details |
|---|---|---|
| Design system tokens (colors, typography, spacing) | YES | Task 7 |
| Design system components (Text, Button) | YES | Tasks 9-10 |
| Entry providers (ThemeProvider, SafeArea, Gesture) | YES | Task 18 |
| Path alias for design system | YES | `@design-system` alias |
| `app/_layout.tsx` with provider hierarchy | YES | Task 19 |
| Expo Router configured | YES | Task 2 (expo-router installed), Task 19 (Stack used) |
| `@gorhom/bottom-sheet` installed | NO | Epic 0's BottomSheet (Task 12g) deliberately uses `Modal + Animated.View` instead. The Epic 3/Nav Shell spec explicitly requires `@gorhom/bottom-sheet`. This is a conflict -- **RESOLVED: Task 12g removed, use @gorhom/bottom-sheet in Epic 3** |
| `expo-keep-awake` installed | NO | Needed by Epic 3/Nav Shell for screen-awake behavior |
| Reanimated mock for tests | NO | No jest mock for `react-native-reanimated` beyond the NativeAnimatedHelper silence in jest-setup |

**Conflicts:**
1. Epic 0 Task 12g builds a homebrew BottomSheet, but the navigation shell spec explicitly requires `@gorhom/bottom-sheet`. Recommendation: Remove Task 12g entirely. Defer BottomSheet to Epic 3 (Navigation Shell), which should install `@gorhom/bottom-sheet` and build its own wrapper. **RESOLVED: Task 12g marked for removal in Epic 0 plan.**
2. `expo-keep-awake` is not installed. This is fine -- install it in Epic 3 (Navigation Shell) where it is consumed.

**Missing mock: Add a reanimated mock.** The nav shell uses `react-native-reanimated` for the baby mode palette transition. The standard Reanimated jest mock should be added to jest-setup.ts.

---

## C. Build Verification

**This is the single biggest gap in Epic 0.**

Epic 0's Task 21 (Full Verification) runs `tsc --noEmit`, ESLint, and Jest. It never runs `npx expo start`, never builds for iOS simulator, never builds for Android emulator. The master todolist's Epic 1 explicitly lists "Verify app builds and runs on iOS simulator and Android emulator" as a deliverable.

Without build verification, the following failure modes are invisible:

1. **Babel module-resolver misconfiguration** -- `tsc` checks TypeScript paths but Metro uses Babel. A mismatch means the app won't start even though `tsc --noEmit` passes.
2. **Native dependency linking failures** -- `react-native-reanimated`, `react-native-gesture-handler`, and `react-native-safe-area-context` all require native module linking. If this fails, you discover it only when an agent tries to run the app in Epic 2/3/4.
3. **Expo Router configuration errors** -- The `app/_layout.tsx` with `Stack` may fail if Expo Router is not correctly configured in `app.json` (e.g., missing `scheme`, wrong `main` entry point).

### Recommendation

Add a new **Task 21b: Build Verification** between the current Task 21 and Task 22:

```
- [ ] Step 1: Start Expo dev server and verify Metro bundling succeeds
      npx expo start --no-dev --minify (verify no bundle errors)
- [ ] Step 2: Build and run on iOS simulator
      npx expo run:ios (verify app launches, shows root layout)
- [ ] Step 3: Build and run on Android emulator
      npx expo run:android (verify app launches, shows root layout)
- [ ] Step 4: Create a temporary placeholder screen to verify the Stack renders
      Add app/index.tsx with a simple Text component, verify it renders
- [ ] Step 5: Remove placeholder if appropriate, commit
```

This is non-negotiable. A foundation you have not booted is not a foundation.

---

## D. Design System Proportionality

Epic 0 Task 12 builds 11 design system components. First principles question: which ones are actually needed before Epics 2, 3, and 4 can start?

### Component Usage by Next Consumers

| Component | Epic 1 (Audio) | Epic 2 (Data) | Epic 3 (Nav Shell) | First real use | Verdict |
|---|---|---|---|---|---|
| **Text** | No | No | Yes (headers, labels) | Epic 3 | BUILD NOW |
| **Button** | No | No | Yes (tab interactions) | Epic 3 | BUILD NOW |
| **TapTarget** | No | No | No | Epic 5 (Core Player) | DEFER |
| **Icon** | No | No | Yes (tab bar icons) | Epic 3 | BUILD NOW |
| **Badge** | No | No | No | Epic 9 (Progress) | DEFER |
| **Spinner** | No | No | Yes (splash loading) | Epic 3 | BUILD NOW |
| **Card** | No | No | No | Epic 4 (Onboarding) or Epic 9 | DEFER |
| **Slider** | No | No | No | Epic 5 (Core Player BPM) | DEFER |
| **ProgressBar** | No | No | No | Epic 6 (Feel Lessons) | DEFER |
| **BottomSheet** | No | No | Yes, but conflicts (see B) | Epic 3 | REMOVE (conflict with @gorhom) |
| **Dialog** | No | No | No | Epic 4+ (confirmations) | DEFER |

### Recommendation

**Build in Epic 0:** Text, Button, Icon, Spinner (4 components)
**Defer to consuming epics:** TapTarget (Epic 5), Badge (Epic 9), Card (Epic 4), Slider (Epic 5), ProgressBar (Epic 6), Dialog (Epic 4+)
**Remove entirely from Epic 0:** BottomSheet (conflicts with Epic 3/Navigation Shell's @gorhom/bottom-sheet requirement)

This reduces Epic 0's design system work from 11 components to 4, cutting roughly 40% of the plan's total effort while delivering everything the next three parallel epics actually need.

The deferred components should be built by the epic that first needs them. This follows the principle: build what the next consumer needs, not what might be needed someday.

**Token work stays in Epic 0.** All design tokens (colors, typography, spacing, border-radius, shadows) are correctly placed in Epic 0 because every downstream epic references them.

---

## E. Test Mock Completeness

| Mock | Present in Epic 0? | Needed by | Gap? |
|---|---|---|---|
| `expo-av` | YES (Task 6 Step 4) | Epic 1 (Audio Engine) | No, but premature -- see F |
| AsyncStorage | NO | Epic 2 (all persisted stores) | YES -- Critical gap |
| Supabase client | YES (Task 6 Step 6) | Epic 2 (sync queue) | No |
| `expo-keep-awake` | NO | Epic 3 (nav shell) | Minor -- can be added in Epic 3 |
| `react-native-reanimated` | PARTIAL (NativeAnimatedHelper silenced) | Epic 3 (baby palette switch), Epic 5+ | YES -- Need standard Reanimated jest mock |
| Zustand store mock factory | YES (Task 6 Step 5) | All feature epics | No |
| `expo-secure-store` | NO | Epic 2 (auth token storage) | YES -- Supabase client uses SecureStore for auth storage |
| `react-native-safe-area-context` | NO (used in jest-utils.tsx provider but no dedicated mock) | All component tests | Minor -- RNTL usually provides this, but a mock helps |
| `@react-native-async-storage/async-storage` | NO | Epic 2 (Zustand persist middleware) | YES -- Critical gap |

### Recommendations

1. **Add AsyncStorage mock** (`src/__tests__/mocks/async-storage.ts`):
   ```typescript
   jest.mock('@react-native-async-storage/async-storage', () =>
     require('@react-native-async-storage/async-storage/jest/async-storage-mock')
   );
   ```
   AsyncStorage ships its own Jest mock. Reference it in `jest-setup.ts`.

2. **Add Reanimated mock** to `jest-setup.ts`:
   ```typescript
   require('react-native-reanimated').setUpTests();
   ```
   Or use `jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))`.

3. **Add expo-secure-store mock** (needed because the Supabase client mock in Task 6 Step 6 references `@data-access/supabase` which uses `expo-secure-store`):
   ```typescript
   jest.mock('expo-secure-store', () => ({
     getItemAsync: jest.fn(),
     setItemAsync: jest.fn(),
     deleteItemAsync: jest.fn(),
   }));
   ```

4. **Move `expo-av` mock to Epic 1 (Audio Engine).** Epic 0 has no code that imports `expo-av`. The mock exists in Epic 0 only because `expo-av` is installed in Epic 0, but neither should be there (see Section F).

---

## F. Dependency Installation Timing

First principles: install a dependency when code in the current epic imports it. Installing dependencies speculatively creates risk (version conflicts, build failures, increased bundle size) without immediate benefit.

| Dependency | Installed in Epic 0 (Task 2) | First code use | Should be in Epic 0? |
|---|---|---|---|
| `react-native-reanimated` | YES | Epic 3 (baby palette animation) | YES -- required by gesture-handler and Expo Router internally |
| `react-native-gesture-handler` | YES | Epic 0 (GestureProvider in Task 18) | YES |
| `react-native-safe-area-context` | YES | Epic 0 (SafeAreaProvider in Task 18) | YES |
| `react-native-screens` | YES | Epic 0 (Expo Router dependency) | YES |
| `expo-av` | YES | Epic 1/Audio Engine (sound pool, playback) | NO -- Move to Epic 1 |
| `expo-secure-store` | YES | Epic 2/Data Layer (Supabase auth storage) | NO -- Move to Epic 2 |
| `@react-native-async-storage/async-storage` | YES | Epic 2/Data Layer (Zustand persist) | BORDERLINE -- No Epic 0 code uses it, but it is a foundational dependency. Acceptable either way |
| `zustand` | YES | Epic 0 (store mock factory uses `create`) | YES |
| `i18next` + `react-i18next` | YES | Epic 0 (localization provider) | YES |
| `@shopify/react-native-skia` | NOT installed (mentioned in old master todolist) | Epic 5/Core Player (radial visualizer) | NO -- Correct to not install |
| `@gorhom/bottom-sheet` | NOT installed | Epic 3/Navigation Shell (bottom sheet container) | NO -- Install in Epic 3 |
| `expo-keep-awake` | NOT installed | Epic 3/Navigation Shell (screen-awake hooks) | NO -- Install in Epic 3 |
| `@react-native-community/slider` | NOT installed (but Slider component in Task 12e references it) | Epic 5/Core Player (BPM slider) | NO -- But Task 12e will fail without it. Another reason to defer Slider |

### Recommendations

1. **Remove `expo-av` from Task 2 Step 1.** Move to Epic 1 (Audio Engine) dependency installation step. Also move its Jest mock to Epic 1.
2. **Remove `expo-secure-store` from Task 2 Step 1.** Move to Epic 2 (Data Layer).
3. **Keep `@react-native-async-storage/async-storage` in Epic 0.** Even though Epic 0 code doesn't directly import it, it is part of the foundational persistence pattern and Zustand persist middleware is referenced in the architecture.
4. **Task 12e (Slider) references `@react-native-community/slider` which is not installed.** Since Slider is deferred (Section D), this is resolved automatically. If Slider were kept, the dependency would need to be added.

---

## G. Recommended Changes

Ordered by priority (highest first):

### Critical (must fix before implementation)

1. **Add build verification task.** Insert Task 21b as described in Section C. Verify Metro bundling, iOS simulator build, and Android emulator build. Without this, Epic 0 is not a verified foundation.

2. **Fix type drift from data-models.md.** Rewrite Task 8 entirely. Every type in `src/types/` must be a faithful transcription of `development/contracts/data-models.md`. Specific discrepancies to fix:
   - `UserProfile`: add `id`, `email`, `selectedRhythms`, `genrePreferences` (not `preferredGenres`), `updatedAt`. Remove `isOnboarded` (that belongs in store state, not entity type).
   - `Session`: use `bpmStart`/`bpmEnd` (not single `bpm`), `duration` (not `durationSeconds`), add `disappearingBeatStageReached`, `userId`.
   - `PolyrhythmRatio`: add `id`, `name` (not `label`), `displayName`, `mnemonic` (not `mnemonicPhrase`). Add the third MVP ratio `2:3`.
   - `BabyProfile`: add stage `0`, add `stageOverride`, add `userId`.
   - `BabySession`: use `activityType: string` with `BabyActivityType` as the union from `BABY_ACTIVITY_TYPES`. Add `completedAt`.
   - `LessonProgress`: use `completed` (not `isComplete`), `feelBadgeEarned` (not `feelStateAwarded`), `lastAttemptAt`, add `id`.
   - Add missing types: `SoundId`, `AudioConfig`, `DisappearingBeatConfig`, `WeeklySummary`.

3. **Add AsyncStorage mock** to `src/__tests__/mocks/async-storage.ts` and reference it in `jest-setup.ts`. Every Zustand persist test in Epic 3 depends on this.

### High (should fix)

4. **Eliminate Epic 1 from master todolist.** Absorb remaining scope (Prettier config, build verification) into Epic 0. Move Supabase project setup to Epic 2 (Data Layer). Update master todolist to renumber all epics.

5. **Reduce design system to 4 components.** Keep Text, Button, Icon, Spinner. Defer TapTarget, Badge, Card, Slider, ProgressBar, Dialog to consuming epics. Remove BottomSheet entirely (conflicts with `@gorhom/bottom-sheet` requirement in Epic 3/Navigation Shell spec).

6. **Remove `expo-av` and `expo-secure-store` from Task 2.** Move to Epic 1 (Audio Engine) and Epic 2 (Data Layer) respectively. Also move the `expo-av` Jest mock from Task 6 to Epic 1.

7. **Add Reanimated Jest mock** to `jest-setup.ts`. This is needed by any component test that renders animated components.

### Medium (nice to have)

8. **Add Prettier configuration.** Create `.prettierrc` in Task 5 with standard settings. Add `prettier` and `eslint-config-prettier` to dev dependencies.

9. **Add `expo-secure-store` Jest mock** to the mocks directory (even if expo-secure-store itself is deferred to Epic 2/Data Layer, the Supabase mock in Task 6 Step 6 imports from `@data-access/supabase` which uses it).

10. **Add a placeholder `app/index.tsx`** in Task 19 or Task 21b so the app has a visible screen when build-verified. The current root layout uses `Stack` but there is no initial route defined.

11. **Fix `jest.config.ts` typo.** The config has `setupFilesAfterSetup` -- the correct Jest key is `setupFilesAfterSetup` or `setupFiles`. Verify this is the correct key for the jest-expo preset (it should be `setupFilesAfterSetup` with jest-expo, but double-check).

12. **Add `@entry-providers/*` to Jest `moduleNameMapper`.** The Jest config maps `@entry-providers$` but not `@entry-providers/*`. The root layout imports from `@entry-providers` (barrel) so this works, but future imports like `@entry-providers/theme-provider` would fail in tests.

---

## H. Updated Epic Order

With Epic 1 eliminated and absorbed into Epic 0:

```
Phase 0: Foundation
  Epic 0: Developer Infrastructure (expanded: includes build verification, Prettier)

Phase 1: Foundations (parallelizable)
  Epic 1: Audio Engine (was Epic 2)
  Epic 2: Data Layer (was Epic 3; absorbs Supabase project setup from old Epic 1)
  Epic 3: Navigation Shell (was Epic 4; installs @gorhom/bottom-sheet, expo-keep-awake)

Phase 2: MVP Features (parallelizable, dependencies shown)
  Epic 4: Onboarding Flow (was Epic 5; needs Epic 2 + Epic 3)
  Epic 5: Core Player (was Epic 6; needs Epic 1 + Epic 3; installs @shopify/react-native-skia, builds Slider + TapTarget components)
  Epic 6: Feel Lessons (was Epic 7; needs Epic 1 + Epic 5; builds ProgressBar component)
  Epic 7: Disappearing Beat (was Epic 8; needs Epic 1 + Epic 5)
  Epic 8: Baby Mode (was Epic 9; needs Epic 1 + Epic 2 + Epic 3; builds Card component)
  Epic 9: Progress Tracking (was Epic 10; needs Epic 2 + Epic 3; builds Badge component)

Phase 3: Integration & Polish
  Epic 10: End-to-End Integration (was Epic 11)
  Epic 11: Testing & QA (was Epic 12)
```

### Updated Parallelization

```
Window 0 (T0):  Epic 0 alone
                 +------------------+
                 | Epic 0 (Infra)   |
                 +------------------+

Window 1 (T1):  Epics 1, 2, 3 -- all depend only on Epic 0
                 +----------+  +----------+  +----------+
                 | Epic 1   |  | Epic 2   |  | Epic 3   |
                 | (Audio)  |  | (Data)   |  | (Nav)    |
                 +----------+  +----------+  +----------+

Window 2 (T2):  Epics 4, 5, 8, 9 -- once deps complete
                 +----------+  +----------+  +----------+  +----------+
                 | Epic 4   |  | Epic 5   |  | Epic 8   |  | Epic 9   |
                 | (Onboard)|  | (Player) |  | (Baby)   |  | (Progress)|
                 +----------+  +----------+  +----------+  +----------+
                 (2+3)         (1+3)         (1+2+3)       (2+3)

Window 3 (T3):  Epics 6, 7 -- need Epic 5
                 +----------+  +----------+
                 | Epic 6   |  | Epic 7   |
                 | (Lessons)|  | (Disappr)|
                 +----------+  +----------+

Window 4 (T4):  Epic 10 (Integration)
Window 5 (T5):  Epic 11 (QA)
```

**Net effect:** 12 epics become 12 (one eliminated, numbers shifted). But the critical path is shortened because Epic 1's build verification is now inside Epic 0 rather than being a separate serial gate.

---

## Appendix: Type Drift Detail

For reference, here are the specific field-level discrepancies between Epic 0 Task 8 types and the canonical `data-models.md`:

### UserProfile

| data-models.md field | Epic 0 Task 8 field | Issue |
|---|---|---|
| `id: string` | `id: string` | OK |
| `displayName: string \| null` | `displayName: string \| null` | OK |
| `email: string \| null` | (missing) | MISSING |
| `role: 'musician' \| 'parent' \| 'both'` | `role: UserRole` | OK (same values) |
| `selectedRhythms: string[]` | (missing) | MISSING |
| `genrePreferences: string[]` | `preferredGenres: readonly string[]` | RENAMED |
| `createdAt: string` | `createdAt: string` | OK |
| `updatedAt: string` | `updatedAt: string` | OK |
| (N/A -- store concern) | `isOnboarded: boolean` | WRONG LOCATION -- belongs in store state |

### Session

| data-models.md field | Epic 0 Task 8 field | Issue |
|---|---|---|
| `id: string` | `id: string` | OK |
| `userId: string` | `userId: string` | OK |
| `polyrhythmId: string` | `polyrhythmId: string` | OK |
| `startedAt: string` | `startedAt: string` | OK |
| `endedAt: string \| null` | `endedAt: string` | MISSING nullable |
| `duration: number` | `durationSeconds: number` | RENAMED |
| `bpmStart: number` | `bpm: number` | MISSING bpmEnd, combined into single field |
| `bpmEnd: number` | (missing) | MISSING |
| `mode: 'free-play' \| 'lesson' \| ...` | `mode: SessionMode` | OK (same values) |
| `disappearingBeatStageReached: number` | (missing) | MISSING |
| `feelStateAfter: FeelState \| null` | `feelStateAfter: FeelState \| null` | OK |

### PolyrhythmRatio

| data-models.md field | Epic 0 Task 8 field | Issue |
|---|---|---|
| `id: string` | (missing) | MISSING |
| `ratioA: number` | `ratioA: number` | OK |
| `ratioB: number` | `ratioB: number` | OK |
| `name: string` | `label: string` | RENAMED |
| `displayName: string` | (missing) | MISSING |
| `culturalOrigin: string` | `culturalOrigin: string` | OK |
| `mnemonic: string` | `mnemonicPhrase: string` | RENAMED |
| MVP: 3 ratios (3:2, 4:3, 2:3) | 2 ratios (3:2, 4:3) | MISSING 2:3 |
