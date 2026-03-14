# Feel Lessons — Implementation Tasks

Feature: Feel Internalization Lessons
Spec: `development/features/feel-lessons/spec.md`
Priority: P0 (MVP)

---

## 1. Lesson Engine

- [ ] **Task 1.1: Define LessonStep TypeScript interfaces**
  - Create `LessonStep`, `StepType`, `AudioConfig`, `ExtensionSlot` types as defined in the spec
  - Create `LessonData` type: `{ polyrhythmId: string, title: string, steps: LessonStep[] }`
  - Export from a shared types file (e.g., `src/types/lessons.ts`)
  - **AC:** Types compile with no errors. All fields from the spec are represented.

- [ ] **Task 1.2: Build LessonEngine class/hook**
  - Implement `useLessonEngine(lessonData: LessonData)` hook or standalone class
  - State: `currentStepIndex`, `completedSteps: Set<number>`, `isLessonComplete`
  - Methods: `goNext()`, `goBack()`, `markStepDone(stepIndex)`, `reset()`
  - `goNext()`: advances index if current step is done or is informational (context, shape, mnemonic)
  - `goBack()`: decrements index, min 0
  - `isLessonComplete`: true when all steps are in `completedSteps`
  - **AC:** Unit tests pass for: forward navigation, back navigation, step completion gating, lesson completion detection, boundary checks (cannot go below 0 or above max).

- [ ] **Task 1.3: Build lesson data loader**
  - Load lesson JSON files from `data/lessons/` directory
  - Function: `loadLesson(polyrhythmId: string): LessonData`
  - Validate loaded data against the `LessonData` type at runtime (basic shape check)
  - **AC:** `loadLesson('3-2')` returns the 3:2 lesson data. Invalid polyrhythm ID returns null or throws a descriptive error.

---

## 2. Lesson Screen Shell

- [ ] **Task 2.1: Create LessonScreen top-level component**
  - Route: navigated to from Learn tab polyrhythm library with `polyrhythmId` param
  - Loads lesson data via `loadLesson(polyrhythmId)`
  - Initializes `useLessonEngine` with loaded data
  - Renders progress bar, current step component, and navigation buttons
  - **AC:** Navigating to LessonScreen with `polyrhythmId='3-2'` loads and displays the first step.

- [ ] **Task 2.2: Build progress bar component**
  - Horizontal bar showing steps 1–N
  - Current step: highlighted/filled
  - Completed steps: checkmark icon or filled with completion color
  - Future steps: outlined/empty
  - Props: `totalSteps`, `currentStep`, `completedSteps`
  - **AC:** Progress bar accurately reflects lesson state. Tapping a completed step jumps back to it (optional nice-to-have).

- [ ] **Task 2.3: Implement step navigation (swipe + buttons)**
  - "Back" button: calls `engine.goBack()`, disabled on step 1
  - "Next" / "Mark as Done" button: calls `engine.markStepDone()` then `engine.goNext()`
  - For interactive steps (sing, body, hands, disappearing): "Next" button is disabled until the step's completion condition is met
  - Optional: swipe left/right gesture for navigation (same logic as buttons)
  - **AC:** Navigation between steps works correctly. Interactive steps block forward navigation until completed.

---

## 3. Step Type Components

- [ ] **Task 3.1: Build ContextStep component (type: context)**
  - Renders: step title, primary instruction text, secondary text (if present)
  - Optional: illustration or icon area (placeholder at MVP)
  - Extension slot rendering: if step has `extensionSlot`, render a disabled button with the slot's label
  - Completes immediately (Next button always enabled)
  - **AC:** Step 1 of 3:2 lesson renders instruction and secondary text correctly.

- [ ] **Task 3.2: Build ShapeStep component (type: shape)**
  - Renders: instruction text + the RadialVisualizer in **view-only mode**
  - On mount: configures `audioStore` with step's `audioConfig` and starts playback automatically
  - On unmount or navigation away: stops playback
  - Visualizer is non-interactive (no controls visible)
  - Completes immediately (Next button always enabled)
  - **AC:** Step 2 shows the 3:2 radial pattern playing at 72 BPM. User can observe and proceed.

