# Epic 4: Navigation Shell -- Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full navigation shell for GrooveCore: Expo Router file-based routing with a 5-tab bar (Learn, Practice, Baby, Progress, Settings), per-tab stack navigators, onboarding route group, conditional Baby tab visibility based on user role, baby palette color transition, keep-awake utility, deep link scheme, and placeholder screens for all routes.

**Architecture:** `app/` directory owns thin compositor screens (default exports required by Expo Router). Navigation shell owns route structure, tab config, and screen containers. Features own screen content -- the shell only provides route slots. `src/` contains hooks, stores, and utilities consumed by the shell.

**Starting Point (Epic 0 provides):**
- Expo Router configured with `app/_layout.tsx`
- Design system tokens (colors, typography, spacing) in `src/design-system/tokens/`
- Design system components: Text, Button, Icon, Spinner
- Entry providers: ThemeProvider, SafeAreaProvider, GestureProvider
- Path aliases, TypeScript strict, ESLint, Jest
- i18next configured
- Zustand stores scaffolded (userStore, audioStore)

**Tech Stack:** Expo Router (file-based), @gorhom/bottom-sheet, expo-keep-awake, @expo/vector-icons, react-native-reanimated, Zustand.

---

## File Map

### Files to Create

```
master-the-groove/
├── app/
│   ├── _layout.tsx                              # MODIFY: Add BottomSheetModalProvider, splash logic
│   ├── (onboarding)/
│   │   ├── _layout.tsx                          # Onboarding stack layout
│   │   ├── index.tsx                            # Welcome screen
│   │   ├── role.tsx                             # Role selection screen
│   │   ├── genres.tsx                           # Genre preferences screen
│   │   └── baby-age.tsx                         # Baby age input screen
│   ├── (tabs)/
│   │   ├── _layout.tsx                          # Tab navigator layout
│   │   ├── learn/
│   │   │   ├── _layout.tsx                      # Learn stack layout
│   │   │   ├── index.tsx                        # Polyrhythm library grid
│   │   │   └── [polyrhythmId]/
│   │   │       ├── index.tsx                    # Polyrhythm detail
│   │   │       └── lesson.tsx                   # Lesson flow
│   │   ├── practice/
│   │   │   ├── _layout.tsx                      # Practice stack layout
│   │   │   ├── index.tsx                        # Practice home
│   │   │   └── disappearing-beat.tsx            # Disappearing Beat mode
│   │   ├── baby/
│   │   │   ├── _layout.tsx                      # Baby mode stack layout
│   │   │   ├── index.tsx                        # Baby mode home
│   │   │   ├── duet-tap.tsx                     # Duet Tap screen
│   │   │   └── visualizer.tsx                   # Baby visualizer
│   │   ├── progress/
│   │   │   ├── _layout.tsx                      # Progress stack layout
│   │   │   └── index.tsx                        # Progress dashboard
│   │   └── settings/
│   │       ├── _layout.tsx                      # Settings stack layout
│   │       └── index.tsx                        # Settings screen
│   └── +not-found.tsx                           # 404 fallback
├── src/
│   ├── navigation/
│   │   ├── hooks/
│   │   │   ├── use-baby-tab-visible.ts          # Baby tab visibility hook
│   │   │   ├── use-baby-palette.ts              # Baby palette animated style hook
│   │   │   ├── use-keep-awake-while-playing.ts  # Keep-awake utility hook
│   │   │   ├── __tests__/
│   │   │   │   ├── use-baby-tab-visible.test.ts
│   │   │   │   ├── use-baby-palette.test.ts
│   │   │   │   └── use-keep-awake-while-playing.test.ts
│   │   │   └── index.ts
│   │   ├── constants.ts                         # Tab config, header styles
│   │   ├── __tests__/
│   │   │   └── constants.test.ts
│   │   └── index.ts
│   ├── design-system/
│   │   └── components/
│   │       └── bottom-sheet-container/
│   │           ├── types.ts
│   │           ├── BottomSheetContainer.tsx
│   │           ├── __tests__/
│   │           │   └── BottomSheetContainer.test.tsx
│   │           └── index.ts
│   └── __tests__/
│       └── mocks/
│           ├── expo-keep-awake.ts               # CREATE
│           ├── gorhom-bottom-sheet.ts           # CREATE
│           └── expo-vector-icons.ts             # CREATE
```

### Files to Modify

```
master-the-groove/
├── app.json                                     # Add scheme: "groovecore"
├── package.json                                 # New dependencies
├── app/_layout.tsx                              # Add BottomSheetModalProvider, onboarding gate
```

---

## Chunk 1: Dependencies & Mocks

### Task 1: Install Dependencies and Create Jest Mocks

**Files:**
- Modify: `package.json`
- Create: `src/__tests__/mocks/expo-keep-awake.ts`, `src/__tests__/mocks/gorhom-bottom-sheet.ts`, `src/__tests__/mocks/expo-vector-icons.ts`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx expo install expo-keep-awake @gorhom/bottom-sheet @expo/vector-icons
```

> `@gorhom/bottom-sheet` requires `react-native-reanimated` and `react-native-gesture-handler`, which are already installed from Epic 0.

- [ ] **Step 2: Verify installation**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx expo doctor
```

- [ ] **Step 3: Create expo-keep-awake mock**

Create `src/__tests__/mocks/expo-keep-awake.ts`:

```typescript
const useKeepAwake = jest.fn();
const activateKeepAwake = jest.fn();
const deactivateKeepAwake = jest.fn();
const activateKeepAwakeAsync = jest.fn().mockResolvedValue(undefined);
const deactivateKeepAwakeAsync = jest.fn().mockResolvedValue(undefined);

export {
  useKeepAwake,
  activateKeepAwake,
  deactivateKeepAwake,
  activateKeepAwakeAsync,
  deactivateKeepAwakeAsync,
};
```

- [ ] **Step 4: Create @gorhom/bottom-sheet mock**

Create `src/__tests__/mocks/gorhom-bottom-sheet.ts`:

```typescript
import React from 'react';
import { View } from 'react-native';

const BottomSheet = React.forwardRef(
  ({ children }: { children: React.ReactNode }, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      expand: jest.fn(),
      collapse: jest.fn(),
      close: jest.fn(),
      snapToIndex: jest.fn(),
      snapToPosition: jest.fn(),
      forceClose: jest.fn(),
    }));
    return React.createElement(View, { testID: 'bottom-sheet' }, children);
  },
);

BottomSheet.displayName = 'BottomSheet';

const BottomSheetModal = React.forwardRef(
  ({ children }: { children: React.ReactNode }, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
      expand: jest.fn(),
      collapse: jest.fn(),
      close: jest.fn(),
      snapToIndex: jest.fn(),
      snapToPosition: jest.fn(),
      forceClose: jest.fn(),
    }));
    return React.createElement(View, { testID: 'bottom-sheet-modal' }, children);
  },
);

BottomSheetModal.displayName = 'BottomSheetModal';

const BottomSheetModalProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(View, { testID: 'bottom-sheet-modal-provider' }, children);

const BottomSheetBackdrop = (props: Record<string, unknown>) =>
  React.createElement(View, { testID: 'bottom-sheet-backdrop', ...props });

const BottomSheetView = ({ children }: { children: React.ReactNode }) =>
  React.createElement(View, { testID: 'bottom-sheet-view' }, children);

const BottomSheetScrollView = ({ children }: { children: React.ReactNode }) =>
  React.createElement(View, { testID: 'bottom-sheet-scroll-view' }, children);

const useBottomSheet = jest.fn().mockReturnValue({
  expand: jest.fn(),
  collapse: jest.fn(),
  close: jest.fn(),
  snapToIndex: jest.fn(),
  snapToPosition: jest.fn(),
  forceClose: jest.fn(),
  animatedIndex: { value: 0 },
  animatedPosition: { value: 0 },
});

const useBottomSheetModal = jest.fn().mockReturnValue({
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
});

export default BottomSheet;

export {
  BottomSheet,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  useBottomSheet,
  useBottomSheetModal,
};
```

