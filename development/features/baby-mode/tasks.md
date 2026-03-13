# Baby Mode — Implementation Tasks

Feature: Baby & Toddler Mode
Spec: `development/features/baby-mode/spec.md`
Priority: P0 (MVP)

---

## 1. Baby Store & Profile

- [ ] **Task 1.1: Create babyStore (Zustand)**
  - State shape:
    ```
    babyProfile: {
      name: string | null,
      birthDate: string | null,     // ISO date
      stageOverride: number | null  // manual stage override
    } | null
    sessions: BabySession[]
    ```
  - Actions: `setBabyProfile`, `updateBabyProfile`, `addSession`, `getSessions`, `clearSessions`
  - Computed: `getCurrentStage()` — calculates from birth date or returns override
  - Persistence: Zustand persist middleware with AsyncStorage
  - **AC:** Store initializes, persists across restarts. `getCurrentStage()` returns correct stage for various birth dates.

- [ ] **Task 1.2: Implement age-to-stage mapping utility**
  - Function: `ageToStage(birthDate: string): number`
  - Returns stage 1 (3–6mo), stage 2 (6–12mo), stage 3 (12–18mo)
  - Returns 0 for <3 months, 3 for >18 months (MVP ceiling)
  - Handles edge cases: future dates, null input
  - **AC:** Unit tests pass for ages at each boundary (3mo, 6mo, 12mo, 18mo) and edge cases.

- [ ] **Task 1.3: Create BabySession TypeScript interface**
  - Define `BabySession` type as specified in spec
  - Export from shared types file
  - **AC:** Type compiles, matches all fields in the spec.

---

## 2. Stage System

- [ ] **Task 2.1: Build stage-based content filtering**
  - Function: `getActivitiesForStage(stageId: number): BabyActivityCard[]`
  - Loads activity cards from JSON data files, filters by `stageId`
  - Returns empty array for unsupported stages with a console warning
  - **AC:** Returns correct cards for stages 1, 2, and 3. Returns empty for stage 0.

- [ ] **Task 2.2: Implement manual stage override**
  - In baby settings: a picker or segmented control to override the auto-calculated stage
  - Writes to `babyStore.babyProfile.stageOverride`
  - When override is set, `getCurrentStage()` returns the override instead of the calculated value
  - Clear override option to revert to auto-calculation
  - **AC:** Manual override changes the stage used across all baby mode screens. Clearing it reverts to auto-calculation.

---

## 3. Baby Mode Home Screen

- [ ] **Task 3.1: Create BabyModeHomeScreen component**
  - Route: Baby Mode tab root screen
  - Renders: stage banner, "Today's Activity" card, activity card stack, quick launch buttons, session log shortcut
  - Applies warm UI theme on focus
  - If no baby profile: redirects to profile setup (onboarding screen 4 or dedicated baby setup flow)
  - **AC:** Screen renders with all sections populated. Baby name, age, and stage display correctly.

- [ ] **Task 3.2: Build stage banner component**
  - Displays: "Stage [N]: [Mode Name]" (e.g., "Stage 2: Pat-a-Cake Mode")
  - Below: "[Baby Name], [Age in months] months" (e.g., "Luna, 8 months")
  - Warm background color, rounded corners, baby palette
  - **AC:** Banner displays correct stage, mode name, baby name, and age. Updates when profile changes.

- [ ] **Task 3.3: Build "Today's Activity" featured card**
  - Selects one activity card from the current stage's cards
  - MVP selection logic: random selection from available cards, or cycle through them daily (use date as seed)
  - Rendered as a larger card at the top of the activity area
  - Tapping opens the activity detail/execution view
  - P2 extension slot: placeholder for AI-generated activity (hidden at MVP or shown as a "Coming soon" label)
  - **AC:** Featured card shows a valid activity for the current stage. Tapping navigates to the activity.

- [ ] **Task 3.4: Build activity card stack (carousel)**
  - Horizontally swipeable card carousel showing all activities for the current stage
  - Each card: rounded rectangle, warm background, large text (min 18px), duration indicator
  - Page indicators (dots) below the carousel
  - Tapping a card opens the activity detail view
  - **AC:** Carousel renders all cards for the stage. Swiping works smoothly. Tapping opens the correct activity.

- [ ] **Task 3.5: Build quick launch buttons**
  - Two prominent buttons: "Duet Tap" and "Baby Visualizer"
  - Styled with baby palette, large size, friendly rounded shapes
  - Navigate to respective screens on tap
  - **AC:** Buttons render with correct labels and icons. Navigation works.

---

## 4. Activity Cards Data

