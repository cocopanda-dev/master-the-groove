# Onboarding — Tasks

**Read before starting:** `features/onboarding/spec.md`, `contracts/data-models.md`, `contracts/design-tokens.md`, `contracts/coding-conventions.md`

---

- [ ] **Task 1: Create onboarding screen shell and navigation**
  Create onboarding flow as a stack navigator (or screen group) in Expo Router. Root layout checks `userStore.isOnboarded` — if false, render onboarding group instead of tabs. Implement swipe + Next/Back navigation between screens. Progress dots component at top. Acceptance: can swipe through 5 empty screens (or 4 if musician) with working progress dots and back/next buttons.

- [ ] **Task 2: Build Screen 1 — "What do you want to feel?"**
  Multi-select grid of polyrhythm cards. Available (selectable): 3:2, 4:3. Coming soon (shown with "Coming soon" badge, not selectable): 2:3, 5:4, 7:8, etc. Each card shows ratio name and short cultural tag. Selected state: primary border. Next button disabled until at least one selected. Acceptance: can select/deselect multiple rhythms, Next only enables with selection.

- [ ] **Task 2b: Build Screen 2a — "How's your rhythm experience?"**
  Three tappable option cards (single select): "What's a polyrhythm?" (beginner), "I've heard of them" (intermediate), "I can play some" (advanced). Selection required to proceed. Stores in `userStore.profile.rhythmLevel: 'beginner' | 'intermediate' | 'advanced'`. Affects default BPM on core player and suggested first action on Learn tab. Acceptance: Selection persists and is available to other features.

- [ ] **Task 3: Build Screen 2b — "Who are you?"**
  Three large tappable cards: Musician, Parent, Both. Single select (tapping one deselects others). Each card has title and subtitle description. Next disabled until one is selected. Acceptance: single selection works, value stored correctly.

- [ ] **Task 4: Build Screen 3 — "What music do you love?"**
  Flex-wrap layout of genre chips. Multi-select. Genres: Jazz, Classical, Afro-Cuban, Hip-Hop, Rock, West African, Latin, Electronic, Other. "Other" chip opens a text input. Skip button in top-right corner. Acceptance: can select multiple genres, skip works (stores empty array), "Other" text input works.

- [ ] **Task 5: Build Screen 4 — "Tell us about your little one" (conditional)**
  Only rendered if Screen 2b role is 'parent' or 'both'. Baby name text input (optional). Birth date picker (required, native picker). Auto-calculated stage display below date picker (compute stage from birth date using stage boundaries from baby-mode spec). Skip allowed for name only, not date. Acceptance: date picker works, stage auto-calculates, conditional rendering based on role.

- [ ] **Task 6: Implement conditional flow logic**
  If role is 'musician', skip Screen 4 entirely -- progress dots show 4 instead of 5. Screen 3 Next goes directly to final CTA. Acceptance: musician flow is 4 screens (1, 2a, 2b, 3), parent/both flow is 5 screens (1, 2a, 2b, 3, 4), progress dots update correctly.

- [ ] **Task 6b: Anonymous Auth Idempotency**
  Before creating new anonymous auth, check for existing session via `supabase.auth.getSession()`. If session exists, reuse it (don't create duplicate). Store partial onboarding progress to AsyncStorage (`@groovecore/onboarding-progress`) for crash recovery. On app relaunch during onboarding, resume from last completed screen. On completion, clear the progress key. Acceptance: Killing app during onboarding and relaunching resumes correctly without creating a duplicate anonymous account.

- [ ] **Task 7: Build "Let's groove!" CTA and completion flow**
  Final screen (or bottom of last screen): large CTA button "Let's groove!". On tap: trigger anonymous Supabase auth, write profile to userStore, set isOnboarded = true, write baby profile if applicable to babyStore, queue sync, navigate to tab navigator (Learn tab). Show loading spinner during auth. Handle auth failure gracefully (retry button). Acceptance: full flow from start to main app works, data persists across app restart.

- [ ] **Task 8: Implement edit mode re-entry from Settings**
  Settings screen "Edit Profile" button opens onboarding screens in edit mode. Pre-populate all fields with current store values. Save button instead of "Let's groove!". No auth trigger. Updates stores with new values. Acceptance: can change role from 'musician' to 'both' and baby tab appears, can update genre preferences.

- [ ] **Task 9: Style all screens with design tokens**
  Apply gradient background, card styles, selected states, progress dot colors, typography scale per design-tokens.md. Stagger fade-in animation for cards on screen entry using react-native-reanimated. Acceptance: screens match design token specifications, animations feel smooth.

- [ ] **Task 10: Unit tests for conditional logic**
  Test: role 'musician' skips Screen 4. Test: stage calculation from birth date (e.g., 4-month-old -> Stage 1, 8-month-old -> Stage 2). Test: at least one rhythm required on Screen 1. Test: rhythmLevel stored correctly from Screen 2a. Test: profile data shape matches UserProfile type. Acceptance: all conditional logic tests pass.

- [ ] **Task 11: Integration test for full onboarding flow**
  Test: complete flow end-to-end — select rhythms → choose role → pick genres → enter baby info → tap CTA → verify stores are populated → verify isOnboarded is true → verify app renders tab navigator. Acceptance: full flow integration test passes.