- [ ] **Step 5: Create @expo/vector-icons mock**

Create `src/__tests__/mocks/expo-vector-icons.ts`:

```typescript
import React from 'react';
import { Text } from 'react-native';

const createIconMock = (familyName: string) => {
  const IconComponent = ({ name, testID, ...props }: { name: string; testID?: string; [key: string]: unknown }) =>
    React.createElement(Text, { testID: testID ?? `${familyName}-${name}`, ...props }, name);
  IconComponent.displayName = familyName;
  return IconComponent;
};

const MaterialCommunityIcons = createIconMock('MaterialCommunityIcons');
const Ionicons = createIconMock('Ionicons');
const FontAwesome = createIconMock('FontAwesome');

export { MaterialCommunityIcons, Ionicons, FontAwesome };
```

- [ ] **Step 6: Register mocks in Jest setup**

Add the following lines to `src/__tests__/jest-setup.ts` (append to existing file):

```typescript
jest.mock('expo-keep-awake', () => require('./mocks/expo-keep-awake'));
jest.mock('@gorhom/bottom-sheet', () => require('./mocks/gorhom-bottom-sheet'));
jest.mock('@expo/vector-icons', () => require('./mocks/expo-vector-icons'));
```

- [ ] **Step 7: Verify mocks load**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest --passWithNoTests --config jest.config.ts 2>&1 | head -20
```

Expected: Jest initializes without mock-related errors.

- [ ] **Step 8: Commit**

```bash
git add package.json src/__tests__/mocks/expo-keep-awake.ts src/__tests__/mocks/gorhom-bottom-sheet.ts src/__tests__/mocks/expo-vector-icons.ts src/__tests__/jest-setup.ts package-lock.json
git commit -m "$(cat <<'EOF'
feat(nav): install navigation dependencies and create jest mocks

Add expo-keep-awake, @gorhom/bottom-sheet, and @expo/vector-icons.
Create comprehensive Jest mocks for all three packages.
EOF
)"
```

---

## Chunk 2: Navigation Constants & Core Hooks

### Task 2: Navigation Constants (Tab Config, Header Styles)

**Files:**
- Create: `src/navigation/constants.ts`, `src/navigation/__tests__/constants.test.ts`, `src/navigation/index.ts`

- [ ] **Step 1: Write failing test**

Create `src/navigation/__tests__/constants.test.ts`:

```typescript
import {
  TAB_CONFIG,
  HEADER_STYLES,
  TAB_BAR_STYLES,
  BABY_TAB_BAR_STYLES,
  TAB_ORDER_WITH_BABY,
  TAB_ORDER_WITHOUT_BABY,
} from '../constants';

describe('TAB_CONFIG', () => {
  it('defines exactly 5 tabs', () => {
    expect(TAB_CONFIG).toHaveLength(5);
  });

  it('has correct tab order: Learn, Practice, Baby, Progress, Settings', () => {
    const names = TAB_CONFIG.map((tab) => tab.name);
    expect(names).toEqual(['learn', 'practice', 'baby', 'progress', 'settings']);
  });

  it('each tab has required fields', () => {
    for (const tab of TAB_CONFIG) {
      expect(tab).toHaveProperty('name');
      expect(tab).toHaveProperty('label');
      expect(tab).toHaveProperty('iconActive');
      expect(tab).toHaveProperty('iconInactive');
    }
  });

  it('Learn tab has correct icon names', () => {
    const learnTab = TAB_CONFIG.find((tab) => tab.name === 'learn');
    expect(learnTab?.iconActive).toBe('music-note');
    expect(learnTab?.iconInactive).toBe('music-note-outline');
  });

  it('Practice tab has correct icon names', () => {
    const practiceTab = TAB_CONFIG.find((tab) => tab.name === 'practice');
    expect(practiceTab?.iconActive).toBe('drum');
    expect(practiceTab?.iconInactive).toBe('drum');
  });

  it('Baby tab has correct icon names', () => {
    const babyTab = TAB_CONFIG.find((tab) => tab.name === 'baby');
    expect(babyTab?.iconActive).toBe('baby-face');
    expect(babyTab?.iconInactive).toBe('baby-face-outline');
  });

  it('Progress tab has correct icon names', () => {
    const progressTab = TAB_CONFIG.find((tab) => tab.name === 'progress');
    expect(progressTab?.iconActive).toBe('chart-line');
    expect(progressTab?.iconInactive).toBe('chart-line');
  });

  it('Settings tab has correct icon names', () => {
    const settingsTab = TAB_CONFIG.find((tab) => tab.name === 'settings');
    expect(settingsTab?.iconActive).toBe('cog');
    expect(settingsTab?.iconInactive).toBe('cog-outline');
  });
});

describe('TAB_BAR_STYLES', () => {
  it('has height of 80', () => {
    expect(TAB_BAR_STYLES.height).toBe(80);
  });

  it('uses surface token for background', () => {
    expect(TAB_BAR_STYLES.backgroundColor).toBeDefined();
  });

  it('has borderTopWidth of 1', () => {
    expect(TAB_BAR_STYLES.borderTopWidth).toBe(1);
  });
});

describe('BABY_TAB_BAR_STYLES', () => {
  it('uses babySurface for background', () => {
    expect(BABY_TAB_BAR_STYLES.backgroundColor).toBeDefined();
  });

  it('uses babyPrimary for activeTint', () => {
    expect(BABY_TAB_BAR_STYLES.activeTint).toBeDefined();
  });

  it('uses babyTextSecondary for inactiveTint', () => {
    expect(BABY_TAB_BAR_STYLES.inactiveTint).toBeDefined();
  });
});

describe('HEADER_STYLES', () => {
  it('has headerShadowVisible set to false', () => {
    expect(HEADER_STYLES.headerShadowVisible).toBe(false);
  });

  it('uses surface token for headerStyle background', () => {
    expect(HEADER_STYLES.headerStyle.backgroundColor).toBeDefined();
  });
});

describe('TAB_ORDER constants', () => {
  it('TAB_ORDER_WITH_BABY has 5 entries', () => {
    expect(TAB_ORDER_WITH_BABY).toEqual(['learn', 'practice', 'baby', 'progress', 'settings']);
  });

  it('TAB_ORDER_WITHOUT_BABY has 4 entries (no baby)', () => {
    expect(TAB_ORDER_WITHOUT_BABY).toEqual(['learn', 'practice', 'progress', 'settings']);
  });
});
```

- [ ] **Step 2: Run test -- expect failure**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/__tests__/constants.test.ts --no-coverage 2>&1 | tail -5
```

Expected: `Cannot find module '../constants'`

- [ ] **Step 3: Implement constants**

Create `src/navigation/constants.ts`:

```typescript
import { colors } from '@design-system/tokens';

interface TabConfig {
  name: 'learn' | 'practice' | 'baby' | 'progress' | 'settings';
  label: string;
  iconActive: string;
  iconInactive: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'learn',
    label: 'Learn',
    iconActive: 'music-note',
    iconInactive: 'music-note-outline',
  },
  {
    name: 'practice',
    label: 'Practice',
    iconActive: 'drum',
    iconInactive: 'drum',
  },
  {
    name: 'baby',
    label: 'Baby',
    iconActive: 'baby-face',
    iconInactive: 'baby-face-outline',
  },
  {
    name: 'progress',
    label: 'Progress',
    iconActive: 'chart-line',
    iconInactive: 'chart-line',
  },
  {
    name: 'settings',
    label: 'Settings',
    iconActive: 'cog',
    iconInactive: 'cog-outline',
  },
];

const TAB_BAR_STYLES = {
  height: 80,
  backgroundColor: colors.surface,
  activeTint: colors.primary,
  inactiveTint: colors.textSecondary,
  borderTopWidth: 1,
  borderTopColor: colors.border,
} as const;

const BABY_TAB_BAR_STYLES = {
  backgroundColor: colors.babySurface,
  activeTint: colors.babyPrimary,
  inactiveTint: colors.babyTextSecondary,
} as const;

const HEADER_STYLES = {
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.primary,
  headerTitleStyle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '600' as const,
  },
} as const;

const TAB_ORDER_WITH_BABY = ['learn', 'practice', 'baby', 'progress', 'settings'] as const;
const TAB_ORDER_WITHOUT_BABY = ['learn', 'practice', 'progress', 'settings'] as const;

export type { TabConfig };

export {
  TAB_CONFIG,
  TAB_BAR_STYLES,
  BABY_TAB_BAR_STYLES,
  HEADER_STYLES,
  TAB_ORDER_WITH_BABY,
  TAB_ORDER_WITHOUT_BABY,
};
```

