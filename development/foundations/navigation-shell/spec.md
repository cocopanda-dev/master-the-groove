# Navigation Shell — Foundation Spec

**Foundation:** Navigation Shell
**Status:** Not Started
**Dependencies:** Design tokens (colors, typography, spacing)
**Consumers:** All feature screens

---

## Overview

The navigation shell defines the routing structure, tab bar, and screen containers for the entire app. It uses Expo Router's file-based routing system. The shell renders skeletons and routes only — features own their individual screens and all content within them.

---

## 1. Expo Router File-Based Routing Layout

### Directory Structure

```
app/
├── _layout.tsx                         # Root layout (providers, fonts, splash)
├── (onboarding)/
│   ├── _layout.tsx                     # Onboarding stack layout
│   ├── index.tsx                       # Welcome / interest selection
│   ├── role.tsx                        # Musician / parent / both
│   ├── genres.tsx                      # Genre preferences
│   └── baby-age.tsx                    # Baby age input (conditional)
├── (tabs)/
│   ├── _layout.tsx                     # Tab navigator layout
│   ├── learn/
│   │   ├── _layout.tsx                 # Learn stack layout
│   │   ├── index.tsx                   # Polyrhythm library grid
│   │   └── [polyrhythmId]/
│   │       ├── index.tsx               # Polyrhythm detail / overview
│   │       └── lesson.tsx              # Full lesson flow
│   ├── practice/
│   │   ├── _layout.tsx                 # Practice stack layout
│   │   ├── index.tsx                   # Practice home (player + tools)
│   │   └── disappearing-beat.tsx       # Disappearing Beat mode
│   ├── baby/
│   │   ├── _layout.tsx                 # Baby mode stack layout
│   │   ├── index.tsx                   # Baby mode home (stage + activities)
│   │   ├── duet-tap.tsx                # Duet Tap screen
│   │   └── visualizer.tsx              # Full-screen baby visualizer
│   ├── progress/
│   │   ├── _layout.tsx                 # Progress stack layout
│   │   └── index.tsx                   # Progress dashboard
│   └── settings/
│       ├── _layout.tsx                 # Settings stack layout
│       └── index.tsx                   # Settings screen
└── +not-found.tsx                      # 404 fallback
```

### URL Paths

| Screen | URL Path | Notes |
|--------|----------|-------|
| Learn home | `/learn` | Polyrhythm library grid |
| Polyrhythm detail | `/learn/3-2` | Dynamic route via `[polyrhythmId]` |
| Lesson flow | `/learn/3-2/lesson` | Full feel internalization lesson |
| Practice home | `/practice` | Core player with all controls |
| Disappearing Beat | `/practice/disappearing-beat` | Staged mute challenge |
| Baby home | `/baby` | Stage overview and activity cards |
| Duet Tap | `/baby/duet-tap` | Two-zone tap screen |
| Baby Visualizer | `/baby/visualizer` | Full-screen animated visual |
| Progress | `/progress` | Feel status + session history |
| Settings | `/settings` | App preferences |

---

## 2. Tab Bar Configuration

### Tab Definitions

The tab navigator is defined in `app/(tabs)/_layout.tsx` using Expo Router's `Tabs` component.

| Tab | Label | Icon (inactive) | Icon (active) | Route |
|-----|-------|-----------------|---------------|-------|
| Learn | Learn | `music-note-outline` | `music-note` | `learn` |
| Practice | Practice | `drum-outline` | `drum` | `practice` |
| Baby | Baby | `baby-face-outline` | `baby-face` | `baby` |
| Progress | Progress | `chart-line` | `chart-line` | `progress` |
| Settings | Settings | `cog-outline` | `cog` | `settings` |

Icon library: `@expo/vector-icons` (MaterialCommunityIcons or similar). Exact icon names will be finalized during implementation — the above are directional.

### Tab Bar Appearance

- **Background:** `surface` token (dark theme: near-black, light theme: white)
- **Active tint:** `primary` token (brand accent color)
- **Inactive tint:** `textSecondary` token
- **Label visibility:** Always visible (labels help discoverability for first-time users)
- **Height:** 80pt (includes safe area inset on iPhone)
- **Border:** 1pt top border using `border` token
- **Shadow:** Subtle elevation shadow (iOS) or elevation (Android)

### Baby Mode Palette Switch

When the Baby tab is the active tab:
- Tab bar background transitions to `babySurface` token (warm cream)
- Active tint switches to `babyPrimary` token (warm orange)
- Inactive tint switches to `babyTextSecondary` token
- Transition is animated over 200ms using `react-native-reanimated`

This visual shift signals to parents that they are in a distinct, child-safe environment.

---

## 3. Per-Tab Stack Navigation

Each tab contains its own stack navigator (via `_layout.tsx` in each tab folder), enabling internal navigation without losing tab bar context.

### Stack Configuration Per Tab

**Learn Stack:**
- `index` -> `[polyrhythmId]` -> `lesson`
- Header: shown, with back button. Title = polyrhythm name (e.g., "3:2 Clave").
- Lesson screen: header hidden (lesson has its own close/back UI).

**Practice Stack:**
- `index` -> `disappearing-beat`
- Header: hidden on index (practice screen has its own header area). Shown with back button on disappearing-beat.

**Baby Stack:**
- `index` -> `duet-tap` | `visualizer`
- Header: shown with warm styling matching baby palette.
- Visualizer screen: header hidden (full-screen immersive).

**Progress Stack:**
- `index` only (single screen, MVP).
- Header: shown, title "My Progress".

**Settings Stack:**
- `index` only (single screen, MVP).
- Header: shown, title "Settings".

### Header Styling

