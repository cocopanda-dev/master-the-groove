# Navigation Shell — Implementation Tasks

**Foundation:** Navigation Shell
**Spec:** [./spec.md](./spec.md)
**Estimated Effort:** ~3-4 days

---

## Task 1: Create Expo Router Directory Structure and Route Files

- [ ] Create the full `app/` directory structure as defined in the spec:
  - `app/_layout.tsx` (root layout)
  - `app/(onboarding)/_layout.tsx`, `index.tsx`, `role.tsx`, `genres.tsx`, `baby-age.tsx`
  - `app/(tabs)/_layout.tsx`
  - `app/(tabs)/learn/_layout.tsx`, `index.tsx`, `[polyrhythmId]/index.tsx`, `[polyrhythmId]/lesson.tsx`
  - `app/(tabs)/practice/_layout.tsx`, `index.tsx`, `disappearing-beat.tsx`
  - `app/(tabs)/baby/_layout.tsx`, `index.tsx`, `duet-tap.tsx`, `visualizer.tsx`
  - `app/(tabs)/progress/_layout.tsx`, `index.tsx`
  - `app/(tabs)/settings/_layout.tsx`, `index.tsx`
  - `app/+not-found.tsx`
- [ ] Each screen file should export a minimal placeholder component with the screen name displayed (e.g., `<Text>Learn Home</Text>`), so all routes are navigable during development.
- [ ] Verify that `npx expo start` launches without routing errors and all paths are reachable.

**Acceptance Criteria:**
- Every URL path listed in the spec resolves to a screen component without a 404.
- The `+not-found.tsx` fallback renders for invalid paths.
- No TypeScript or Expo Router configuration errors on build.

---

## Task 2: Configure Tab Navigator

- [ ] In `app/(tabs)/_layout.tsx`, configure the `Tabs` component from Expo Router with all 5 tabs: Learn, Practice, Baby, Progress, Settings.
- [ ] Set tab bar icons using `@expo/vector-icons` (MaterialCommunityIcons). Use appropriate icons for each tab with distinct active/inactive variants.
- [ ] Set tab bar labels to match the spec: "Learn", "Practice", "Baby", "Progress", "Settings".
- [ ] Apply tab bar styling:
  - Background color from design tokens (use placeholder values if tokens are not yet implemented).
  - Active tint color for selected tab.
  - Inactive tint color for unselected tabs.
  - Tab bar height of 80pt (accounting for safe area).
  - Top border and subtle shadow.
- [ ] Confirm tab navigation works: tapping each tab switches to the correct screen, and the tab bar remains visible.

**Acceptance Criteria:**
- All 5 tabs render with correct labels and icons.
- Active tab is visually distinguishable from inactive tabs (color change on icon and label).
- Tab bar height is consistent across iPhone (with notch/dynamic island) and Android devices.
- Switching tabs preserves each tab's internal navigation state (e.g., being on a detail screen in Learn, switching to Practice, and switching back maintains the Learn detail screen).

---

## Task 3: Configure Per-Tab Stack Navigators

- [ ] In each tab's `_layout.tsx`, configure a `Stack` navigator with appropriate screen options:
  - **Learn:** Show header with back button. Hide header on lesson screen.
  - **Practice:** Hide header on index. Show header with back button on disappearing-beat.
  - **Baby:** Show header with baby-mode warm styling. Hide header on visualizer (full-screen).
  - **Progress:** Show header, title "My Progress".
  - **Settings:** Show header, title "Settings".
- [ ] Apply header styling from design tokens: background, title color, back button tint, font.
- [ ] Verify back navigation works correctly within each stack (hardware back button on Android, swipe-back on iOS, header back button).

**Acceptance Criteria:**
- Navigating from Learn home to a polyrhythm detail to a lesson and pressing back at each step returns to the correct previous screen.
- Headers show/hide per the spec for each screen.
- Header back button is functional and styled consistently.
- Android hardware back button navigates back within the stack, then switches to the previous tab if at the stack root.

---

## Task 4: Implement Baby Mode Palette Switch

