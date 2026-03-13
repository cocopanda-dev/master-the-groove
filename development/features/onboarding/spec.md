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
- Available (selectable): 3:2, 4:3, 2:3
- Coming soon (grayed, not selectable): 5:4, 7:8, etc.
- Each card shows: ratio name, short cultural tag (e.g., "Afro-Cuban clave"), visual preview (static radial dot pattern)
- At least one must be selected to enable "Next" button
- Writes to: `userStore.profile.selectedRhythms: string[]`

---

## Screen 2 — "Who are you?"

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
- Skip button in top-right (defaults to empty array)
- Writes to: `userStore.profile.genrePreferences: string[]`

---

## Screen 4 — "Tell us about your little one"

**Conditional:** Only shown if Screen 2 answer is `'parent'` or `'both'`.

- Baby name input (optional, placeholder: "Your baby's name")
- Birth date picker (required) — native date picker, defaults to today minus 6 months
- Below date picker: auto-calculated stage display: "Stage 2: Pat-a-Cake Mode (6-12 months)"
- "You can change this anytime in Settings"
- Writes to: `babyStore.babyProfile: BabyProfile`
  - Computes `currentStage` from birth date
  - `stageOverride: false`

---

## Navigation

- Swipe gesture (left/right) or Next/Back buttons at bottom
- Progress dots at top (3 or 4 dots depending on whether Screen 4 is shown)
- Back button hidden on Screen 1
- Next button disabled until required selection is made (Screens 1, 2, 4)
- Skip available on Screen 3 and Screen 4 (baby name only — date is required on Screen 4)

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

## Re-entry from Settings

- Settings screen has "Edit Profile" option
- Opens the same 4 screens but in "edit mode":
  - Pre-populated with current values
  - No auth trigger (already signed in)
  - Save button instead of "Let's groove!"
  - Updates existing profile data in stores

---

## UI Details

- Background: gradient from `primaryDark` to `background`
- Cards: `surface` background with `border` stroke
- Selected state: `primary` border + subtle glow
- Progress dots: `textMuted` (inactive), `primary` (active), `success` (completed)
- Typography: titles in `2xl` `bold`, descriptions in `md` `regular`
- Animations: cards fade in with stagger on screen entry (react-native-reanimated)

---

## Extension Points

- Screen 3 genre list: easily extendable for new genres
- Screen 4: slot for additional baby profile fields post-MVP (e.g., musical exposure history)
- Post-onboarding: hook for triggering first-time tutorial overlays on main screens
