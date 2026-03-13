# Feel Lessons — Feature Spec

The structured lesson system that teaches HOW to feel a polyrhythm — not just how to execute it. This is GrooveCore's core pedagogical differentiator. Lessons guide learners through a progressive sequence: hear it in context, understand its shape, learn a mnemonic, sing it, move with it, play it with both hands, and finally internalize it via the Disappearing Beat challenge.

---

## Lesson Engine

### Architecture
- **Generic, data-driven step engine** — lessons are defined as JSON data arrays of `LessonStep` objects
- The engine is **polyrhythm-agnostic** — it knows nothing about 3:2 or 4:3 specifically; all content comes from data files
- Adding a new polyrhythm lesson means adding a new JSON file — zero engine changes required

### LessonStep Schema

```typescript
interface LessonStep {
  stepNumber: number;           // 1-indexed
  type: StepType;               // 'context' | 'shape' | 'mnemonic' | 'sing' | 'body' | 'hands' | 'disappearing'
  title: string;                // Display title (e.g., "Hear It In Music")
  instruction: string;          // Primary instruction text shown to the user
  secondaryText?: string;       // Optional supporting text or quote
  audioConfig?: {               // Optional audio configuration for steps that play audio
    layers: 'A' | 'B' | 'both';
    bpm: number;
    ratioA: number;
    ratioB: number;
    soundA: SoundType;
    soundB: SoundType;
  };
  interactionType?: string;     // Optional: 'tap-zones' | 'timer' | 'visualizer-view' | 'disappearing-inline'
  interactionConfig?: Record<string, any>;  // Type-specific config (e.g., timer duration, tap zone layout)
  extensionSlot?: {             // Optional: defines a future feature placeholder
    id: string;
    label: string;
    description: string;
  };
}

type StepType = 'context' | 'shape' | 'mnemonic' | 'sing' | 'body' | 'hands' | 'disappearing';
```

### Engine Responsibilities
- Manages current step index (0-based internally, displayed 1-based)
- Handles step completion logic: some steps complete via "Next" button, others via interaction completion (e.g., timer ends, disappearing beat finishes)
- Forward/back navigation with boundary checks
- Lesson completion detection (all steps visited and marked done)
- Exposes: `currentStep`, `totalSteps`, `goNext()`, `goBack()`, `markStepDone()`, `isLessonComplete`
- Does NOT own audio state — delegates to `audioStore` via `audioConfig`

---

## 3:2 Lesson Content (MVP)

### Step 1 — "Hear It In Music" (type: context)

**Instruction text:**
"3:2 is one of the most universal rhythms in music. You already know it — you just might not have named it yet."

**Secondary text:**
"Listen to 'Afro Blue' by Mongo Santamaria — the bass pattern is the 2, and the melody rides the 3. You can also hear it in any Chopin Nocturne — the left hand plays 2 while the right hand plays 3."

**No embedded audio at MVP** — text only with suggestions to open Spotify/YouTube externally.

**Extension slot:** `real-music-context` — "Hear examples" button placeholder for embedded audio clips (P1).

---

### Step 2 — "Feel The Shape" (type: shape)

**Instruction text:**
"3:2 has a gentle lean — like a sway. The 3 pulls forward while the 2 holds steady underneath."

**Interaction:** Display the radial visualizer in **view-only mode** showing the 3:2 pattern. The visualizer auto-plays at a comfortable tempo (72 BPM) so the user can watch and absorb the shape. No user controls — just observation.

**Audio config:** Both layers at moderate volume, default sounds, 72 BPM.

---

### Step 3 — "Learn The Mnemonic" (type: mnemonic)

**Instruction text:**
"A mnemonic maps the rhythm to syllables you can say out loud. For 3:2, a classic one is:"

**Display:** Large text: **"NOT DIF-FI-CULT"**

**Visual:** Syllables displayed on a horizontal timeline showing which syllables align with Layer A beats and which align with Layer B beats:
- "NOT" — Layer A beat 1 + Layer B beat 1 (shared downbeat)
- "DIF" — Layer A beat 2
- "FI" — Layer B beat 2
- "CULT" — Layer A beat 3

Static display at MVP.

**Extension slot:** `ai-mnemonic-generator` — "Generate mine" button placeholder for AI-generated custom mnemonics based on user preferences (P2).

---

### Step 4 — "Sing The 3" (type: sing)

**Instruction text:**
"Now the player will play the 2. Your job: sing or hum the 3. Say 'tri-po-let, tri-po-let' out loud with the beat."

**Audio config:** Layer B only (the 2), moderate volume, 68 BPM (slightly slower for learning).

**Interaction:** No mic detection at MVP — user self-validates. A "I did it" / "Next" button to proceed.

**Extension slot:** `ai-vocal-coach` — mic input overlay for AI-powered vocal timing feedback (P1).

---

### Step 5 — "Walk + Clap" (type: body)

**Instruction text:**
"Stand up. Walk in 2 — left, right, left, right. Clap in 3 — clap on every third step-subdivision. Let your body do the math."

**Audio config:** Both layers playing as a guide, 66 BPM.

**Interaction:** Timer — 60 seconds countdown displayed on screen. Audio plays for the duration. No tracking of user movement — purely guided exercise.

**On timer complete:** "Great work! How did that feel?" prompt (soft, no scoring).

---

### Step 6 — "Both Hands" (type: hands)