- [ ] **Step 4: Create barrel export**

Create `src/navigation/index.ts`:

```typescript
export {
  TAB_CONFIG,
  TAB_BAR_STYLES,
  BABY_TAB_BAR_STYLES,
  HEADER_STYLES,
  TAB_ORDER_WITH_BABY,
  TAB_ORDER_WITHOUT_BABY,
} from './constants';
export type { TabConfig } from './constants';
export {
  useBabyTabVisible,
  useBabyPalette,
  useKeepAwakeWhilePlaying,
} from './hooks';
```

> Note: The hooks barrel (`./hooks`) will be created in Task 3. This file will temporarily have an import error until then. That is fine -- we commit per-task and fix forward.

- [ ] **Step 5: Run test -- expect pass**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/__tests__/constants.test.ts --no-coverage
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/navigation/constants.ts src/navigation/__tests__/constants.test.ts src/navigation/index.ts
git commit -m "$(cat <<'EOF'
feat(nav): add navigation constants for tab config and header styles

Define TAB_CONFIG (5 tabs with icons), TAB_BAR_STYLES, BABY_TAB_BAR_STYLES,
HEADER_STYLES, and tab order constants. All values reference design tokens.
EOF
)"
```

---

### Task 3: useBabyTabVisible Hook

**Files:**
- Create: `src/navigation/hooks/use-baby-tab-visible.ts`, `src/navigation/hooks/__tests__/use-baby-tab-visible.test.ts`, `src/navigation/hooks/index.ts`

- [ ] **Step 1: Write failing test**

Create `src/navigation/hooks/__tests__/use-baby-tab-visible.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useBabyTabVisible } from '../use-baby-tab-visible';

// Mock the user store
const mockUserStore = {
  profile: {
    role: 'both' as 'musician' | 'parent' | 'both',
  },
  isOnboarded: true,
  listeners: new Set<() => void>(),
};

jest.mock('@libs/stores/user-store', () => ({
  useUserStore: (selector: (state: typeof mockUserStore) => unknown) => selector(mockUserStore),
}));

describe('useBabyTabVisible', () => {
  beforeEach(() => {
    mockUserStore.profile.role = 'both';
    mockUserStore.isOnboarded = true;
  });

  it('returns true when role is "parent"', () => {
    mockUserStore.profile.role = 'parent';
    const { result } = renderHook(() => useBabyTabVisible());
    expect(result.current).toBe(true);
  });

  it('returns true when role is "both"', () => {
    mockUserStore.profile.role = 'both';
    const { result } = renderHook(() => useBabyTabVisible());
    expect(result.current).toBe(true);
  });

  it('returns false when role is "musician"', () => {
    mockUserStore.profile.role = 'musician';
    const { result } = renderHook(() => useBabyTabVisible());
    expect(result.current).toBe(false);
  });

  it('returns true when user is not onboarded (default visibility)', () => {
    mockUserStore.isOnboarded = false;
    mockUserStore.profile.role = 'musician';
    const { result } = renderHook(() => useBabyTabVisible());
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run test -- expect failure**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/hooks/__tests__/use-baby-tab-visible.test.ts --no-coverage 2>&1 | tail -5
```

Expected: `Cannot find module '../use-baby-tab-visible'`

- [ ] **Step 3: Implement hook**

Create `src/navigation/hooks/use-baby-tab-visible.ts`:

```typescript
import { useUserStore } from '@libs/stores/user-store';

/**
 * Determines whether the Baby tab should be visible in the tab bar.
 *
 * Rules:
 * - Hidden when role === 'musician' AND user has completed onboarding
 * - Visible for 'parent' or 'both' roles
 * - Visible by default if user has not completed onboarding
 */
const useBabyTabVisible = (): boolean => {
  const role = useUserStore((state) => state.profile.role);
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  if (!isOnboarded) {
    return true;
  }

  return role !== 'musician';
};

export { useBabyTabVisible };
```

- [ ] **Step 4: Create hooks barrel**

Create `src/navigation/hooks/index.ts`:

```typescript
export { useBabyTabVisible } from './use-baby-tab-visible';
export { useBabyPalette } from './use-baby-palette';
export { useKeepAwakeWhilePlaying } from './use-keep-awake-while-playing';
```

> Note: `use-baby-palette` and `use-keep-awake-while-playing` do not exist yet. They will be created in subsequent tasks. The barrel will have import errors until then. This is expected.

- [ ] **Step 5: Run test -- expect pass**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/hooks/__tests__/use-baby-tab-visible.test.ts --no-coverage
```

Expected: All 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/navigation/hooks/use-baby-tab-visible.ts src/navigation/hooks/__tests__/use-baby-tab-visible.test.ts src/navigation/hooks/index.ts
git commit -m "$(cat <<'EOF'
feat(nav): add useBabyTabVisible hook for conditional baby tab

Returns true for 'parent'/'both' roles and non-onboarded users.
Returns false for 'musician' role after onboarding.
EOF
)"
```

---

### Task 4: useBabyPalette Hook (Animated Tab Bar Colors)

**Files:**
- Create: `src/navigation/hooks/use-baby-palette.ts`, `src/navigation/hooks/__tests__/use-baby-palette.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/navigation/hooks/__tests__/use-baby-palette.test.ts`:

```typescript
import { renderHook } from '@testing-library/react-native';
import { useBabyPalette } from '../use-baby-palette';
import { colors } from '@design-system/tokens';

// Reanimated mock setup: withTiming returns target value directly in tests
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withTiming: (toValue: unknown) => toValue,
    interpolateColor: jest.fn(
      (value: number, inputRange: number[], outputRange: string[]) =>
        value === 0 ? outputRange[0] : outputRange[1],
    ),
    useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
  };
});

describe('useBabyPalette', () => {
  it('returns default palette colors when isBabyActive is false', () => {
    const { result } = renderHook(() => useBabyPalette(false));
    expect(result.current.backgroundColor).toBe(colors.surface);
    expect(result.current.activeTint).toBe(colors.primary);
    expect(result.current.inactiveTint).toBe(colors.textSecondary);
  });

  it('returns baby palette colors when isBabyActive is true', () => {
    const { result } = renderHook(() => useBabyPalette(true));
    expect(result.current.backgroundColor).toBe(colors.babySurface);
    expect(result.current.activeTint).toBe(colors.babyPrimary);
    expect(result.current.inactiveTint).toBe(colors.babyTextSecondary);
  });

  it('returns an object with backgroundColor, activeTint, and inactiveTint', () => {
    const { result } = renderHook(() => useBabyPalette(false));
    expect(result.current).toHaveProperty('backgroundColor');
    expect(result.current).toHaveProperty('activeTint');
    expect(result.current).toHaveProperty('inactiveTint');
  });
});
```

- [ ] **Step 2: Run test -- expect failure**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/hooks/__tests__/use-baby-palette.test.ts --no-coverage 2>&1 | tail -5
```

Expected: `Cannot find module '../use-baby-palette'`

- [ ] **Step 3: Implement hook**