- [ ] In `app/(tabs)/_layout.tsx`, detect when the Baby tab is the active tab (using Expo Router's navigation state or `useSegments()`).
- [ ] When Baby tab is active, animate the tab bar background color to `babyModeSurface` and tint colors to baby mode palette values.
- [ ] When switching away from Baby tab, animate back to the default palette.
- [ ] Use `react-native-reanimated` for the color transition (200ms duration, ease-in-out).
- [ ] Also apply the baby mode palette to the Baby stack's header background and tint colors.

**Acceptance Criteria:**
- Tapping the Baby tab causes a smooth 200ms color transition on the tab bar — no flash or jump.
- Switching from Baby to any other tab smoothly transitions back to the default palette.
- The transition is visually noticeable but not jarring — warm cream/coral for baby, standard dark/light for others.

---

## Task 5: Implement Conditional Baby Tab Visibility

- [ ] In `app/(tabs)/_layout.tsx`, read `userStore.profile.role` using Zustand.
- [ ] If role is `'musician'`, exclude the Baby tab `Screen` from the `Tabs` component render.
- [ ] If role is `'parent'` or `'both'`, include the Baby tab.
- [ ] If the user has not onboarded yet (`isOnboarded === false`), show the Baby tab by default.
- [ ] Ensure the tab order adjusts correctly: 4 tabs without Baby, 5 tabs with Baby.
- [ ] If a user navigates directly to `/baby` via deep link while the tab is hidden, redirect to the Learn tab.

**Acceptance Criteria:**
- A user with role `'musician'` sees exactly 4 tabs: Learn, Practice, Progress, Settings.
- A user with role `'parent'` or `'both'` sees all 5 tabs.
- Changing the role in settings (future feature) reactively shows/hides the Baby tab without requiring an app restart.
- No crash or blank screen if the baby tab is hidden and a deep link targets `/baby`.

---

## Task 6: Set Up Root Layout with Providers

- [ ] In `app/_layout.tsx`, set up the provider stack in correct nesting order:
  1. `GestureHandlerRootView` (outermost, wraps everything)
  2. `SafeAreaProvider`
  3. `BottomSheetModalProvider`
  4. Slot or Stack for rendering child routes
- [ ] Load custom fonts using `expo-font` and `useFonts()` hook.
- [ ] Call `SplashScreen.preventAutoHideAsync()` at module level.
- [ ] In a `useEffect`, once fonts are loaded, call `SplashScreen.hideAsync()`.
- [ ] Add a loading gate: if fonts are not yet loaded, return `null` (splash screen remains visible).

**Acceptance Criteria:**
- App launches with the splash screen visible, transitions smoothly to the first screen once loaded.
- No flash of unstyled content between splash and first screen.
- All providers are available to descendant screens (gestures, safe area, bottom sheets all work).
- Font loading failure is handled gracefully (falls back to system font, still hides splash screen).

---

## Task 7: Implement Onboarding Flow and Gate

- [ ] Create the onboarding stack layout in `app/(onboarding)/_layout.tsx` as a simple Stack with no header.
- [ ] Implement navigation gate in `app/_layout.tsx` or `app/(tabs)/_layout.tsx`:
  - Read `userStore.isOnboarded`.
  - If `false`, redirect to `/(onboarding)`.
  - If `true`, render `(tabs)`.
- [ ] Create placeholder screen components for each onboarding step:
  - `index.tsx`: "What do you want to feel?" with a "Get Started" button that navigates to `/role`.
  - `role.tsx`: Three buttons — Musician, Parent, Both — that set `userStore.profile.role` and navigate to `/genres`.
  - `genres.tsx`: Placeholder multi-select with a "Next" and "Skip" button. Navigates to `/baby-age` if role includes parent, else completes onboarding.
  - `baby-age.tsx`: Placeholder age input with "Done" and "Skip" buttons. Completes onboarding.
- [ ] "Complete onboarding" calls `userStore.completeOnboarding()` and redirects to `(tabs)`.
- [ ] Disable swipe-back gesture on the first onboarding screen.

**Acceptance Criteria:**
- First app launch shows the onboarding flow (because `isOnboarded` is `false`).
- Completing onboarding navigates to the tab bar and subsequent launches go directly to tabs.
- The baby-age screen is skipped when the user selects "Musician" role.
- Pressing the hardware back button on the first onboarding screen does nothing (no crash, no exit).

---

## Task 8: Implement Bottom Sheet Container Wrapper

- [ ] Create a reusable `<BottomSheetContainer>` component in `src/components/navigation/BottomSheetContainer.tsx`.
- [ ] Props: `snapPoints` (default: `['30%', '60%']`), `children`, `isVisible`, `onClose`.
- [ ] Uses `@gorhom/bottom-sheet`'s `BottomSheetModal` internally.
- [ ] Includes a semi-transparent backdrop that dismisses the sheet on tap.
- [ ] Includes a visible drag handle at the top.
- [ ] Exports the component from the navigation foundation's public API.

**Acceptance Criteria:**
- Opening the bottom sheet animates up smoothly. Closing animates down.
- Tapping the backdrop dismisses the sheet and calls `onClose`.
- Dragging the sheet down past the lowest snap point dismisses it.
- The sheet renders its children correctly at different snap points.
- Works on both iOS and Android without layout issues.

---

## Task 9: Implement Keep-Awake Utility Hooks

- [ ] Install `expo-keep-awake` if not already present.
- [ ] Create `src/hooks/useKeepAwakeWhilePlaying.ts`:
  - Uses `useKeepAwake()` from `expo-keep-awake` conditionally based on `audioStore.isPlaying`.
  - When `isPlaying` transitions to `false`, deactivates keep-awake.
- [ ] Create `src/hooks/useKeepAwakeAlways.ts`:
  - Simple wrapper that always calls `useKeepAwake()` — for screens that should never sleep (visualizer, duet tap).
- [ ] Add the appropriate hook call to placeholder screens:
  - Practice index: `useKeepAwakeWhilePlaying()`
  - Disappearing Beat: `useKeepAwakeAlways()`
  - Duet Tap: `useKeepAwakeAlways()`
  - Baby Visualizer: `useKeepAwakeAlways()`

**Acceptance Criteria:**
- On the Practice screen, the device does not sleep while audio is playing but may sleep when stopped.
- On the Baby Visualizer screen, the device never sleeps regardless of audio state.
- Navigating away from a keep-awake screen allows normal sleep behavior to resume.

---

## Task 10: Configure Deep Linking

- [ ] Add `"scheme": "groovecore"` to `app.json` under the `expo` key.
- [ ] Verify that Expo Router's default path-based linking resolves the following URLs correctly:
  - `groovecore://learn` -> Learn tab
  - `groovecore://learn/3-2` -> Polyrhythm detail for 3:2
  - `groovecore://practice` -> Practice tab
  - `groovecore://baby` -> Baby tab (if visible)
  - `groovecore://progress` -> Progress tab
- [ ] Document the deep link scheme in a comment at the top of `app/_layout.tsx` for developer reference.

**Acceptance Criteria:**
- Opening `groovecore://learn` in Safari (iOS) or Chrome (Android) launches the app and navigates to the Learn tab.
- Deep links to valid routes work. Deep links to invalid routes show the `+not-found.tsx` screen.
- No custom `Linking` configuration is needed — Expo Router handles it natively.

---

## Task 11: Verify Full Navigation Flow End-to-End

- [ ] Manually test the complete navigation flow:
  1. Fresh launch -> onboarding screens in correct order -> tab bar.
  2. Learn tab -> polyrhythm detail -> lesson -> back -> back -> Learn home.
  3. Practice tab -> disappearing beat -> back -> Practice home.
  4. Baby tab -> duet tap -> back -> visualizer -> back -> Baby home.
  5. Progress tab and Settings tab render correctly.
  6. Tab switching preserves each tab's stack state.
  7. Baby tab hidden when role is "musician".
  8. Deep link to `/learn/3-2` opens correct screen.
- [ ] Verify no console errors or warnings related to navigation during the flow.
- [ ] Test on both iOS simulator and Android emulator.

**Acceptance Criteria:**
- All navigation paths work without errors on both platforms.
- No "screen not found" or "navigator not configured" warnings.
- Tab bar remains visible on all tab screens and disappears during full-screen modals.
- Performance: tab switching is instant (< 100ms perceived), no visible lag or flash.