- [ ] **Task 3.3: Build MnemonicStep component (type: mnemonic)**
  - Renders: instruction text + large mnemonic display (e.g., "NOT DIF-FI-CULT")
  - Below mnemonic: timeline visualization showing syllable-to-beat mapping
    - Horizontal bars or dots for Layer A and Layer B
    - Syllables positioned above their corresponding beat markers
  - Extension slot: "Generate mine" button placeholder (disabled, with "Coming soon" tooltip or hidden)
  - Completes immediately
  - **AC:** Mnemonic text renders large and readable. Timeline shows correct syllable-to-beat alignment for 3:2.

- [ ] **Task 3.4: Build SingStep component (type: sing)**
  - Renders: instruction text ("Sing the 3 while the player plays the 2")
  - On mount: configures `audioStore` to play Layer B only at step's BPM, starts playback
  - On unmount: stops playback
  - "I did it" / "Done" button marks step as complete
  - Extension slot: mic input overlay placeholder (hidden at MVP)
  - **AC:** Audio plays only Layer B. User can listen, sing along, and tap "Done" to proceed.

- [ ] **Task 3.5: Build BodyStep component (type: body)**
  - Renders: instruction text ("Walk in 2, clap in 3")
  - On mount: configures `audioStore` to play both layers, starts playback
  - 60-second countdown timer displayed prominently
  - On timer complete: step auto-marks as done, shows brief "Great work!" message, enables Next
  - On unmount: stops playback, cancels timer
  - **AC:** Timer counts down from 60. Audio plays both layers. Step completes when timer finishes.

- [ ] **Task 3.6: Build HandsStep component (type: hands)**
  - Renders: instruction text + two large tap zones (left = Layer A, right = Layer B)
  - Left zone: Layer A color, labeled "3"
  - Right zone: Layer B color, labeled "2"
  - Each tap: zone pulses (scale 1.0 -> 1.1 -> 1.0 over 150ms), optional haptic via `expo-haptics`
  - Audio plays both layers as guide
  - "Done" button to mark step complete (no accuracy gating)
  - **AC:** Both tap zones respond to taps with visual feedback. Audio plays. User can proceed via Done button.

- [ ] **Task 3.7: Build DisappearingStep component (type: disappearing)**
  - Renders: instruction text, then launches DisappearingBeat mode as an **embedded component** (not full-screen navigation)
  - Pre-configured: ratio from lesson data, Layer A disappears, 8 bars per stage, 1 return cycle
  - On DisappearingBeat completion: displays drift feedback briefly (3 seconds), then auto-marks step as done
  - **AC:** Disappearing Beat runs inline within the lesson. On completion, drift feedback shows and step is marked done.

---

## 4. 3:2 Lesson Data

**Important:** Create minimal lesson JSON stub (3:2, just step titles and types) FIRST,
before building step components. Full content populates the JSON after components exist.

- [ ] **Task 4.1: Author 3:2 lesson JSON file**
  - Create `data/lessons/3-2.json` with all 7 steps as defined in the spec
  - Start with a minimal stub (step titles and types only) to unblock component development
  - Then populate each step with: stepNumber, type, title, instruction, secondaryText, audioConfig, interactionType, interactionConfig, extensionSlot (where applicable)
  - Validate against `LessonData` type
  - **AC:** JSON file parses correctly and passes type validation. All 7 steps present with correct content matching the spec.

- [ ] **Task 4.2: Author 4:3 lesson JSON file (stub or full)**
  - Create `data/lessons/4-3.json` — at minimum a stub with placeholder content for all 7 steps
  - If time permits, write full 4:3-specific content (different mnemonic: "PASS THE GOD DAMN BUT-TER" or similar, different music references)
  - **AC:** File exists and is loadable. Lesson engine can run through it without errors.

---

## 5. Lesson Completion Flow