Create `src/navigation/hooks/use-baby-palette.ts`:

```typescript
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  interpolateColor,
  type SharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '@design-system/tokens';

interface BabyPaletteResult {
  backgroundColor: string;
  activeTint: string;
  inactiveTint: string;
}

const TRANSITION_DURATION = 200;

/**
 * Provides animated color values for the tab bar that transition
 * between the default palette and the baby palette.
 *
 * When the baby tab is active, the tab bar smoothly transitions
 * over 200ms to warm baby-mode colors.
 *
 * @param isBabyActive - Whether the baby tab is currently focused
 * @returns Object with animated backgroundColor, activeTint, and inactiveTint
 */
const useBabyPalette = (isBabyActive: boolean): BabyPaletteResult => {
  const progress = useSharedValue(isBabyActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isBabyActive ? 1 : 0, {
      duration: TRANSITION_DURATION,
    });
  }, [isBabyActive, progress]);

  const backgroundColor = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 1],
      [colors.surface, colors.babySurface],
    ),
  );

  const activeTint = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 1],
      [colors.primary, colors.babyPrimary],
    ),
  );

  const inactiveTint = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 1],
      [colors.textSecondary, colors.babyTextSecondary],
    ),
  );

  return {
    backgroundColor: backgroundColor.value as string,
    activeTint: activeTint.value as string,
    inactiveTint: inactiveTint.value as string,
  };
};

export { useBabyPalette };
export type { BabyPaletteResult };
```

- [ ] **Step 4: Run test -- expect pass**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/hooks/__tests__/use-baby-palette.test.ts --no-coverage
```

Expected: All 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/navigation/hooks/use-baby-palette.ts src/navigation/hooks/__tests__/use-baby-palette.test.ts
git commit -m "$(cat <<'EOF'
feat(nav): add useBabyPalette hook for animated tab bar color transition

Smoothly transitions tab bar colors between default and baby palette
over 200ms using react-native-reanimated interpolateColor.
EOF
)"
```

---

### Task 5: useKeepAwakeWhilePlaying Hook

**Files:**
- Create: `src/navigation/hooks/use-keep-awake-while-playing.ts`, `src/navigation/hooks/__tests__/use-keep-awake-while-playing.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/navigation/hooks/__tests__/use-keep-awake-while-playing.test.ts`:

```typescript
import { renderHook } from '@testing-library/react-native';
import { useKeepAwakeWhilePlaying } from '../use-keep-awake-while-playing';
import { activateKeepAwakeAsync, deactivateKeepAwakeAsync } from 'expo-keep-awake';

const mockAudioStore = {
  isPlaying: false,
};

jest.mock('@libs/stores/audio-store', () => ({
  useAudioStore: (selector: (state: typeof mockAudioStore) => unknown) => selector(mockAudioStore),
}));

describe('useKeepAwakeWhilePlaying', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioStore.isPlaying = false;
  });

  it('activates keep-awake when isPlaying is true', () => {
    mockAudioStore.isPlaying = true;
    renderHook(() => useKeepAwakeWhilePlaying());
    expect(activateKeepAwakeAsync).toHaveBeenCalled();
  });

  it('deactivates keep-awake when isPlaying is false', () => {
    mockAudioStore.isPlaying = false;
    renderHook(() => useKeepAwakeWhilePlaying());
    expect(deactivateKeepAwakeAsync).toHaveBeenCalled();
  });

  it('deactivates keep-awake on unmount', () => {
    mockAudioStore.isPlaying = true;
    const { unmount } = renderHook(() => useKeepAwakeWhilePlaying());
    jest.clearAllMocks();
    unmount();
    expect(deactivateKeepAwakeAsync).toHaveBeenCalled();
  });
});

describe('useKeepAwakeWhilePlaying with always option', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioStore.isPlaying = false;
  });

  it('activates keep-awake regardless of isPlaying when always is true', () => {
    mockAudioStore.isPlaying = false;
    renderHook(() => useKeepAwakeWhilePlaying({ always: true }));
    expect(activateKeepAwakeAsync).toHaveBeenCalled();
  });

  it('deactivates on unmount even when always is true', () => {
    const { unmount } = renderHook(() => useKeepAwakeWhilePlaying({ always: true }));
    jest.clearAllMocks();
    unmount();
    expect(deactivateKeepAwakeAsync).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test -- expect failure**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/hooks/__tests__/use-keep-awake-while-playing.test.ts --no-coverage 2>&1 | tail -5
```

Expected: `Cannot find module '../use-keep-awake-while-playing'`

- [ ] **Step 3: Implement hook**

Create `src/navigation/hooks/use-keep-awake-while-playing.ts`:

```typescript
import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwakeAsync } from 'expo-keep-awake';
import { useAudioStore } from '@libs/stores/audio-store';

interface KeepAwakeOptions {
  /**
   * When true, keep-awake is always active while the component is mounted,
   * regardless of audio playback state. Use for screens like Disappearing Beat,
   * Duet Tap, and Baby Visualizer that should always stay awake.
   */
  always?: boolean;
}

const KEEP_AWAKE_TAG = 'groovecore-playback';

/**
 * Conditionally activates keep-awake based on audio playback state.
 *
 * Usage:
 * - `useKeepAwakeWhilePlaying()` -- activates only when audioStore.isPlaying is true
 * - `useKeepAwakeWhilePlaying({ always: true })` -- activates for entire mount lifecycle
 *
 * Always deactivates on unmount to prevent battery drain.
 */
const useKeepAwakeWhilePlaying = (options?: KeepAwakeOptions): void => {
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const shouldKeepAwake = options?.always === true || isPlaying;

  useEffect(() => {
    if (shouldKeepAwake) {
      activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    } else {
      deactivateKeepAwakeAsync(KEEP_AWAKE_TAG);
    }

    return () => {
      deactivateKeepAwakeAsync(KEEP_AWAKE_TAG);
    };
  }, [shouldKeepAwake]);
};

export { useKeepAwakeWhilePlaying };
export type { KeepAwakeOptions };
```

- [ ] **Step 4: Run test -- expect pass**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/hooks/__tests__/use-keep-awake-while-playing.test.ts --no-coverage
```

Expected: All 5 tests pass.

- [ ] **Step 5: Run all navigation tests so far**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/ --no-coverage
```

Expected: All tests pass (constants + 3 hooks).

- [ ] **Step 6: Commit**

```bash
git add src/navigation/hooks/use-keep-awake-while-playing.ts src/navigation/hooks/__tests__/use-keep-awake-while-playing.test.ts src/navigation/hooks/index.ts
git commit -m "$(cat <<'EOF'
feat(nav): add useKeepAwakeWhilePlaying hook

Conditionally activates expo-keep-awake based on audioStore.isPlaying.
Supports { always: true } option for screens that always stay awake.
Deactivates on unmount to prevent battery drain.
EOF
)"
```

---

## Chunk 3: Root Layout & Tab Layout

### Task 6: Root Layout (app/_layout.tsx) -- Providers, Splash, Onboarding Gate

**Files:**
- Modify: `app/_layout.tsx`

This is a thin compositor file in `app/` that uses default export (required by Expo Router). Testing is limited to verifying the file parses correctly; integration testing of navigation flows is covered in Task 12.

- [ ] **Step 1: Implement root layout**

Replace `app/_layout.tsx` with:

```typescript
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@entry-providers/theme-provider';
import { LocalizationProvider } from '@entry-providers/localization-provider';
import { useUserStore } from '@libs/stores/user-store';
import { StyleSheet } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const RootLayoutNav = () => {
  const router = useRouter();
  const segments = useSegments();
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  useEffect(() => {
    const inOnboarding = segments[0] === '(onboarding)';

    if (!isOnboarded && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (isOnboarded && inOnboarding) {
      router.replace('/(tabs)/learn');
    }
  }, [isOnboarded, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

/**
 * Root layout -- outermost shell wrapping all routes with providers.
 *
 * Provider order (outermost to innermost):
 * 1. ThemeProvider
 * 2. GestureHandlerRootView
 * 3. SafeAreaProvider
 * 4. BottomSheetModalProvider
 * 5. LocalizationProvider
 */
const RootLayout = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Load fonts and preload sounds in parallel
        // TODO: Add useFonts and preloadSounds when audio engine is built
        await Promise.all([
          // Font loading will go here
          // Audio preloading will go here
        ]);
      } catch (err) {
        console.warn('Error during app preparation:', err);
      } finally {
        setAppIsReady(true);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <LocalizationProvider>
              <RootLayoutNav />
            </LocalizationProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Expo Router requires default export
export default RootLayout;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors in `app/_layout.tsx` (there may be errors in files not yet created).

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(nav): implement root layout with providers and onboarding gate

Wraps all routes with ThemeProvider, GestureHandlerRootView, SafeAreaProvider,
BottomSheetModalProvider, and LocalizationProvider. Gates navigation to
onboarding for non-onboarded users. Controls splash screen lifecycle.
EOF
)"
```

---

### Task 7: Tab Layout (app/(tabs)/_layout.tsx) -- 5 Tabs with Icons and Baby Palette

**Files:**
- Create: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Implement tab layout**

Create `app/(tabs)/_layout.tsx`:

```typescript
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TAB_CONFIG, TAB_BAR_STYLES, HEADER_STYLES } from '@navigation/constants';
import { useBabyTabVisible } from '@navigation/hooks/use-baby-tab-visible';
import { useBabyPalette } from '@navigation/hooks/use-baby-palette';
import { useState } from 'react';

const TabLayout = () => {
  const isBabyTabVisible = useBabyTabVisible();
  const [activeTab, setActiveTab] = useState<string>('learn');
  const isBabyActive = activeTab === 'baby';
  const palette = useBabyPalette(isBabyActive);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: TAB_BAR_STYLES.height,
          backgroundColor: palette.backgroundColor,
          borderTopWidth: TAB_BAR_STYLES.borderTopWidth,
          borderTopColor: TAB_BAR_STYLES.borderTopColor,
        },
        tabBarActiveTintColor: palette.activeTint,
        tabBarInactiveTintColor: palette.inactiveTint,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
      screenListeners={{
        tabPress: (event) => {
          const routeName = event.target?.split('-')[0];
          if (routeName) {
            setActiveTab(routeName);
          }
        },
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'music-note' : 'music-note-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'drum' : 'drum'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="baby"
        options={{
          title: 'Baby',
          href: isBabyTabVisible ? '/(tabs)/baby' : null,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'baby-face' : 'baby-face-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'cog' : 'cog-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

// Expo Router requires default export
export default TabLayout;
```

> **Key implementation detail:** The Baby tab uses `href: null` to hide it from the tab bar when `isBabyTabVisible` is false. This is the Expo Router v3 pattern for conditionally hiding tabs while keeping the route defined.

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx tsc --noEmit --pretty 2>&1 | grep "_layout" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(nav): implement tab layout with 5 tabs and baby palette transition

Configure Learn, Practice, Baby, Progress, Settings tabs with
MaterialCommunityIcons. Baby tab conditionally hidden via href=null
when role is 'musician'. Tab bar colors animate to baby palette
when baby tab is active.
EOF
)"
```

---

### Task 8: Per-Tab Stack Layouts

**Files:**
- Create: `app/(tabs)/learn/_layout.tsx`
- Create: `app/(tabs)/practice/_layout.tsx`
- Create: `app/(tabs)/baby/_layout.tsx`
- Create: `app/(tabs)/progress/_layout.tsx`
- Create: `app/(tabs)/settings/_layout.tsx`

- [ ] **Step 1: Create Learn stack layout**

Create `app/(tabs)/learn/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Learn tab stack:
 * - index: Polyrhythm library grid (header shown)
 * - [polyrhythmId]/index: Polyrhythm detail (header with back button, title = polyrhythm name)
 * - [polyrhythmId]/lesson: Lesson flow (header hidden -- lesson has its own close/back UI)
 */
const LearnLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: true,
    }}
  >
    <Stack.Screen
      name="index"
      options={{ title: 'Learn' }}
    />
    <Stack.Screen
      name="[polyrhythmId]/index"
      options={{ title: '' }}
    />
    <Stack.Screen
      name="[polyrhythmId]/lesson"
      options={{ headerShown: false }}
    />
  </Stack>
);

export default LearnLayout;
```

- [ ] **Step 2: Create Practice stack layout**

Create `app/(tabs)/practice/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Practice tab stack:
 * - index: Practice home (header hidden -- screen has its own header area)
 * - disappearing-beat: Disappearing Beat mode (header with back button)
 */
const PracticeLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: true,
    }}
  >
    <Stack.Screen
      name="index"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="disappearing-beat"
      options={{ title: 'Disappearing Beat' }}
    />
  </Stack>
);

export default PracticeLayout;
```

- [ ] **Step 3: Create Baby stack layout**

Create `app/(tabs)/baby/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { colors } from '@design-system/tokens';

/**
 * Baby tab stack:
 * - index: Baby mode home (header with warm styling)
 * - duet-tap: Duet Tap screen (header with warm styling)
 * - visualizer: Full-screen baby visualizer (header hidden -- immersive)
 */
const BabyLayout = () => (
  <Stack
    screenOptions={{
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: colors.babySurface,
      },
      headerTintColor: colors.babyPrimary,
      headerTitleStyle: {
        color: colors.babyTextPrimary,
        fontSize: 24,
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="index"
      options={{ title: 'Baby Mode' }}
    />
    <Stack.Screen
      name="duet-tap"
      options={{ title: 'Duet Tap' }}
    />
    <Stack.Screen
      name="visualizer"
      options={{ headerShown: false }}
    />
  </Stack>
);

export default BabyLayout;
```

- [ ] **Step 4: Create Progress stack layout**

Create `app/(tabs)/progress/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Progress tab stack:
 * - index: Progress dashboard (single screen for MVP)
 */
const ProgressLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: true,
    }}
  >
    <Stack.Screen
      name="index"
      options={{ title: 'My Progress' }}
    />
  </Stack>
);

export default ProgressLayout;
```

- [ ] **Step 5: Create Settings stack layout**

Create `app/(tabs)/settings/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Settings tab stack:
 * - index: Settings screen (single screen for MVP)
 */
const SettingsLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: true,
    }}
  >
    <Stack.Screen
      name="index"
      options={{ title: 'Settings' }}
    />
  </Stack>
);

export default SettingsLayout;
```

- [ ] **Step 6: Verify all files exist**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
ls app/\(tabs\)/learn/_layout.tsx app/\(tabs\)/practice/_layout.tsx app/\(tabs\)/baby/_layout.tsx app/\(tabs\)/progress/_layout.tsx app/\(tabs\)/settings/_layout.tsx
```

Expected: All 5 files listed.

- [ ] **Step 7: Commit**

```bash
git add app/\(tabs\)/learn/_layout.tsx app/\(tabs\)/practice/_layout.tsx app/\(tabs\)/baby/_layout.tsx app/\(tabs\)/progress/_layout.tsx app/\(tabs\)/settings/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(nav): add per-tab stack layouts for all 5 tabs

Learn: 3-level stack (library, detail, lesson).
Practice: 2-level stack (home, disappearing-beat).
Baby: 3-level stack (home, duet-tap, visualizer) with warm palette headers.
Progress: single screen stack.
Settings: single screen stack.
EOF
)"
```

---

## Chunk 4: Screens & Routes

### Task 9: Placeholder Screens for All Tab Routes

**Files:**
- Create: All `index.tsx` and nested screen files under `app/(tabs)/`

Every screen is a thin placeholder with a centered label identifying the route. Features will replace the content in later epics. Each file uses default export as required by Expo Router.