- Background: `surface` token
- Title color: `textPrimary` token
- Back button color: `primary` token
- Font: `2xl` size, `semibold` weight (from design-tokens.md typography)
- Shadow: none (clean, flat look)

---

## 4. Modal Patterns

### Bottom Sheets

Used for contextual settings panels that do not warrant full navigation (e.g., sound selection, volume mixer during playback).

- Implementation: `@gorhom/bottom-sheet` (widely used, performant).
- Snap points: 30%, 60%, 90% of screen height (configurable per use).
- Backdrop: semi-transparent overlay, tappable to dismiss.
- Handle: visible drag handle at top.

Bottom sheet content is owned by features. The navigation shell provides a reusable `<BottomSheetContainer>` wrapper component.

### Full-Screen Modals

Used for lesson steps, onboarding flow, and any flow that should feel separate from the tab context.

- Presented using Expo Router's `presentation: 'modal'` or `presentation: 'fullScreenModal'` (iOS).
- Close button: top-right X icon.
- No tab bar visible during full-screen modals.

---

## 5. Conditional Tab Visibility

### Baby Tab Visibility Logic

The Baby tab is conditionally visible based on the user's role set during onboarding:

| User Role | Baby Tab Visible |
|-----------|-----------------|
| `musician` | Hidden |
| `parent` | Visible |
| `both` | Visible |
| Not onboarded | Visible (default, removed after onboarding if musician-only) |

Implementation:
- Read `userStore.profile.role` in `app/(tabs)/_layout.tsx`.
- Conditionally render the `baby` tab screen in the `Tabs` component.
- If role changes later (via settings), tab visibility updates reactively (Zustand subscription).

### Tab Order

When baby tab is hidden: Learn, Practice, Progress, Settings (4 tabs).
When baby tab is visible: Learn, Practice, Baby, Progress, Settings (5 tabs).

---

## 6. Screen Awake (Keep Awake)

Playback screens must prevent the device from sleeping.

### Screens That Keep Awake

- Practice home (`/practice`) — while `audioStore.isPlaying` is true
- Disappearing Beat (`/practice/disappearing-beat`) — always while on screen
- Duet Tap (`/baby/duet-tap`) — always while on screen
- Baby Visualizer (`/baby/visualizer`) — always while on screen
- Lesson flow (`/learn/[polyrhythmId]/lesson`) — while audio is playing

### Implementation

- Use `expo-keep-awake`'s `useKeepAwake()` hook.
- Create a utility hook `useKeepAwakeWhilePlaying()` that conditionally activates keep-awake based on `audioStore.isPlaying`.
- Individual screens import and call the appropriate hook.

---

## 7. Deep Linking

### URL Scheme

Register a basic URL scheme for future notification-driven navigation:

- Scheme: `groovecore://`
- Examples:
  - `groovecore://learn/3-2` — opens the 3:2 polyrhythm detail page
  - `groovecore://practice` — opens practice tab
  - `groovecore://baby` — opens baby mode tab
  - `groovecore://progress` — opens progress tab

### Implementation

- Configure in `app.json` under `expo.scheme`.
- Expo Router handles deep link resolution automatically based on file structure.
- No custom linking configuration needed for MVP — Expo Router's default path matching is sufficient.

---

## 8. Root Layout (`app/_layout.tsx`)

The root layout is the entry point for the entire app. It wraps all routes with necessary providers.

### Provider Stack (outermost to innermost)

1. **ThemeProvider** — provides design tokens, dark/light mode
2. **GestureHandlerRootView** — required by react-native-gesture-handler
3. **SafeAreaProvider** — required by react-native-safe-area-context
4. **BottomSheetModalProvider** — required by @gorhom/bottom-sheet
5. **SplashScreen control** — hide splash screen after fonts and sounds load
6. **Font loading** — load custom fonts via `expo-font`

### Splash Screen Strategy

1. Keep splash screen visible on app start (`SplashScreen.preventAutoHideAsync()`).
2. In root layout, load fonts and call audio engine `preloadSounds()` in parallel.
3. Once both complete, hide splash screen (`SplashScreen.hideAsync()`).
4. Navigate to onboarding if `!userStore.isOnboarded`, else navigate to `(tabs)`.

---

## 9. Onboarding Flow

### Routing

Onboarding screens live in `app/(onboarding)/` as a separate group (not inside tabs).

### Flow

1. `/onboarding` — Welcome screen. "What do you want to feel?"
2. `/onboarding/role` — Musician / Parent / Both
3. `/onboarding/genres` — Genre preferences (multi-select)
4. `/onboarding/baby-age` — Baby's age (only if role includes "parent")

### Navigation Behavior

- Onboarding uses a stack with no back gesture on the first screen.
- "Skip" option on genres and baby-age screens.
- On completion: `userStore.completeOnboarding()` is called, user is redirected to `(tabs)`.
- Onboarding is shown only once (gated by `userStore.isOnboarded`).

---

## 10. Boundaries & Constraints

### What the navigation shell owns:
- File-based route definitions and directory structure
- Tab navigator configuration and appearance
- Per-tab stack layout configuration
- Header styling defaults
- Bottom sheet container wrapper
- Keep-awake utility hooks
- Deep link scheme registration
- Root layout providers
- Splash screen orchestration
- Onboarding routing (not content)

### What the navigation shell does NOT own:
- Screen content (features render their own screens)
- Feature-specific navigation logic (e.g., lesson step progression)
- Audio playback or state
- User data or profile management
- Design token definitions (consumed from a shared theme module)

### Import rules:
- Tab `_layout.tsx` may import from `userStore` to check role (for conditional baby tab).
- Individual screens are owned by features — the shell only provides the route slot.
- The navigation shell may import design tokens but must not import from any feature.