- [ ] **Task 5.1: Build LessonComplete screen/component**
  - Triggered when `isLessonComplete` becomes true
  - Displays:
    - Celebration animation (confetti burst or radial particle effect using `react-native-reanimated`)
    - "You've completed the [ratio] Feel Lesson!" text
    - Feel badge icon (a distinct visual per polyrhythm, e.g., a styled emblem)
  - **AC:** Completion screen renders with animation and correct polyrhythm name.

- [ ] **Task 5.2: Implement feel state self-report prompt**
  - After celebration, display prompt: "How does [ratio] feel right now?"
  - Three tappable options:
    - "Still mechanical" -> state: `executing`
    - "I could hear it" -> state: `hearing`
    - "I felt it in my body" -> state: `feeling`
  - One tap saves to `lessonStore.feelStateReports` with timestamp and polyrhythm ID
  - Dismissible (skip = no state recorded)
  - **AC:** Tapping an option saves the correct feel state. Dismissing skips without error.

- [ ] **Task 5.3: Award feel badge and update lessonStore**
  - On lesson completion: `lessonStore.completedLessons.add(polyrhythmId)`
  - Award badge: `lessonStore.badges[polyrhythmId] = 'feel-lesson-complete'`
  - Mark all steps as completed in `lessonStore.lessonProgress[polyrhythmId]`
  - **AC:** After completion, badge appears on the Learn tab's polyrhythm library card. `lessonStore` persists across app restarts.

- [ ] **Task 5.4: Implement post-completion navigation**
  - "Back to Library" button: navigates to Learn tab polyrhythm grid
  - "Practice [ratio]" button: navigates to Core Player with the lesson's ratio pre-selected in `audioStore`
  - **AC:** Both buttons navigate to the correct screens with correct state.

---

## 6. lessonStore Integration

- [ ] **Task 6.1: Wire up lessonStore from canonical data layer**
  - Lesson store uses the canonical shape from `data-layer/spec.md`:
    `progressByPolyrhythm: Record<string, LessonProgress>` with actions from the data layer.
  - Do NOT create a separate store shape.
  - Actions from canonical store: `startLesson`, `advanceStep`, `completeLesson`, `awardFeelBadge`
  - Persistence: handled by data layer (Zustand persist middleware with AsyncStorage)
  - **AC:** Store initializes correctly using canonical types. State persists across app restarts. All actions update state as expected.

---

## 7. Extension Point Placeholders

- [ ] **Task 7.1: Add extension slot renderer**
  - Generic component that renders a disabled/placeholder button for any `extensionSlot` defined in a step
  - Shows the slot's `label` text
  - On tap: shows tooltip with slot's `description` + "Coming soon"
  - Used by ContextStep (real-music-context), MnemonicStep (ai-mnemonic-generator), SingStep (ai-vocal-coach)
  - **AC:** Extension slot buttons render in the correct steps. Tapping shows the "Coming soon" message.

---

## 8. Error Handling

- [ ] **Task 8.1: Error Handling**
  - Handle lesson load failure (retry UI: "Couldn't load lesson. Tap to retry.")
  - Handle audio failure during steps (graceful degradation: "Audio unavailable" banner, allow step completion without audio)
  - Handle AsyncStorage write failure (silent retry, log error, do not block user progression)

---

## 9. Accessibility

- [ ] **Task 9.1: Accessibility**
  - Screen reader labels for all interactive elements
  - Announce step transitions
  - Reduced motion: replace animations with opacity transitions
  - Ensure tap zone meets minimum 44x44pt touch target

---

## Dependency Notes

- Tasks 3.2, 3.4, 3.5, 3.6 depend on `audioStore` being functional (audio playback, layer control).
- Task 3.7 depends on the Disappearing Beat feature being implemented (or at least its core engine being available as an embeddable component).
- Task 5.3 depends on the Learn tab's polyrhythm library UI being able to display badges from `lessonStore`.
- All step components reuse the `RadialVisualizer` from the Core Player feature.