- [ ] **Step 1: Create Learn tab screens**

Create `app/(tabs)/learn/index.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';

const LearnScreen = () => (
  <View style={styles.container}>
    <Text variant="2xl">Learn</Text>
    <Text variant="md">Polyrhythm library grid</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LearnScreen;
```

Create `app/(tabs)/learn/[polyrhythmId]/index.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';
import { useLocalSearchParams } from 'expo-router';

const PolyrhythmDetailScreen = () => {
  const { polyrhythmId } = useLocalSearchParams<{ polyrhythmId: string }>();

  return (
    <View style={styles.container}>
      <Text variant="2xl">Polyrhythm Detail</Text>
      <Text variant="md">{polyrhythmId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PolyrhythmDetailScreen;
```

Create `app/(tabs)/learn/[polyrhythmId]/lesson.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';
import { useLocalSearchParams } from 'expo-router';

const LessonScreen = () => {
  const { polyrhythmId } = useLocalSearchParams<{ polyrhythmId: string }>();

  return (
    <View style={styles.container}>
      <Text variant="2xl">Lesson</Text>
      <Text variant="md">{polyrhythmId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LessonScreen;
```

- [ ] **Step 2: Create Practice tab screens**

Create `app/(tabs)/practice/index.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';

const PracticeScreen = () => (
  <View style={styles.container}>
    <Text variant="2xl">Practice</Text>
    <Text variant="md">Core player with all controls</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PracticeScreen;
```

Create `app/(tabs)/practice/disappearing-beat.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';

const DisappearingBeatScreen = () => (
  <View style={styles.container}>
    <Text variant="2xl">Disappearing Beat</Text>
    <Text variant="md">Staged mute challenge</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DisappearingBeatScreen;
```

- [ ] **Step 3: Create Baby tab screens**

Create `app/(tabs)/baby/index.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';
import { colors } from '@design-system/tokens';

const BabyHomeScreen = () => (
  <View style={styles.container}>
    <Text variant="2xl">Baby Mode</Text>
    <Text variant="md">Stage overview and activity cards</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.babyBackground,
  },
});

export default BabyHomeScreen;
```

Create `app/(tabs)/baby/duet-tap.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';
import { colors } from '@design-system/tokens';

const DuetTapScreen = () => (
  <View style={styles.container}>
    <Text variant="2xl">Duet Tap</Text>
    <Text variant="md">Two-zone tap screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.babyBackground,
  },
});

export default DuetTapScreen;
```

Create `app/(tabs)/baby/visualizer.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';
import { colors } from '@design-system/tokens';

const BabyVisualizerScreen = () => (
  <View style={styles.container}>
    <Text variant="2xl">Baby Visualizer</Text>
    <Text variant="md">Full-screen animated visual</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.babyBackground,
  },
});

export default BabyVisualizerScreen;
```

- [ ] **Step 4: Create Progress tab screen**

Create `app/(tabs)/progress/index.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';

const ProgressScreen = () => (
  <View style={styles.container}>
    <Text variant="2xl">My Progress</Text>
    <Text variant="md">Feel status and session history</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressScreen;
```

- [ ] **Step 5: Create Settings tab screen**

Create `app/(tabs)/settings/index.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';

const SettingsScreen = () => (
  <View style={styles.container}>
    <Text variant="2xl">Settings</Text>
    <Text variant="md">App preferences</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SettingsScreen;
```

- [ ] **Step 6: Verify all screen files exist**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
find app/\(tabs\) -name "*.tsx" -not -name "_layout.tsx" | sort
```

Expected output (10 files):
```
app/(tabs)/baby/duet-tap.tsx
app/(tabs)/baby/index.tsx
app/(tabs)/baby/visualizer.tsx
app/(tabs)/learn/[polyrhythmId]/index.tsx
app/(tabs)/learn/[polyrhythmId]/lesson.tsx
app/(tabs)/learn/index.tsx
app/(tabs)/practice/disappearing-beat.tsx
app/(tabs)/practice/index.tsx
app/(tabs)/progress/index.tsx
app/(tabs)/settings/index.tsx
```

- [ ] **Step 7: Commit**

```bash
git add app/\(tabs\)/
git commit -m "$(cat <<'EOF'
feat(nav): add placeholder screens for all tab routes

Create minimal placeholder screens for: Learn (library, detail, lesson),
Practice (home, disappearing-beat), Baby (home, duet-tap, visualizer),
Progress (dashboard), Settings (preferences). Each shows route name
and description. Features will replace content in later epics.
EOF
)"
```

---

### Task 10: Onboarding Route Group

**Files:**
- Create: `app/(onboarding)/_layout.tsx`, `app/(onboarding)/index.tsx`, `app/(onboarding)/role.tsx`, `app/(onboarding)/genres.tsx`, `app/(onboarding)/baby-age.tsx`

- [ ] **Step 1: Create onboarding stack layout**

Create `app/(onboarding)/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Onboarding flow stack layout.
 *
 * Flow: Welcome -> Role -> Genres -> Baby Age (conditional)
 *
 * - No back gesture on first screen (Welcome)
 * - Skip option available on Genres and Baby Age
 * - On completion, user is redirected to (tabs)
 */
const OnboardingLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: false,
      gestureEnabled: true,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen
      name="index"
      options={{
        gestureEnabled: false,
      }}
    />
    <Stack.Screen name="role" />
    <Stack.Screen name="genres" />
    <Stack.Screen name="baby-age" />
  </Stack>
);

export default OnboardingLayout;
```

- [ ] **Step 2: Create Welcome screen**

Create `app/(onboarding)/index.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system/components';
import { useRouter } from 'expo-router';
import { Button } from '@design-system/components';

const WelcomeScreen = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(onboarding)/role');
  };

  return (
    <View style={styles.container}>
      <Text variant="3xl">GrooveCore</Text>
      <Text variant="lg">What do you want to feel?</Text>
      <Button
        label="Get Started"
        onPress={handleGetStarted}
        accessibilityRole="button"
        accessibilityLabel="Get started with onboarding"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 32,
  },
});

export default WelcomeScreen;
```

- [ ] **Step 3: Create Role selection screen**

Create `app/(onboarding)/role.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system/components';
import { useRouter } from 'expo-router';

const RoleScreen = () => {
  const router = useRouter();

  const handleRoleSelect = (role: 'musician' | 'parent' | 'both') => {
    // TODO: Save role to userStore when store actions are implemented
    router.push('/(onboarding)/genres');
  };

  return (
    <View style={styles.container}>
      <Text variant="2xl">I am a...</Text>
      <Button
        label="Musician"
        onPress={() => handleRoleSelect('musician')}
        accessibilityRole="button"
        accessibilityLabel="Select musician role"
      />
      <Button
        label="Parent"
        onPress={() => handleRoleSelect('parent')}
        accessibilityRole="button"
        accessibilityLabel="Select parent role"
      />
      <Button
        label="Both"
        onPress={() => handleRoleSelect('both')}
        accessibilityRole="button"
        accessibilityLabel="Select both musician and parent role"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
});

export default RoleScreen;
```

- [ ] **Step 4: Create Genres screen**

Create `app/(onboarding)/genres.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system/components';
import { useRouter } from 'expo-router';
import { useUserStore } from '@libs/stores/user-store';