- [ ] **Task 4.1: Author activity card JSON data files**
  - Create `data/baby/stage-1.json`, `data/baby/stage-2.json`, `data/baby/stage-3.json`
  - Each file: array of `BabyActivityCard` objects (5 cards per stage as specified in the spec)
  - Include all fields: id, stageId, title, instruction, durationSeconds, optional audioConfig
  - **AC:** All 15 activity cards (5 per stage) are authored with clear, simple instructions. JSON validates against the `BabyActivityCard` type.

- [ ] **Task 4.2: Build activity detail/execution view**
  - Full-screen view showing the activity's instruction in large text
  - "Start" button that begins a timer and optional audio playback (if the card has `audioConfig`)
  - Timer counts up showing elapsed time, with a suggested duration indicator
  - "Done" button ends the activity and triggers the session log prompt
  - **AC:** Activity detail renders instruction. Timer works. Audio plays if configured. "Done" ends the activity and triggers the response prompt.

---

## 5. Duet Tap Screen

- [ ] **Task 5.1: Build DuetTapScreen component**
  - Split screen layout: two large tap zones side by side
  - Left zone: parent color (`tokens.baby.colorParent`), labeled "You"
  - Right zone: baby color (`tokens.baby.colorBaby`), labeled baby's name or "Baby"
  - Minimum 80px tap targets, each fills roughly half the screen width
  - Small "X" close button in top corner
  - BPM stepper at top center (range 60–100, default 80, step 5)
  - Screen stays awake (`expo-keep-awake`)
  - **AC:** Both tap zones render at correct sizes and colors. Close button exits the screen. BPM stepper adjusts the background beat.

- [ ] **Task 5.2: Implement tap sounds and ripple animation**
  - Parent zone tap: plays soft chime sound
  - Baby zone tap: plays soft bell sound
  - Each tap triggers a ripple animation from the tap point: concentric circles expanding outward and fading over 400ms
  - Optional haptic feedback on tap (`expo-haptics`, gentle impact)
  - **AC:** Each zone plays its distinct sound on tap. Ripple animates from the correct position. Haptic fires.

- [ ] **Task 5.3: Implement celebration burst**
  - When both zones are tapped within 200ms of each other:
    - Particle/star burst animation plays, centered between the two zones
    - Brief celebratory sound (sparkle or chord)
  - Detection: track last tap timestamp per zone; on each tap, check if the other zone was tapped within 200ms
  - Animation: use `react-native-reanimated` for particle positions and opacity
  - **AC:** Near-simultaneous taps trigger the burst. Single-zone taps do not. The 200ms window feels natural.

- [ ] **Task 5.4: Implement background beat for Duet Tap**
  - Optional steady pulse at the configured BPM
  - Sound: soft tick or woodblock from the baby sound set
  - Starts when the screen opens, adjustable via BPM stepper
  - Can be muted (BPM stepper set to "Off" or a mute toggle)
  - **AC:** Background beat plays at the correct BPM. Adjusting BPM changes the tempo in real time. Muting silences it.

- [ ] **Task 5.5: Implement auto-session tracking for Duet Tap**
  - Record start time on screen mount
  - Record end time on screen exit (close button, back navigation, or app backgrounding)
  - Calculate duration
  - Pass to the session log prompt
  - **AC:** Duration is accurately tracked. Navigating away ends the session.

---

## 6. Baby Visualizer

