# Onboarding — Feature Spec

First-launch flow that sets up the user profile and determines app configuration.

**Consumes:** userStore, babyStore, Supabase auth
**Writes to:** userStore (profile, onboarding status), babyStore (baby profile)

---

## Entry Condition

- App launches with `userStore.isOnboarded === false`
- Root layout checks this flag and renders onboarding flow instead of tab navigator
- After completion, `isOnboarded` is set to `true` and tab navigator renders

---

## Screen 1 — "What do you want to feel?"

**Purpose:** Select polyrhythms of interest. Seeds the Learn tab content.

- Multi-select grid of polyrhythm ratio cards
- Available (selectable): 3:2, 4:3
- Coming soon (shown with "Coming soon" badge, not selectable): 2:3, 5:4, 7:8, etc.
- Minimum selection: 1 rhythm from the available set
- Each card shows: ratio name, short cultural tag (e.g., "Afro-Cuban clave"), visual preview (static radial dot pattern)
- At least one must be selected to enable "Next" button
- Writes to: `userStore.profile.selectedRhythms: string[]`

---

## Screen 2a — "How's your rhythm experience?"

**Purpose:** Lightweight skill assessment that calibrates the initial experience.

- Three tappable option cards (single select):
  - "What's a polyrhythm?" --> beginner (default BPM: 60, suggested start: 3:2 lesson)
  - "I've heard of them" --> intermediate (default BPM: 80, suggested start: 3:2 lesson)
  - "I can play some" --> advanced (default BPM: 100, suggested start: free play)
- Selection required to proceed
- Writes to: `userStore.profile.rhythmLevel: 'beginner' | 'intermediate' | 'advanced'`
- This affects: default BPM on core player, suggested first action on Learn tab.

---

## Screen 2b — "Who are you?"

**Purpose:** Determines role, which controls tab visibility and experience.

- Single select, three options as large tappable cards:
  - **Musician** — "I want to master rhythmic feel"
  - **Parent** — "I want to do rhythm activities with my baby"
  - **Both** — "I'm a musician and a parent"
- Selection required to proceed
- Writes to: `userStore.profile.role: 'musician' | 'parent' | 'both'`
- Effect: if `role === 'musician'`, baby mode tab is hidden in tab navigator

---

## Screen 3 — "What music do you love?"

**Purpose:** Seeds AI song recommendations (P2). Low-friction, skippable.

- Multi-select genre chips in a flex-wrap layout
- Genres: Jazz, Classical, Afro-Cuban, Hip-Hop, Rock, West African, Latin, Electronic, Other
- "Other" opens a small text input for custom genre
  - "Other" text input: max 30 characters, trimmed, empty string treated as if "Other" was not selected.
- Skip button in top-right (defaults to empty array)
- Writes to: `userStore.profile.genrePreferences: string[]`

---

## Screen 4 — "Tell us about your little one"

**Conditional:** Only shown if Screen 2b answer is `'parent'` or `'both'`.

- Birth date: REQUIRED, NO default value. Picker starts at "Select date" placeholder.
  User must actively choose a date. This prevents incorrect stage assignments from unintentional defaults.
- Baby name: Optional. If skipped, defaults to "Baby" (not null/empty string).
- Skip button: Skips name only, date is still required if Screen 4 is shown.
- Below date picker: auto-calculated stage display: "Stage 2: Pat-a-Cake Mode (6-12 months)"
- "You can change this anytime in Settings"
- Writes to: `babyStore.babyProfile: BabyProfile`
  - Computes `currentStage` from birth date
  - `stageOverride: null`

---

## Navigation

- Swipe gesture (left/right) or Next/Back buttons at bottom
- Progress dots at top (4 or 5 dots depending on whether Screen 4 is shown)
- Back button hidden on Screen 1
- Next button disabled until required selection is made (Screens 1, 2a, 2b, 4)
- Skip available on Screen 3 and Screen 4 (baby name only -- date is required on Screen 4)

---

## Final Action — "Let's groove!"

After last screen, a CTA button triggers:

1. `supabase.auth.signInAnonymously()` — creates anonymous Supabase user
2. `userStore.setProfile(collectedData)` — writes all collected data to user store
3. `userStore.completeOnboarding()` — sets `isOnboarded = true`
4. If baby profile collected: `babyStore.setBabyProfile(babyData)`
5. Sync queue: queues user profile for Supabase sync
6. Navigate to main tab navigator (Learn tab as initial)

---

## Crash/Kill Recovery

On app launch, before showing onboarding:
1. Check if an anonymous auth session already exists (`supabase.auth.getSession()`)
2. If session exists but `isOnboarded` is false --> resume onboarding from last completed screen
3. Store partial progress in AsyncStorage: `@groovecore/onboarding-progress: { lastScreen: number, data: {...} }`
4. On completion, clear the progress key

This prevents duplicate anonymous accounts on kill-during-onboarding.

---

## Re-entry from Settings

- Settings screen has "Edit Profile" option
- Opens the same 4 screens but in "edit mode":
  - Pre-populated with current values
  - No auth trigger (already signed in)
  - Save button instead of "Let's groove!"
  - Updates existing profile data in stores

---

## Onboarding Data Usage at MVP

- `selectedRhythms`: Determines which ratio is pre-selected on the core player screen
- `rhythmLevel`: Sets default BPM and suggested first action
- `genrePreferences`: Stored for Phase 2 (AI song recommender). Shown as "We'll use this later to personalize your experience."
- `userType`: Determines whether Baby Mode tab is visible

---

## UI Details

- Background: gradient from `primaryDark` to `background`
- Cards: `surface` background with `border` stroke
- Selected state: `primary` border + subtle glow
- Progress dots: `textMuted` (inactive), `primary` (active), `success` (completed)
- Typography: titles in `2xl` `bold`, descriptions in `md` `regular`
- Animations: cards fade in with stagger on screen entry (react-native-reanimated)

---

## First-Time Feature Discovery

When Baby Mode tab becomes visible for the first time (user type changed to 'parent' or 'both'):
- Show a brief tooltip overlay: "New! Baby Mode -- rhythm activities for your little one"
- On first tap into Baby Mode: show a 2-screen mini-onboarding explaining stages and activities

---

## Extension Points

- Screen 3 genre list: easily extendable for new genres
- Screen 4: slot for additional baby profile fields post-MVP (e.g., musical exposure history)
- Post-onboarding: hook for triggering first-time tutorial overlays on main screens