**Instruction text:**
"Two tap zones below. Left hand taps Layer A (the 3), right hand taps Layer B (the 2). Follow along with the audio."

**Audio config:** Both layers, 70 BPM.

**Interaction:** Two large tap zones on screen (styled like the Duet Tap in Baby Mode but with adult styling):
- Left zone: Layer A color, label "3"
- Right zone: Layer B color, label "2"
- Each tap: zone pulses (scale animation), optional haptic feedback
- Audio plays both layers as a guide; tap zones are for practice, not scored

**No accuracy tracking at MVP** — user self-assesses.

---

### Step 7 — "Disappearing Beat Challenge" (type: disappearing)

**Instruction text:**
"Time to test your feel. The 3 will start to disappear. Can you hold it inside?"

**Interaction:** Launches **Disappearing Beat mode inline** within the lesson flow:
- Pre-configured: 3:2, Layer A disappears, 8 bars per stage, 1 return cycle
- Uses the same Disappearing Beat engine and UI (rendered as an embedded component, not a full navigation)
- On completion, drift feedback displays briefly, then transitions to the lesson completion screen

---

## Step UI

### Layout (per step)
- **Top:** Progress bar showing steps 1–7 with current step highlighted. Completed steps show a checkmark.
- **Below progress:** Step number and title (e.g., "Step 3: Learn The Mnemonic")
- **Instruction area:** Primary instruction text, left-aligned, readable font size (min 16px)
- **Content area:** Step-type-specific content (visualizer, tap zones, timer, mnemonic display, etc.)
- **Bottom:** Navigation buttons
  - "Back" (left) — disabled on step 1
  - "Next" or "Mark as Done" (right) — some steps require interaction before enabling (e.g., timer must complete, disappearing beat must finish)

### Navigation
- Swipe left/right between steps OR use Next/Back buttons
- Steps can be revisited freely (back navigation always allowed)
- Forward navigation: allowed if step is marked done OR if step type is purely informational (context, shape, mnemonic)
- Interactive steps (sing, body, hands, disappearing) require explicit "Done" / completion before the Next button enables

---

## Lesson Completion

When all 7 steps are marked done:

1. **Completion screen** displays:
   - Celebration animation (confetti or subtle radial burst)
   - "You've completed the 3:2 Feel Lesson!"
   - Feel badge icon (unique per polyrhythm)

2. **Feel state self-report prompt:**
   - "How does 3:2 feel right now?"
   - Three options: "Still mechanical" (executing), "I could hear it" (hearing), "I felt it in my body" (feeling)
   - One tap, saved to `lessonStore`

3. **Badge awarded:**
   - `lessonStore.awardFeelBadge('3-2')` — uses canonical action from data-layer spec
   - Badge visible on the Learn tab's polyrhythm library card for 3:2

4. **Navigation:**
   - "Back to Library" button returns to Learn tab polyrhythm grid
   - "Practice 3:2" button navigates to Core Player with 3:2 pre-selected

---

## State

### Consumed
- `audioStore` — for steps 2, 4, 5, 6, 7 (audio playback and visualizer)
- `lessonStore` — for progress restoration (which steps are complete, which lessons are done)

### Written
- `lessonStore.progressByPolyrhythm[polyrhythmId]` — `LessonProgress` record (currentStep, completed, feelBadgeEarned)
- Actions used: `startLesson(polyrhythmId)`, `advanceStep(polyrhythmId)`, `completeLesson(polyrhythmId)`, `awardFeelBadge(polyrhythmId)`
- Feel state self-report: saved via `sessionStore.endSession(feelStateAfter)` (the lesson creates a session)

---

## Extension Points

### Step 1: Embedded Audio Clips (P1)
- Slot ID: `real-music-context`
- When implemented: "Hear examples" button opens a mini-player with curated clips from the Real Music Context library
- MVP: button placeholder with "Coming soon" tooltip or hidden entirely

### Step 3: AI Mnemonic Generator (P2)
- Slot ID: `ai-mnemonic-generator`
- When implemented: "Generate mine" button sends user preferences to Claude API, returns custom mnemonic options
- MVP: button placeholder with "Coming soon" tooltip or hidden entirely

### Step 4: AI Vocal Coach (P1)
- Slot ID: `ai-vocal-coach`
- When implemented: mic input overlay records user singing, runs onset detection, sends timing data to Claude for coaching feedback
- MVP: no mic input, user self-validates

### Lesson Data Loader
- Designed so adding a 4:3 lesson is just adding a new JSON file at `data/lessons/4-3.json`
- The lesson engine loads the file, the step UI renders it — no new components needed unless a new step type is introduced
- 4:3 lesson data is a follow-up task after 3:2 is validated

---

## File Structure (Suggested)

```
src/
  features/
    lessons/
      LessonEngine.ts          # Step management logic
      LessonScreen.tsx          # Top-level lesson screen with navigation
      steps/
        ContextStep.tsx         # Type: context
        ShapeStep.tsx           # Type: shape
        MnemonicStep.tsx        # Type: mnemonic
        SingStep.tsx            # Type: sing
        BodyStep.tsx            # Type: body
        HandsStep.tsx           # Type: hands
        DisappearingStep.tsx    # Type: disappearing
      LessonComplete.tsx        # Completion screen
  data/
    lessons/
      3-2.json                  # 3:2 lesson content
      4-3.json                  # 4:3 lesson content (post-MVP or late MVP)
```