- [ ] **Task 6.1: Build BabyVisualizerScreen component**
  - Full-screen view with warm background color
  - Small "X" close button in top corner (positioned outside baby's typical tap area)
  - No other visible controls
  - Screen stays awake
  - **AC:** Full-screen renders with warm background. Close button exits the screen.

- [ ] **Task 6.2: Implement geometric shape rendering**
  - Render 3–5 large geometric shapes (circles, stars, squares, triangles) positioned semi-randomly on screen (non-overlapping)
  - Use `react-native-skia` or `react-native-reanimated` for rendering
  - Shapes use colors from `tokens.baby.visualizerColors`
  - **AC:** Shapes render at varying positions and sizes. No overlapping. Colors are from the baby palette.

- [ ] **Task 6.3: Implement beat-synced shape animation**
  - On each beat: all shapes scale up (1.0 -> 1.3x) with ease-out, then return to 1.0x
  - Beat driven by a simple interval timer at the configured BPM (default 70)
  - Soft audio tone (marimba or xylophone) plays on each beat
  - Between beats: shapes gently float/drift with slow, smooth random motion
  - **AC:** Shapes visibly pulse on beat with accompanying sound. Motion between beats is smooth and gentle.

- [ ] **Task 6.4: Implement color cycling**
  - Shapes slowly cycle through the baby visualizer color palette over time
  - Transition: each shape changes color over 4–8 seconds, staggered so they don't all change at once
  - Background color remains constant (warm cream)
  - **AC:** Colors shift gradually. No abrupt changes. Visual is calming and engaging.

- [ ] **Task 6.5: Implement BPM control via hidden gesture**
  - Two-finger swipe up/down adjusts BPM (range 60–80, step 5)
  - Brief BPM indicator text appears on adjustment, fades after 2 seconds
  - Single-finger taps (baby interaction) do not trigger BPM change
  - **AC:** Two-finger swipe adjusts BPM. Single taps are ignored for BPM. Indicator shows briefly.

---

## 7. Session Log

- [ ] **Task 7.1: Build post-activity response prompt**
  - Bottom sheet or modal that appears after any baby activity ends
  - Text: "How did [baby name] respond?"
  - Three large tappable option cards:
    - Calm — serene illustration, soft color
    - Excited — energetic illustration, bright color
    - Disengaged — sleepy illustration, muted color
  - Tapping saves the response to the session record and dismisses
  - Dismissible without selection (swipe down or tap outside)
  - **AC:** Prompt appears after activities end. Each option saves correctly. Dismissing without selection records null.

- [ ] **Task 7.2: Build session history view**
  - Route: accessible from Baby Mode home screen "View Sessions" link
  - Chronological list grouped by day
  - Each entry: activity type icon, activity name/type, duration, baby response icon, timestamp
  - Summary at top: "This week: X sessions, Y minutes"
  - Pull to refresh (placeholder for future Supabase sync)
  - **AC:** Session history renders all logged sessions grouped correctly. Summary calculates accurately.

- [ ] **Task 7.3: Integrate session logging across all activities**
  - After Duet Tap exit: create session record (type: 'duet-tap', auto-tracked duration), show response prompt
  - After Baby Visualizer exit: create session record (type: 'visualizer', auto-tracked duration), show response prompt
  - After activity card completion: create session record (type: 'activity-card', activityId, auto-tracked duration), show response prompt
  - Save completed record to `babyStore.sessions`
  - **AC:** All three activity types correctly log sessions with accurate durations and responses.

---

## 8. Warm UI Theme

- [ ] **Task 8.1: Define baby mode design tokens**
  - Create a baby token set (or token overrides) with:
    - Background colors (warm cream, soft peach)
    - Card background, accent color, text color
    - Parent and baby zone colors
    - Visualizer color palette
    - Increased border radius values
    - Increased base font size
  - Export as a theme object compatible with the app's theme system
  - **AC:** Token values match the spec. Theme object is importable and usable by components.

- [ ] **Task 8.2: Implement theme switching on Baby Mode tab**
  - When Baby Mode tab becomes active: apply baby token overrides
  - When leaving Baby Mode tab: revert to default tokens
  - Use a `ThemeProvider` context or conditional token resolution
  - Background color transition: animated over 200ms for smooth switching
  - Tab bar tint changes to baby accent color
  - **AC:** Entering Baby Mode tab visibly changes the theme. Leaving reverts it. Transition is smooth.

---

## 9. Tab Visibility

- [ ] **Task 9.1: Conditionally show/hide Baby Mode tab**
  - Read `userStore.profile.role` on app launch
  - If role is "musician" (not "parent" or "both"): hide the Baby Mode tab from the tab bar
  - If role is "parent" or "both": show the Baby Mode tab
  - Role can be changed in Settings -> Edit Profile, which should update tab visibility dynamically
  - **AC:** Musician-only users do not see the Baby Mode tab. Parents/both see it. Changing role in settings updates the tab bar.

---

## 10. Extension Point Placeholders

- [ ] **Task 10.1: Add AI activity generator placeholder**
  - On the "Today's Activity" card area, reserve a slot for the AI-generated activity
  - MVP: hidden or shows a subtle "AI activities coming soon" note below the curated card
  - P2: replaces or supplements the curated card with Claude-generated content
  - **AC:** Placeholder exists in the UI without disrupting the MVP experience.

- [ ] **Task 10.2: Add stage 4-5 content placeholder**
  - When a baby's age exceeds 18 months: show Stage 3 content with a banner: "More stages coming soon! Stage 3 activities are still great for [baby name]."
  - Stage data loader should gracefully handle requests for stages 4 and 5 (return empty with a message, not crash)
  - **AC:** Babies older than 18 months see Stage 3 content with a "coming soon" message. No errors.

---

## Dependency Notes

- Task 5.2 and 6.3 require baby-specific audio samples (chime, bell, marimba/xylophone). These need to be sourced/created and added to the sound asset pipeline.
- Task 8.2 depends on the app having a theme system or `ThemeProvider` that supports dynamic token switching.
- Task 9.1 depends on `userStore.profile.role` being set during onboarding.
- Tasks 5.1–5.5 and 6.1–6.5 can be built independently of the home screen (tasks 3.x).