const GenresScreen = () => {
  const router = useRouter();
  const role = useUserStore((state) => state.profile.role);

  const handleContinue = () => {
    if (role === 'parent' || role === 'both') {
      router.push('/(onboarding)/baby-age');
    } else {
      // TODO: Call userStore.completeOnboarding() when implemented
      router.replace('/(tabs)/learn');
    }
  };

  const handleSkip = () => {
    if (role === 'parent' || role === 'both') {
      router.push('/(onboarding)/baby-age');
    } else {
      router.replace('/(tabs)/learn');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="2xl">Genre Preferences</Text>
      <Text variant="md">Select genres you enjoy (multi-select)</Text>
      {/* TODO: Genre multi-select UI in feature epic */}
      <Button
        label="Continue"
        onPress={handleContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue to next step"
      />
      <Button
        label="Skip"
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip genre selection"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
});

export default GenresScreen;
```

- [ ] **Step 5: Create Baby Age screen**

Create `app/(onboarding)/baby-age.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system/components';
import { useRouter } from 'expo-router';

const BabyAgeScreen = () => {
  const router = useRouter();

  const handleContinue = () => {
    // TODO: Call userStore.completeOnboarding() when implemented
    router.replace('/(tabs)/learn');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/learn');
  };

  return (
    <View style={styles.container}>
      <Text variant="2xl">Baby's Age</Text>
      <Text variant="md">How old is your baby?</Text>
      {/* TODO: Age input UI in feature epic */}
      <Button
        label="Continue"
        onPress={handleContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue with baby age"
      />
      <Button
        label="Skip"
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip baby age input"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
});

export default BabyAgeScreen;
```

- [ ] **Step 6: Verify all onboarding files exist**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
ls app/\(onboarding\)/_layout.tsx app/\(onboarding\)/index.tsx app/\(onboarding\)/role.tsx app/\(onboarding\)/genres.tsx app/\(onboarding\)/baby-age.tsx
```

Expected: All 5 files listed.

- [ ] **Step 7: Commit**

```bash
git add app/\(onboarding\)/
git commit -m "$(cat <<'EOF'
feat(nav): add onboarding route group with 4 screens

Create onboarding stack layout with Welcome, Role, Genres, and Baby Age
screens. Welcome disables back gesture. Genres/Baby Age have skip option.
Baby Age only reachable when role is 'parent' or 'both'. Placeholder UI
for all screens -- feature content in later epic.
EOF
)"
```

---

### Task 11: Not-Found Screen

**Files:**
- Create: `app/+not-found.tsx`

- [ ] **Step 1: Create not-found screen**

Create `app/+not-found.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system/components';
import { Link, Stack } from 'expo-router';

const NotFoundScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Not Found' }} />
    <View style={styles.container}>
      <Text variant="2xl">Page Not Found</Text>
      <Text variant="md">This screen does not exist.</Text>
      <Link href="/(tabs)/learn" asChild>
        <Button
          label="Go to Learn"
          accessibilityRole="link"
          accessibilityLabel="Navigate back to the Learn tab"
        />
      </Link>
    </View>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
});

export default NotFoundScreen;
```

- [ ] **Step 2: Commit**

```bash
git add app/+not-found.tsx
git commit -m "$(cat <<'EOF'
feat(nav): add +not-found.tsx 404 fallback screen

Displays 'Page Not Found' with a link back to the Learn tab.
EOF
)"
```

---

## Chunk 5: BottomSheetContainer, Deep Links & Verification

### Task 12: BottomSheetContainer Wrapper Component

**Files:**
- Create: `src/design-system/components/bottom-sheet-container/types.ts`, `BottomSheetContainer.tsx`, `__tests__/BottomSheetContainer.test.tsx`, `index.ts`

- [ ] **Step 1: Write failing test**

Create `src/design-system/components/bottom-sheet-container/__tests__/BottomSheetContainer.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BottomSheetContainer } from '../BottomSheetContainer';

describe('BottomSheetContainer', () => {
  it('renders children', () => {
    render(
      <BottomSheetContainer snapPoints={['30%', '60%']}>
        <Text>Sheet Content</Text>
      </BottomSheetContainer>,
    );
    expect(screen.getByText('Sheet Content')).toBeTruthy();
  });

  it('accepts snapPoints prop', () => {
    const { toJSON } = render(
      <BottomSheetContainer snapPoints={['30%', '60%', '90%']}>
        <Text>Content</Text>
      </BottomSheetContainer>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with default snap points when none provided', () => {
    const { toJSON } = render(
      <BottomSheetContainer>
        <Text>Content</Text>
      </BottomSheetContainer>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('exposes ref with expand and close methods', () => {
    const ref = React.createRef<{ expand: () => void; close: () => void }>();
    render(
      <BottomSheetContainer ref={ref} snapPoints={['50%']}>
        <Text>Content</Text>
      </BottomSheetContainer>,
    );
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.expand).toBe('function');
    expect(typeof ref.current?.close).toBe('function');
  });
});
```

- [ ] **Step 2: Run test -- expect failure**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/design-system/components/bottom-sheet-container/__tests__/BottomSheetContainer.test.tsx --no-coverage 2>&1 | tail -5
```

Expected: `Cannot find module '../BottomSheetContainer'`

- [ ] **Step 3: Create types**

Create `src/design-system/components/bottom-sheet-container/types.ts`:

```typescript
import type { ReactNode } from 'react';

interface BottomSheetContainerProps {
  /** Content rendered inside the bottom sheet */
  children: ReactNode;

  /** Snap points as percentages or pixel values. Default: ['30%', '60%', '90%'] */
  snapPoints?: (string | number)[];

  /** Called when the sheet is dismissed */
  onDismiss?: () => void;

  /** Whether the backdrop is tappable to dismiss. Default: true */
  enableBackdropDismiss?: boolean;
}

interface BottomSheetContainerRef {
  expand: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

export type { BottomSheetContainerProps, BottomSheetContainerRef };
```

- [ ] **Step 4: Implement BottomSheetContainer**

Create `src/design-system/components/bottom-sheet-container/BottomSheetContainer.tsx`:

```typescript
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetContainerProps, BottomSheetContainerRef } from './types';

const DEFAULT_SNAP_POINTS = ['30%', '60%', '90%'];

/**
 * Reusable bottom sheet wrapper built on @gorhom/bottom-sheet.
 *
 * Features own the sheet content. The navigation shell provides this container.
 * Configurable snap points (default: 30%, 60%, 90%).
 * Semi-transparent backdrop, tappable to dismiss.
 * Visible drag handle at top.
 */
const BottomSheetContainer = forwardRef<BottomSheetContainerRef, BottomSheetContainerProps>(
  ({ children, snapPoints, onDismiss, enableBackdropDismiss = true }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const resolvedSnapPoints = useMemo(
      () => snapPoints ?? DEFAULT_SNAP_POINTS,
      [snapPoints],
    );

    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
      snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    }));

    const renderBackdrop = useCallback(
      (props: Record<string, unknown>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior={enableBackdropDismiss ? 'close' : 'none'}
        />
      ),
      [enableBackdropDismiss],
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={resolvedSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#94A3B8' }}
        onClose={onDismiss}
        index={-1}
      >
        <BottomSheetView>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

BottomSheetContainer.displayName = 'BottomSheetContainer';

export { BottomSheetContainer };
```

- [ ] **Step 5: Create barrel export**

Create `src/design-system/components/bottom-sheet-container/index.ts`:

```typescript
export { BottomSheetContainer } from './BottomSheetContainer';
export type { BottomSheetContainerProps, BottomSheetContainerRef } from './types';
```

- [ ] **Step 6: Run test -- expect pass**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/design-system/components/bottom-sheet-container/__tests__/BottomSheetContainer.test.tsx --no-coverage
```

Expected: All 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/components/bottom-sheet-container/
git commit -m "$(cat <<'EOF'
feat(nav): add BottomSheetContainer wrapper component

Reusable bottom sheet built on @gorhom/bottom-sheet with configurable
snap points (default 30%/60%/90%), dismissible backdrop, and drag handle.
Exposes expand/close/snapToIndex via ref.
EOF
)"
```

---

### Task 13: Deep Link Configuration

**Files:**
- Modify: `app.json`

- [ ] **Step 1: Add scheme to app.json**

Add or update the `scheme` field in `app.json` under the `expo` key:

```json
{
  "expo": {
    "scheme": "groovecore"
  }
}
```

> Expo Router handles deep link resolution automatically based on the file structure. No custom linking configuration is needed for MVP.

- [ ] **Step 2: Verify app.json is valid JSON**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
node -e "const json = require('./app.json'); console.log('scheme:', json.expo.scheme);"
```

Expected: `scheme: groovecore`

- [ ] **Step 3: Write a smoke test for deep link config**

Create `src/navigation/__tests__/deep-link-config.test.ts`:

```typescript
import appJson from '../../../app.json';

describe('deep link configuration', () => {
  it('has groovecore:// scheme configured in app.json', () => {
    expect(appJson.expo.scheme).toBe('groovecore');
  });

  it('scheme is a string (not an array)', () => {
    expect(typeof appJson.expo.scheme).toBe('string');
  });
});
```

- [ ] **Step 4: Run test -- expect pass**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/__tests__/deep-link-config.test.ts --no-coverage
```

Expected: Both tests pass.

- [ ] **Step 5: Commit**

```bash
git add app.json src/navigation/__tests__/deep-link-config.test.ts
git commit -m "$(cat <<'EOF'
feat(nav): configure groovecore:// deep link scheme in app.json

Add scheme: 'groovecore' to expo config. Expo Router auto-resolves
deep links based on file structure (e.g., groovecore://learn/3-2).
EOF
)"
```

---

### Task 14: Full Test Suite Verification

This task runs the complete test suite and verifies the file structure is correct.

- [ ] **Step 1: Run all navigation tests**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/navigation/ --no-coverage --verbose
```

Expected: All tests pass:
- `constants.test.ts` -- 10+ assertions
- `use-baby-tab-visible.test.ts` -- 4 tests
- `use-baby-palette.test.ts` -- 3 tests
- `use-keep-awake-while-playing.test.ts` -- 5 tests
- `deep-link-config.test.ts` -- 2 tests

- [ ] **Step 2: Run BottomSheetContainer tests**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest src/design-system/components/bottom-sheet-container/ --no-coverage --verbose
```

Expected: All 4 tests pass.

- [ ] **Step 3: Run full project test suite**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx jest --no-coverage 2>&1 | tail -20
```

Expected: All tests pass (including tests from Epic 0).

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx tsc --noEmit --pretty
```

Expected: No TypeScript errors.

- [ ] **Step 5: Verify complete file structure**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
find app -name "*.tsx" | sort
```

Expected output:
```
app/(onboarding)/_layout.tsx
app/(onboarding)/baby-age.tsx
app/(onboarding)/genres.tsx
app/(onboarding)/index.tsx
app/(onboarding)/role.tsx
app/(tabs)/_layout.tsx
app/(tabs)/baby/_layout.tsx
app/(tabs)/baby/duet-tap.tsx
app/(tabs)/baby/index.tsx
app/(tabs)/baby/visualizer.tsx
app/(tabs)/learn/_layout.tsx
app/(tabs)/learn/[polyrhythmId]/index.tsx
app/(tabs)/learn/[polyrhythmId]/lesson.tsx
app/(tabs)/learn/index.tsx
app/(tabs)/practice/_layout.tsx
app/(tabs)/practice/disappearing-beat.tsx
app/(tabs)/practice/index.tsx
app/(tabs)/progress/_layout.tsx
app/(tabs)/progress/index.tsx
app/(tabs)/settings/_layout.tsx
app/(tabs)/settings/index.tsx
app/_layout.tsx
app/+not-found.tsx
```

- [ ] **Step 6: Verify URL route mapping**

Manually verify all specified routes from the spec are covered:

| Route | File | Status |
|-------|------|--------|
| `/learn` | `app/(tabs)/learn/index.tsx` | Created |
| `/learn/3-2` | `app/(tabs)/learn/[polyrhythmId]/index.tsx` | Created |
| `/learn/3-2/lesson` | `app/(tabs)/learn/[polyrhythmId]/lesson.tsx` | Created |
| `/practice` | `app/(tabs)/practice/index.tsx` | Created |
| `/practice/disappearing-beat` | `app/(tabs)/practice/disappearing-beat.tsx` | Created |
| `/baby` | `app/(tabs)/baby/index.tsx` | Created |
| `/baby/duet-tap` | `app/(tabs)/baby/duet-tap.tsx` | Created |
| `/baby/visualizer` | `app/(tabs)/baby/visualizer.tsx` | Created |
| `/progress` | `app/(tabs)/progress/index.tsx` | Created |
| `/settings` | `app/(tabs)/settings/index.tsx` | Created |
| `+not-found` | `app/+not-found.tsx` | Created |
| `(onboarding)/` | `app/(onboarding)/index.tsx` | Created |
| `(onboarding)/role` | `app/(onboarding)/role.tsx` | Created |
| `(onboarding)/genres` | `app/(onboarding)/genres.tsx` | Created |
| `(onboarding)/baby-age` | `app/(onboarding)/baby-age.tsx` | Created |

All 15 routes accounted for.

- [ ] **Step 7: Lint check**

```bash
cd /Users/chao.fan/Desktop/dev/jetstream-ci-scripts/master-the-groove
npx eslint src/navigation/ --ext .ts,.tsx 2>&1 | tail -10
```

Expected: No lint errors.

---

## Summary

### What This Epic Delivers

1. **Root layout** (`app/_layout.tsx`) -- provider stack (Theme, Gesture, SafeArea, BottomSheet, Localization), splash screen lifecycle, onboarding gate
2. **Tab navigator** (`app/(tabs)/_layout.tsx`) -- 5 tabs with MaterialCommunityIcons, animated baby palette transition
3. **Per-tab stacks** -- Learn (3-level), Practice (2-level), Baby (3-level), Progress (1-level), Settings (1-level)
4. **Placeholder screens** -- 10 tab screens + 4 onboarding screens + 1 not-found screen = 15 route files
5. **Navigation hooks:**
   - `useBabyTabVisible` -- conditional baby tab based on `userStore.profile.role`
   - `useBabyPalette` -- animated 200ms color transition for tab bar
   - `useKeepAwakeWhilePlaying` -- keep-awake tied to `audioStore.isPlaying` or always-on option
6. **BottomSheetContainer** -- reusable wrapper with configurable snap points
7. **Deep linking** -- `groovecore://` scheme in `app.json`
8. **Dependencies installed** -- `expo-keep-awake`, `@gorhom/bottom-sheet`, `@expo/vector-icons`

### Test Coverage

| Test File | Tests |
|-----------|-------|
| `constants.test.ts` | Tab config shape, tab order, style values |
| `use-baby-tab-visible.test.ts` | 4 tests: parent/both/musician roles + non-onboarded default |
| `use-baby-palette.test.ts` | 3 tests: default palette, baby palette, property shape |
| `use-keep-awake-while-playing.test.ts` | 5 tests: playing/not-playing, unmount cleanup, always option |
| `BottomSheetContainer.test.tsx` | 4 tests: renders children, snap points, defaults, ref methods |
| `deep-link-config.test.ts` | 2 tests: scheme value and type |

**Total: ~18 tests across 6 test files.**

### Commit History (Expected)

```
feat(nav): install navigation dependencies and create jest mocks
feat(nav): add navigation constants for tab config and header styles
feat(nav): add useBabyTabVisible hook for conditional baby tab
feat(nav): add useBabyPalette hook for animated tab bar color transition
feat(nav): add useKeepAwakeWhilePlaying hook
feat(nav): implement root layout with providers and onboarding gate
feat(nav): implement tab layout with 5 tabs and baby palette transition
feat(nav): add per-tab stack layouts for all 5 tabs
feat(nav): add placeholder screens for all tab routes
feat(nav): add onboarding route group with 4 screens
feat(nav): add +not-found.tsx 404 fallback screen
feat(nav): add BottomSheetContainer wrapper component
feat(nav): configure groovecore:// deep link scheme in app.json
```

13 incremental commits, each representing a single logical change.
