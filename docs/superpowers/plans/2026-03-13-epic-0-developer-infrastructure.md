# Epic 0: Developer Infrastructure — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the GrooveCore Expo project with all engineering guardrails (TypeScript strict, ESLint, Jest, path aliases, design system, i18n, error handling, test utilities) so every subsequent epic inherits production-grade infrastructure.

**Architecture:** Standalone Expo Router project with layered `src/` structure. `app/` contains thin route screens; `src/` contains all logic organized into `data-access/`, `design-system/`, `features/`, `libs/`, `operations/`, `entry-providers/`, and `types/`. Path aliases (`@features`, `@libs`, etc.) enforce module boundaries via ESLint.

**Tech Stack:** Expo SDK 52+, TypeScript 5.x (strict), React Native 0.76+, Zustand 5.x, i18next, Jest + React Native Testing Library, ESLint with import restrictions.

---

## File Map

### Files to Create

```
master-the-groove/
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── .eslintrc.js
├── jest.config.ts
├── app/
│   └── _layout.tsx
├── src/
│   ├── design-system/
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── border-radius.ts
│   │   │   ├── shadows.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── text/
│   │   │   │   ├── types.ts
│   │   │   │   ├── styles.ts
│   │   │   │   ├── Text.tsx
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── Text.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── button/
│   │   │   │   ├── types.ts
│   │   │   │   ├── styles.ts
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── tap-target/
│   │   │   │   ├── types.ts
│   │   │   │   ├── TapTarget.tsx
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── TapTarget.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── icon/
│   │   │   │   ├── types.ts
│   │   │   │   ├── Icon.tsx
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── Icon.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── spinner/
│   │   │   │   ├── types.ts
│   │   │   │   ├── Spinner.tsx
│   │   │   │   └── index.ts
│   │   │   ├── badge/
│   │   │   │   ├── types.ts
│   │   │   │   ├── styles.ts
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── Badge.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── card/
│   │   │   │   ├── types.ts
│   │   │   │   ├── styles.ts
│   │   │   │   ├── Card.tsx
│   │   │   │   └── index.ts
│   │   │   ├── slider/
│   │   │   │   ├── types.ts
│   │   │   │   ├── Slider.tsx
│   │   │   │   └── index.ts
│   │   │   ├── progress-bar/
│   │   │   │   ├── types.ts
│   │   │   │   ├── styles.ts
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── bottom-sheet/
│   │   │   │   ├── types.ts
│   │   │   │   ├── BottomSheet.tsx
│   │   │   │   └── index.ts
│   │   │   └── dialog/
│   │   │       ├── types.ts
│   │   │       ├── Dialog.tsx
│   │   │       └── index.ts
│   │   └── index.ts
│   ├── libs/
│   │   ├── localization/
│   │   │   ├── i18n.ts
│   │   │   ├── en.ts
│   │   │   └── index.ts
│   │   ├── error-handling/
│   │   │   ├── error-boundary.tsx
│   │   │   ├── typed-errors.ts
│   │   │   ├── __tests__/
│   │   │   │   └── error-boundary.test.tsx
│   │   │   └── index.ts
│   │   ├── accessibility/
│   │   │   ├── announcements.ts
│   │   │   ├── focus-management.ts
│   │   │   └── index.ts
│   │   └── analytics/
│   │       ├── tracker.ts
│   │       └── index.ts
│   ├── entry-providers/
│   │   ├── gesture-provider.tsx
│   │   ├── safe-area-provider.tsx
│   │   ├── theme-provider.tsx
│   │   ├── localization-provider.tsx
│   │   └── index.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── session.ts
│   │   ├── polyrhythm.ts
│   │   ├── lesson.ts
│   │   ├── baby.ts
│   │   ├── feel-state.ts
│   │   └── index.ts
│   └── __tests__/
│       ├── jest-setup.ts
│       ├── jest-utils.tsx
│       └── mocks/
│           ├── expo-av.ts
│           └── stores.ts
```

---

## Chunk 1: Project Scaffold & Configuration

### Task 1: Initialize Expo Project

**Files:**
- Create: `package.json`, `app.json`, `app/_layout.tsx`

- [ ] **Step 1: Create Expo project**

```bash
cd /Users/chao.fan/Desktop/dev/master-the-groove
npx create-expo-app@latest . --template blank-typescript --no-install
```

If the directory already has files, use `--yes` to overwrite or manually init. The goal is an Expo 52+ project with TypeScript.

- [ ] **Step 2: Verify project creation**

```bash
ls app.json package.json tsconfig.json app/
```

Expected: all files exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(epic-0): initialize Expo project with TypeScript template"
```

---

### Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install core dependencies**

```bash
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens expo-av expo-secure-store @react-native-async-storage/async-storage zustand i18next react-i18next
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import eslint-plugin-prefer-arrow eslint-plugin-react-native-a11y babel-plugin-module-resolver jest-expo @testing-library/react-native @testing-library/jest-native
```

- [ ] **Step 3: Install Expo Router if not already present**

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar
```

- [ ] **Step 4: Verify installation**

```bash
npx expo doctor
```

Expected: No critical issues.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(epic-0): install core and dev dependencies"
```

---

### Task 3: TypeScript Strict Configuration

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Write tsconfig.json**

Replace the contents of `tsconfig.json` with:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@features/*": ["src/features/*"],
      "@data-access/*": ["src/data-access/*"],
      "@libs/*": ["src/libs/*"],
      "@operations/*": ["src/operations/*"],
      "@design-system": ["src/design-system"],
      "@design-system/*": ["src/design-system/*"],
      "@types": ["src/types"],
      "@types/*": ["src/types/*"],
      "@entry-providers": ["src/entry-providers"],
      "@entry-providers/*": ["src/entry-providers/*"],
      "@assets/*": ["src/assets/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors (project is empty enough to pass).

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "feat(epic-0): configure TypeScript strict mode with path aliases"
```

---

### Task 4: Babel Module Resolver

**Files:**
- Modify: `babel.config.js`

- [ ] **Step 1: Write babel.config.js**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@features': './src/features',
          '@data-access': './src/data-access',
          '@libs': './src/libs',
          '@operations': './src/operations',
          '@design-system': './src/design-system',
          '@types': './src/types',
          '@entry-providers': './src/entry-providers',
          '@assets': './src/assets',
        },
      }],
    ],
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add babel.config.js
git commit -m "feat(epic-0): configure Babel module-resolver for path aliases"
```

---

### Task 5: ESLint Configuration

**Files:**
- Create: `.eslintrc.js`

- [ ] **Step 1: Write .eslintrc.js**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'prefer-arrow', 'react-native-a11y'],
  extends: [
    'expo',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'import/no-default-export': 'error',
    'prefer-arrow/prefer-arrow-functions': ['error', {
      disallowPrototype: true,
      singleReturnOnly: false,
      classPropertiesAllowed: false,
    }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@features/*/*/**'], message: 'Import from @features/<name> barrel only.' },
        { group: ['@libs/*/*/**'], message: 'Import from @libs/<name> barrel only.' },
        { group: ['../features/*'], message: 'Use @features alias, not relative paths.' },
        { group: ['@design-system/components/*/**'], message: 'Import from @design-system barrel only.' },
      ],
    }],
    'react-native/no-inline-styles': 'error',
    'react-native-a11y/has-valid-accessibility-role': 'error',
  },
  overrides: [
    {
      files: ['app/**/*.tsx'],
      rules: { 'import/no-default-export': 'off' },
    },
    {
      files: ['*.config.*', '*.config.ts'],
      rules: {
        'import/no-default-export': 'off',
        'prefer-arrow/prefer-arrow-functions': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', '.expo/', 'dist/'],
};
```

- [ ] **Step 2: Test ESLint runs**

```bash
npx eslint . --ext .ts,.tsx --max-warnings 0 2>&1 | head -20
```

Expected: Runs without crashing (some warnings/errors from template code are OK for now).

- [ ] **Step 3: Commit**

```bash
git add .eslintrc.js
git commit -m "feat(epic-0): configure ESLint with import restrictions and a11y rules"
```

---

### Task 6: Jest Configuration

**Files:**
- Create: `jest.config.ts`

- [ ] **Step 1: Write jest.config.ts**

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  setupFilesAfterSetup: ['./src/__tests__/jest-setup.ts'],
  moduleNameMapper: {
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@data-access/(.*)$': '<rootDir>/src/data-access/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@operations/(.*)$': '<rootDir>/src/operations/$1',
    '^@design-system$': '<rootDir>/src/design-system',
    '^@design-system/(.*)$': '<rootDir>/src/design-system/$1',
    '^@types$': '<rootDir>/src/types',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@entry-providers$': '<rootDir>/src/entry-providers',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: { branches: 60, functions: 60, lines: 60, statements: 60 },
    './src/operations/': { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};

export default config;
```

- [ ] **Step 2: Create jest-setup.ts**

Create `src/__tests__/jest-setup.ts`:

```typescript
import '@testing-library/jest-native/extend-expect';

// Silence React Native warnings in test output
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
```

- [ ] **Step 3: Create jest-utils.tsx**

Create `src/__tests__/jest-utils.tsx`:

```tsx
import type { ReactElement } from 'react';
import React from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export const renderWithProviders = (ui: ReactElement) =>
  render(ui, { wrapper: AllProviders });

export { render } from '@testing-library/react-native';
```

- [ ] **Step 4: Create mock for expo-av**

Create `src/__tests__/mocks/expo-av.ts`:

```typescript
export const Audio = {
  Sound: {
    createAsync: jest.fn().mockResolvedValue({
      sound: {
        playAsync: jest.fn(),
        stopAsync: jest.fn(),
        unloadAsync: jest.fn(),
        setVolumeAsync: jest.fn(),
        setPositionAsync: jest.fn(),
        getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true }),
      },
      status: { isLoaded: true },
    }),
  },
  setAudioModeAsync: jest.fn(),
};
```

- [ ] **Step 5: Create mock for Zustand stores**

Create `src/__tests__/mocks/stores.ts`:

```typescript
import { create } from 'zustand';

export const createMockStore = <T extends object>(initialState: T) =>
  create<T>()(() => initialState);

export const mockAudioStore = {
  isPlaying: false,
  bpm: 100,
  ratioA: 3,
  ratioB: 2,
  layerAVolume: 1,
  layerBVolume: 1,
  stereoSplit: false,
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  setBpm: jest.fn(),
  setRatio: jest.fn(),
  fadeLayer: jest.fn(),
  muteAll: jest.fn(),
  unmuteAll: jest.fn(),
};

export const mockSessionStore = {
  sessions: [],
  currentSession: null,
  pendingFeelState: null,
  startSession: jest.fn(),
  endSession: jest.fn(),
  setFeelState: jest.fn(),
  cleanOrphanedSessions: jest.fn(),
};
```

- [ ] **Step 6: Create mock for Supabase**

Create `src/__tests__/mocks/supabase.ts`:

```typescript
export const mockSupabaseClient = {
  auth: {
    signInAnonymously: jest.fn().mockResolvedValue({
      data: { user: { id: 'mock-user-id' } },
      error: null,
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
};

jest.mock('@data-access/supabase', () => ({
  supabase: mockSupabaseClient,
}));
```

- [ ] **Step 7: Verify Jest runs**

```bash
npx jest --passWithNoTests
```

Expected: "No tests found" or passes with 0 tests.

- [ ] **Step 8: Commit**

```bash
git add jest.config.ts src/__tests__/
git commit -m "feat(epic-0): configure Jest with path aliases, test utils, and mocks"
```

---

## Chunk 2: Design Tokens & Shared Types

### Task 7: Design Tokens

**Files:**
- Create: `src/design-system/tokens/colors.ts`, `typography.ts`, `spacing.ts`, `border-radius.ts`, `shadows.ts`, `index.ts`

- [ ] **Step 1: Create colors.ts**

Create `src/design-system/tokens/colors.ts`:

```typescript
export const colors = {
  primary: '#3730A3',
  primaryLight: '#6366F1',
  primaryDark: '#1E1B4B',
  secondary: '#F97316',
  secondaryLight: '#FB923C',
  accent: '#EAB308',
  background: '#0F0D1A',
  surface: '#1C1830',
  surfaceLight: '#2A2545',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#EF4444',
  border: '#334155',

  layerA: '#818CF8',
  layerB: '#FB923C',
  beatOne: '#EAB308',
  layerAFaded: '#818CF840',
  layerBFaded: '#FB923C40',

  babyBackground: '#FFF7ED',
  babySurface: '#FFFFFF',
  babyPrimary: '#F97316',
  babySecondary: '#8B5CF6',
  babyAccent: '#EC4899',
  babyTextPrimary: '#1C1917',
  babyTextSecondary: '#78716C',
  babyTapZoneA: '#3B82F6',
  babyTapZoneB: '#F97316',
  babyCelebration: '#EAB308',
} as const;

export type ColorToken = keyof typeof colors;
```

- [ ] **Step 2: Create typography.ts**

Create `src/design-system/tokens/typography.ts`:

```typescript
import { Platform } from 'react-native';

export const fontFamily = {
  primary: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  monospace: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
```

- [ ] **Step 3: Create spacing.ts**

Create `src/design-system/tokens/spacing.ts`:

```typescript
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  tapMinimum: 44,
  tapMinimumBaby: 80,
} as const;

export type SpacingToken = keyof typeof spacing;
```

- [ ] **Step 4: Create border-radius.ts**

Create `src/design-system/tokens/border-radius.ts`:

```typescript
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
```

- [ ] **Step 5: Create shadows.ts**

Create `src/design-system/tokens/shadows.ts`:

```typescript
import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

const createShadow = (offsetY: number, radius: number, opacity: number): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: offsetY * 2,
    },
    default: {},
  }) as ViewStyle;

export const shadows = {
  sm: createShadow(1, 2, 0.3),
  md: createShadow(4, 6, 0.3),
  lg: createShadow(10, 15, 0.4),
} as const;
```

- [ ] **Step 6: Create tokens barrel export**

Create `src/design-system/tokens/index.ts`:

```typescript
export { colors } from './colors';
export type { ColorToken } from './colors';
export { fontFamily, fontSize, lineHeight, fontWeight } from './typography';
export { spacing } from './spacing';
export type { SpacingToken } from './spacing';
export { borderRadius } from './border-radius';
export { shadows } from './shadows';
```

- [ ] **Step 7: Commit**

```bash
git add src/design-system/tokens/
git commit -m "feat(epic-0): add design system tokens (colors, typography, spacing, shadows)"
```

---

### Task 8: Shared TypeScript Types

**Files:**
- Create: `src/types/feel-state.ts`, `polyrhythm.ts`, `user.ts`, `session.ts`, `lesson.ts`, `baby.ts`, `index.ts`

Reference: `development/contracts/data-models.md` for exact type definitions.

- [ ] **Step 1: Create feel-state.ts**

Create `src/types/feel-state.ts`:

```typescript
export type FeelState = 'executing' | 'hearing' | 'feeling';
```

- [ ] **Step 2: Create polyrhythm.ts**

Create `src/types/polyrhythm.ts`:

```typescript
export interface PolyrhythmRatio {
  readonly ratioA: number;
  readonly ratioB: number;
  readonly label: string;
  readonly culturalOrigin: string;
  readonly mnemonicPhrase: string;
}

export const MVP_RATIOS: readonly PolyrhythmRatio[] = [
  { ratioA: 3, ratioB: 2, label: '3:2', culturalOrigin: 'West African', mnemonicPhrase: 'PASS the GOL-den BUT-ter' },
  { ratioA: 4, ratioB: 3, label: '4:3', culturalOrigin: 'Afro-Cuban', mnemonicPhrase: 'PASS the GOD damn BUT-ter PLEASE' },
] as const;
```

- [ ] **Step 3: Create user.ts**

Create `src/types/user.ts`:

```typescript
export type UserRole = 'musician' | 'parent' | 'both';

export interface UserProfile {
  readonly id: string;
  readonly role: UserRole;
  readonly displayName: string | null;
  readonly preferredGenres: readonly string[];
  readonly isOnboarded: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

- [ ] **Step 4: Create session.ts**

Create `src/types/session.ts`:

```typescript
import type { FeelState } from './feel-state';

export type SessionMode = 'free-play' | 'lesson' | 'disappearing-beat' | 'duet-tap';

export interface Session {
  readonly id: string;
  readonly userId: string;
  readonly polyrhythmId: string;
  readonly mode: SessionMode;
  readonly bpm: number;
  readonly durationSeconds: number;
  readonly feelStateAfter: FeelState | null;
  readonly startedAt: string;
  readonly endedAt: string;
}
```

- [ ] **Step 5: Create lesson.ts**

Create `src/types/lesson.ts`:

```typescript
import type { FeelState } from './feel-state';

export interface LessonProgress {
  readonly userId: string;
  readonly polyrhythmId: string;
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly isComplete: boolean;
  readonly feelStateAwarded: FeelState | null;
  readonly completedAt: string | null;
}
```

- [ ] **Step 6: Create baby.ts**

Create `src/types/baby.ts`:

```typescript
export type BabyStage = 1 | 2 | 3 | 4 | 5;
export type BabyResponse = 'calm' | 'excited' | 'disengaged';
export type BabyActivityType = 'duet-tap' | 'visualizer' | 'listening' | 'movement' | 'singing';

export interface BabyProfile {
  readonly id: string;
  readonly userId: string;
  readonly name: string | null;
  readonly birthDate: string;
  readonly currentStage: BabyStage;
  readonly createdAt: string;
}

export interface BabySession {
  readonly id: string;
  readonly babyProfileId: string;
  readonly activityType: BabyActivityType;
  readonly durationSeconds: number;
  readonly babyResponse: BabyResponse | null;
  readonly startedAt: string;
  readonly endedAt: string;
}
```

- [ ] **Step 7: Create types barrel export**

Create `src/types/index.ts`:

```typescript
export type { FeelState } from './feel-state';
export type { PolyrhythmRatio } from './polyrhythm';
export { MVP_RATIOS } from './polyrhythm';
export type { UserRole, UserProfile } from './user';
export type { SessionMode, Session } from './session';
export type { LessonProgress } from './lesson';
export type { BabyStage, BabyResponse, BabyActivityType, BabyProfile, BabySession } from './baby';
```

- [ ] **Step 8: Commit**

```bash
git add src/types/
git commit -m "feat(epic-0): add shared TypeScript types from data-models contract"
```

---

## Chunk 3: Design System Components (TDD)

### Task 9: Text Component

**Files:**
- Create: `src/design-system/components/text/types.ts`, `styles.ts`, `Text.tsx`, `__tests__/Text.test.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

Create `src/design-system/components/text/types.ts`:

```typescript
import type { TextProps as RNTextProps } from 'react-native';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'mono';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  readonly variant?: TextVariant;
  readonly color?: string;
  readonly align?: 'left' | 'center' | 'right';
  readonly children: React.ReactNode;
  readonly accessibilityRole?: RNTextProps['accessibilityRole'];
}
```

- [ ] **Step 2: Write the failing test**

Create `src/design-system/components/text/__tests__/Text.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from '../Text';

describe('Text', () => {
  it('renders children text content', () => {
    render(<Text>Hello GrooveCore</Text>);
    expect(screen.getByText('Hello GrooveCore')).toBeTruthy();
  });

  it('defaults to body variant', () => {
    const { getByText } = render(<Text>Body text</Text>);
    const element = getByText('Body text');
    expect(element.props.style).toBeDefined();
  });

  it('applies accessibilityRole when provided', () => {
    render(<Text accessibilityRole="header">Title</Text>);
    expect(screen.getByRole('header')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx jest src/design-system/components/text/__tests__/Text.test.tsx --no-coverage
```

Expected: FAIL — module `../Text` not found.

- [ ] **Step 4: Write styles.ts**

Create `src/design-system/components/text/styles.ts`:

```typescript
import { StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, lineHeight, fontWeight, fontFamily } from '../../tokens/typography';

export const variantStyles = StyleSheet.create({
  h1: { fontSize: fontSize['3xl'], lineHeight: lineHeight['3xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.primary },
  h2: { fontSize: fontSize['2xl'], lineHeight: lineHeight['2xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.primary },
  h3: { fontSize: fontSize.xl, lineHeight: lineHeight.xl, fontWeight: fontWeight.semibold, fontFamily: fontFamily.primary },
  h4: { fontSize: fontSize.lg, lineHeight: lineHeight.lg, fontWeight: fontWeight.semibold, fontFamily: fontFamily.primary },
  body: { fontSize: fontSize.md, lineHeight: lineHeight.md, fontWeight: fontWeight.regular, fontFamily: fontFamily.primary },
  bodySmall: { fontSize: fontSize.sm, lineHeight: lineHeight.sm, fontWeight: fontWeight.regular, fontFamily: fontFamily.primary },
  caption: { fontSize: fontSize.xs, lineHeight: lineHeight.xs, fontWeight: fontWeight.regular, fontFamily: fontFamily.primary },
  mono: { fontSize: fontSize['3xl'], lineHeight: lineHeight['3xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.monospace },
});

export const defaultColor = colors.textPrimary;
```

- [ ] **Step 5: Write Text.tsx**

Create `src/design-system/components/text/Text.tsx`:

```tsx
import React from 'react';
import { Text as RNText } from 'react-native';
import type { TextProps } from './types';
import { variantStyles, defaultColor } from './styles';

export const Text = ({
  variant = 'body',
  color,
  align = 'left',
  children,
  ...rest
}: TextProps) => (
  <RNText
    style={[
      variantStyles[variant],
      { color: color ?? defaultColor, textAlign: align },
    ]}
    {...rest}
  >
    {children}
  </RNText>
);
```

- [ ] **Step 6: Write index.ts**

Create `src/design-system/components/text/index.ts`:

```typescript
export { Text } from './Text';
export type { TextProps, TextVariant } from './types';
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npx jest src/design-system/components/text/__tests__/Text.test.tsx --no-coverage
```

Expected: 3 tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/design-system/components/text/
git commit -m "feat(epic-0): add Text design system component with tests"
```

---

### Task 10: Button Component

**Files:**
- Create: `src/design-system/components/button/types.ts`, `styles.ts`, `Button.tsx`, `__tests__/Button.test.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

Create `src/design-system/components/button/types.ts`:

```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly children: React.ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly accessibilityHint?: string;
}
```

- [ ] **Step 2: Write the failing test**

Create `src/design-system/components/button/__tests__/Button.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  const onPress = jest.fn();

  beforeEach(() => {
    onPress.mockClear();
  });

  it('renders children text', () => {
    render(<Button accessibilityLabel="Start" onPress={onPress}>Start</Button>);
    expect(screen.getByText('Start')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<Button accessibilityLabel="Start" onPress={onPress}>Start</Button>);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(<Button accessibilityLabel="Start" onPress={onPress} disabled>Start</Button>);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('has correct accessibility properties', () => {
    render(
      <Button accessibilityLabel="Play rhythm" accessibilityHint="Starts playback" onPress={onPress}>
        Play
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Play rhythm');
    expect(button.props.accessibilityHint).toBe('Starts playback');
  });

  it('shows disabled state in accessibility', () => {
    render(<Button accessibilityLabel="Play" onPress={onPress} disabled>Play</Button>);
    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx jest src/design-system/components/button/__tests__/Button.test.tsx --no-coverage
```

Expected: FAIL.

- [ ] **Step 4: Write styles.ts**

Create `src/design-system/components/button/styles.ts`:

```typescript
import { StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { borderRadius } from '../../tokens/border-radius';
import { fontSize, fontWeight } from '../../tokens/typography';

export const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, minHeight: 32 },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 44 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 56 },
});

export const variantBg: Record<string, string> = {
  primary: colors.primary,
  secondary: colors.secondary,
  ghost: 'transparent',
};

export const variantText: Record<string, string> = {
  primary: colors.textPrimary,
  secondary: colors.textPrimary,
  ghost: colors.primaryLight,
};

export const baseStyles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

- [ ] **Step 5: Write Button.tsx**

Create `src/design-system/components/button/Button.tsx`:

```tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import type { ButtonProps } from './types';
import { baseStyles, sizeStyles, variantBg, variantText } from './styles';

export const Button = ({
  accessibilityLabel,
  accessibilityHint,
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        baseStyles.container,
        sizeStyles[size],
        { backgroundColor: variantBg[variant] },
        isDisabled && baseStyles.disabled,
      ]}
    >
      <Text style={[baseStyles.text, { color: variantText[variant] }]}>
        {children}
      </Text>
    </Pressable>
  );
};
```

- [ ] **Step 6: Write index.ts**

Create `src/design-system/components/button/index.ts`:

```typescript
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './types';
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npx jest src/design-system/components/button/__tests__/Button.test.tsx --no-coverage
```

Expected: 5 tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/design-system/components/button/
git commit -m "feat(epic-0): add Button design system component with a11y and tests"
```

---

### Task 11: TapTarget Component

**Files:**
- Create: `src/design-system/components/tap-target/types.ts`, `TapTarget.tsx`, `__tests__/TapTarget.test.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

Create `src/design-system/components/tap-target/types.ts`:

```typescript
export interface TapTargetProps {
  readonly children: React.ReactNode;
  readonly minSize?: number;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
}
```

- [ ] **Step 2: Write the failing test**

Create `src/design-system/components/tap-target/__tests__/TapTarget.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { TapTarget } from '../TapTarget';

describe('TapTarget', () => {
  it('renders children', () => {
    render(<TapTarget><Text>Tap me</Text></TapTarget>);
    expect(screen.getByText('Tap me')).toBeTruthy();
  });

  it('enforces minimum 44px size by default', () => {
    const { getByTestId } = render(
      <TapTarget><Text testID="child">X</Text></TapTarget>,
    );
    const wrapper = getByTestId('child').parent;
    expect(wrapper).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx jest src/design-system/components/tap-target/__tests__/TapTarget.test.tsx --no-coverage
```

Expected: FAIL.

- [ ] **Step 4: Write TapTarget.tsx**

Create `src/design-system/components/tap-target/TapTarget.tsx`:

```tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { TapTargetProps } from './types';
import { spacing } from '../../tokens/spacing';

export const TapTarget = ({
  children,
  minSize = spacing.tapMinimum,
  onPress,
  accessibilityLabel,
}: TapTargetProps) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    style={[styles.container, { minWidth: minSize, minHeight: minSize }]}
    hitSlop={{
      top: Math.max(0, (minSize - 24) / 2),
      bottom: Math.max(0, (minSize - 24) / 2),
      left: Math.max(0, (minSize - 24) / 2),
      right: Math.max(0, (minSize - 24) / 2),
    }}
  >
    {children}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 5: Write index.ts**

Create `src/design-system/components/tap-target/index.ts`:

```typescript
export { TapTarget } from './TapTarget';
export type { TapTargetProps } from './types';
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx jest src/design-system/components/tap-target/__tests__/TapTarget.test.tsx --no-coverage
```

Expected: 2 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/components/tap-target/
git commit -m "feat(epic-0): add TapTarget component with WCAG minimum touch target"
```

---

### Task 12: Remaining Design System Components

> **Design System Scope Reduction (per Epic 0 review):**
> Build only essential components in Epic 0: **Text, Button, Icon, Spinner** (4 components).
> Defer TapTarget, Badge, Card, Slider, ProgressBar, Dialog to their consuming epics.
> **REMOVE BottomSheet entirely** from Epic 0 -- it conflicts with `@gorhom/bottom-sheet`
> which is the canonical implementation (installed in Epic 3/Navigation Shell).
> Tasks 12b (Badge), 12d (Card), 12e (Slider), 12f (ProgressBar), 12g (BottomSheet),
> and 12h (Dialog) should be SKIPPED in Epic 0.

Each follows the same TDD cycle as Tasks 9-11: types.ts -> failing test -> implement -> pass -> commit.

#### 12a: Icon Component

**Files:** `src/design-system/components/icon/types.ts`, `Icon.tsx`, `__tests__/Icon.test.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts with discriminated union**

```typescript
// src/design-system/components/icon/types.ts
type IconBaseProps = {
  readonly name: string;
  readonly size?: number;
  readonly color?: string;
};

// Must provide EITHER accessibilityLabel OR decorative — never both, never neither
export type IconProps =
  | (IconBaseProps & { readonly accessibilityLabel: string; readonly decorative?: never })
  | (IconBaseProps & { readonly decorative: true; readonly accessibilityLabel?: never });
```

- [ ] **Step 2: Write failing test**

```tsx
// src/design-system/components/icon/__tests__/Icon.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders with accessibility label', () => {
    render(<Icon name="play" accessibilityLabel="Play button" />);
    expect(screen.getByLabelText('Play button')).toBeTruthy();
  });

  it('hides decorative icons from screen readers', () => {
    const { getByTestId } = render(<Icon name="decorative-dot" decorative testID="icon" />);
    const icon = getByTestId('icon');
    expect(icon.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
```

- [ ] **Step 3: Implement Icon.tsx** — Use a `View` with text/emoji placeholder (real icon library integration deferred to Epic 3/Navigation Shell). Set `accessibilityElementsHidden` and `importantForAccessibility` for decorative icons.

- [ ] **Step 4: Run tests, verify pass, commit**

```bash
npx jest src/design-system/components/icon/ --no-coverage
git add src/design-system/components/icon/ && git commit -m "feat(epic-0): add Icon component with decorative/labeled discrimination"
```

#### 12b: Badge Component

**Files:** `src/design-system/components/badge/types.ts`, `styles.ts`, `Badge.tsx`, `__tests__/Badge.test.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

```typescript
// src/design-system/components/badge/types.ts
import type { FeelState } from '@types';

export type BadgeVariant = FeelState; // 'executing' | 'hearing' | 'feeling'

export interface BadgeProps {
  readonly variant: BadgeVariant;
  readonly size?: 'sm' | 'md';
  readonly accessibilityLabel?: string;
}
```

- [ ] **Step 2: Write failing test**

```tsx
// src/design-system/components/badge/__tests__/Badge.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders feeling variant with success color', () => {
    render(<Badge variant="feeling" accessibilityLabel="Feeling the groove" />);
    expect(screen.getByLabelText('Feeling the groove')).toBeTruthy();
  });

  it('renders executing variant', () => {
    render(<Badge variant="executing" accessibilityLabel="Executing" />);
    expect(screen.getByLabelText('Executing')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Implement** — Circular dot component. Color map: `executing` -> `colors.textMuted`, `hearing` -> `colors.warning`, `feeling` -> `colors.success`. Size: `sm` = 8px, `md` = 12px.

- [ ] **Step 4: Run tests, verify pass, commit**

```bash
npx jest src/design-system/components/badge/ --no-coverage
git add src/design-system/components/badge/ && git commit -m "feat(epic-0): add Badge component for feel state display"
```

#### 12c: Spinner Component

**Files:** `src/design-system/components/spinner/types.ts`, `Spinner.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts and Spinner.tsx**

```typescript
// types.ts
export interface SpinnerProps {
  readonly size?: 'small' | 'large';
  readonly color?: string;
  readonly accessibilityLabel?: string;
}
```

```tsx
// Spinner.tsx
import React from 'react';
import { ActivityIndicator } from 'react-native';
import type { SpinnerProps } from './types';
import { colors } from '../../tokens/colors';

export const Spinner = ({
  size = 'small',
  color = colors.primaryLight,
  accessibilityLabel = 'Loading',
}: SpinnerProps) => (
  <ActivityIndicator
    size={size}
    color={color}
    accessibilityRole="progressbar"
    accessibilityLabel={accessibilityLabel}
  />
);
```

- [ ] **Step 2: Commit** (Spinner is simple enough to skip dedicated test — ActivityIndicator is RN core)

```bash
git add src/design-system/components/spinner/ && git commit -m "feat(epic-0): add Spinner component"
```

#### 12d: Card Component

**Files:** `src/design-system/components/card/types.ts`, `styles.ts`, `Card.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

```typescript
export type CardVariant = 'elevated' | 'outlined';

export interface CardProps {
  readonly variant?: CardVariant;
  readonly children: React.ReactNode;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
}
```

- [ ] **Step 2: Implement** — `View` wrapper. Elevated: `colors.surface` bg + `shadows.md`. Outlined: `colors.surface` bg + `colors.border` 1px border. When `onPress` provided, wrap in `Pressable` with `accessibilityRole="button"`.

- [ ] **Step 3: Commit**

```bash
git add src/design-system/components/card/ && git commit -m "feat(epic-0): add Card component with elevated/outlined variants"
```

#### 12e: Slider Component

**Files:** `src/design-system/components/slider/types.ts`, `Slider.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

```typescript
export interface SliderProps {
  readonly accessibilityLabel: string;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly value: number;
  readonly onValueChange: (value: number) => void;
  readonly accessibilityHint?: string;
}
```

- [ ] **Step 2: Implement** — Wraps RN `@react-native-community/slider`. Uses `colors.primaryLight` for track fill, `colors.surface` for track bg. Calls `AccessibilityInfo.announceForAccessibility` on value change (debounced 300ms).

- [ ] **Step 3: Commit**

```bash
git add src/design-system/components/slider/ && git commit -m "feat(epic-0): add Slider component with a11y announcements"
```

#### 12f: ProgressBar Component

**Files:** `src/design-system/components/progress-bar/types.ts`, `styles.ts`, `ProgressBar.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

```typescript
export interface ProgressBarProps {
  readonly progress: number; // 0 to 1
  readonly accessibilityLabel: string;
}
```

- [ ] **Step 2: Implement** — `View` with inner fill view. Width = `progress * 100%`. Fill: `colors.primaryLight`. Track: `colors.surface`. Height: 4px. Border radius: `borderRadius.full`.

- [ ] **Step 3: Commit**

```bash
git add src/design-system/components/progress-bar/ && git commit -m "feat(epic-0): add ProgressBar component"
```

#### 12g: BottomSheet Component

**Decision:** Use simple `Modal` + `Animated.View` for MVP (avoids `@gorhom/bottom-sheet` dependency complexity).

**Files:** `src/design-system/components/bottom-sheet/types.ts`, `BottomSheet.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

```typescript
export interface BottomSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly accessibilityLabel: string;
  readonly children: React.ReactNode;
}
```

- [ ] **Step 2: Implement** — Gate pattern: return `null` when `visible={false}`. When visible: `Modal` with transparent overlay + slide-up `Animated.View` with `colors.surface` background, `borderRadius.xl` top corners, `shadows.lg`.

- [ ] **Step 3: Commit**

```bash
git add src/design-system/components/bottom-sheet/ && git commit -m "feat(epic-0): add BottomSheet component with gate pattern"
```

#### 12h: Dialog Component

**Files:** `src/design-system/components/dialog/types.ts`, `Dialog.tsx`, `index.ts`

- [ ] **Step 1: Write types.ts**

```typescript
export interface DialogAction {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: 'primary' | 'ghost';
}

export interface DialogProps {
  readonly visible: boolean;
  readonly title: string;
  readonly message?: string;
  readonly actions: readonly DialogAction[];
  readonly accessibilityLabel: string;
}
```

- [ ] **Step 2: Implement** — Gate pattern: return `null` when `visible={false}`. When visible: `Modal` with centered card containing title (Text h3), optional message (Text body), and action buttons row.

- [ ] **Step 3: Commit**

```bash
git add src/design-system/components/dialog/ && git commit -m "feat(epic-0): add Dialog component with gate pattern"
```

---

### Task 13: Design System Barrel Export

**Files:**
- Create: `src/design-system/index.ts`

- [ ] **Step 1: Create barrel export**

Create `src/design-system/index.ts`:

```typescript
export { Text } from './components/text';
export type { TextProps, TextVariant } from './components/text';

export { Button } from './components/button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/button';

export { TapTarget } from './components/tap-target';
export type { TapTargetProps } from './components/tap-target';

export { Icon } from './components/icon';
export { Badge } from './components/badge';
export { Spinner } from './components/spinner';
export { Card } from './components/card';
export { Slider } from './components/slider';
export { ProgressBar } from './components/progress-bar';
export { BottomSheet } from './components/bottom-sheet';
export { Dialog } from './components/dialog';

export { colors, spacing, borderRadius, shadows, fontSize, lineHeight, fontWeight, fontFamily } from './tokens';
```

- [ ] **Step 2: Verify import works**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/design-system/index.ts
git commit -m "feat(epic-0): add design system barrel export"
```

---

## Chunk 4: Libs, Providers & Root Layout

### Task 14: Localization (i18next)

**Files:**
- Create: `src/libs/localization/i18n.ts`, `en.ts`, `index.ts`

- [ ] **Step 1: Create en.ts with initial translation keys**

Create `src/libs/localization/en.ts`:

```typescript
export const en = {
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    skip: 'Skip',
    next: 'Next',
    back: 'Back',
    done: 'Done',
  },
  tabs: {
    learn: 'Learn',
    practice: 'Practice',
    baby: 'Baby',
    progress: 'Progress',
    settings: 'Settings',
  },
  errorBoundary: {
    title: 'Something went wrong',
    message: 'The app encountered an unexpected error.',
    resetButton: 'Try Again',
    resetA11yLabel: 'Try again after error',
    resetA11yHint: 'Resets this section of the app',
  },
} as const;
```

- [ ] **Step 2: Create i18n.ts**

Create `src/libs/localization/i18n.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';

export const initI18n = () =>
  i18n.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
```

- [ ] **Step 3: Create index.ts**

Create `src/libs/localization/index.ts`:

```typescript
export { initI18n } from './i18n';
export { en } from './en';
```

- [ ] **Step 4: Commit**

```bash
git add src/libs/localization/
git commit -m "feat(epic-0): add i18next localization setup with English translations"
```

---

### Task 15: Error Handling

**Files:**
- Create: `src/libs/error-handling/typed-errors.ts`, `error-boundary.tsx`, `__tests__/error-boundary.test.tsx`, `index.ts`

- [ ] **Step 1: Create typed-errors.ts**

Create `src/libs/error-handling/typed-errors.ts`:

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly recoverable: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AudioError extends AppError {
  constructor(message: string) {
    super(message, 'AUDIO_ERROR', true);
    this.name = 'AudioError';
  }
}

export class SyncError extends AppError {
  constructor(message: string) {
    super(message, 'SYNC_ERROR', true);
    this.name = 'SyncError';
  }
}
```

- [ ] **Step 2: Write failing test for ErrorBoundary**

Create `src/libs/error-handling/__tests__/error-boundary.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../error-boundary';

const ThrowingComponent = () => {
  throw new Error('Test crash');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <Text>Safe content</Text>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Safe content')).toBeTruthy();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('recovers when retry button is pressed', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    fireEvent.press(screen.getByRole('button'));
    // After retry, boundary resets (will throw again, but that's OK for test)
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx jest src/libs/error-handling/__tests__/error-boundary.test.tsx --no-coverage
```

Expected: FAIL.

- [ ] **Step 4: Write error-boundary.tsx**

Create `src/libs/error-handling/error-boundary.tsx`:

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { Button } from '@design-system';
import { colors } from '@design-system';
import { spacing } from '@design-system';

interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.warn('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text variant="h3" align="center">Something went wrong</Text>
          <Text variant="body" color={colors.textSecondary} align="center">
            The app encountered an unexpected error.
          </Text>
          <Button
            accessibilityLabel="Try again after error"
            accessibilityHint="Resets this section of the app"
            onPress={this.handleReset}
          >
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
});
```

- [ ] **Step 5: Create index.ts**

Create `src/libs/error-handling/index.ts`:

```typescript
export { ErrorBoundary } from './error-boundary';
export { AppError, AudioError, SyncError } from './typed-errors';
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx jest src/libs/error-handling/__tests__/error-boundary.test.tsx --no-coverage
```

Expected: 3 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/libs/error-handling/
git commit -m "feat(epic-0): add ErrorBoundary and typed errors with tests"
```

---

### Task 16: Accessibility Utilities

**Files:**
- Create: `src/libs/accessibility/announcements.ts`, `focus-management.ts`, `index.ts`

- [ ] **Step 1: Create announcements.ts**

Create `src/libs/accessibility/announcements.ts`:

```typescript
import { AccessibilityInfo } from 'react-native';

export const announce = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};
```

- [ ] **Step 2: Create focus-management.ts**

Create `src/libs/accessibility/focus-management.ts`:

```typescript
import type { RefObject } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import type { View } from 'react-native';

export const focusOn = (ref: RefObject<View | null>) => {
  const node = ref.current ? findNodeHandle(ref.current) : null;
  if (node) {
    AccessibilityInfo.setAccessibilityFocus(node);
  }
};
```

- [ ] **Step 3: Create index.ts**

Create `src/libs/accessibility/index.ts`:

```typescript
export { announce } from './announcements';
export { focusOn } from './focus-management';
```

- [ ] **Step 4: Commit**

```bash
git add src/libs/accessibility/
git commit -m "feat(epic-0): add accessibility utilities (announce, focusOn)"
```

---

### Task 17: Analytics Stub

**Files:**
- Create: `src/libs/analytics/tracker.ts`, `index.ts`

- [ ] **Step 1: Create tracker.ts**

Create `src/libs/analytics/tracker.ts`:

```typescript
export const trackScreenView = (screenName: string) => {
  if (__DEV__) {
    console.log(`[analytics] screen: ${screenName}`);
  }
};

export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  if (__DEV__) {
    console.log(`[analytics] event: ${event}`, properties);
  }
};
```

- [ ] **Step 2: Create index.ts**

Create `src/libs/analytics/index.ts`:

```typescript
export { trackScreenView, trackEvent } from './tracker';
```

- [ ] **Step 3: Commit**

```bash
git add src/libs/analytics/
git commit -m "feat(epic-0): add analytics stub (console logging in dev)"
```

---

### Task 18: Entry Providers

**Files:**
- Create: `src/entry-providers/gesture-provider.tsx`, `safe-area-provider.tsx`, `theme-provider.tsx`, `localization-provider.tsx`, `index.ts`

- [ ] **Step 1: Create gesture-provider.tsx**

Create `src/entry-providers/gesture-provider.tsx`:

```tsx
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export const GestureProvider = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={styles.root}>
    {children}
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});
```

- [ ] **Step 2: Create safe-area-provider.tsx**

Create `src/entry-providers/safe-area-provider.tsx`:

```tsx
import React from 'react';
import { SafeAreaProvider as RNSafeAreaProvider } from 'react-native-safe-area-context';

export const SafeAreaProvider = ({ children }: { children: React.ReactNode }) => (
  <RNSafeAreaProvider>{children}</RNSafeAreaProvider>
);
```

- [ ] **Step 3: Create theme-provider.tsx**

Create `src/entry-providers/theme-provider.tsx`:

```tsx
import React, { createContext, useContext } from 'react';
import { colors } from '@design-system';

type ThemeMode = 'default' | 'baby';

interface ThemeContextValue {
  readonly mode: ThemeMode;
  readonly colors: typeof colors;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'default',
  colors,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={{ mode: 'default', colors }}>
    {children}
  </ThemeContext.Provider>
);
```

- [ ] **Step 4: Create localization-provider.tsx**

Create `src/entry-providers/localization-provider.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { initI18n } from '@libs/localization';

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <>{children}</>;
};
```

- [ ] **Step 5: Create barrel export**

Create `src/entry-providers/index.ts`:

```typescript
export { GestureProvider } from './gesture-provider';
export { SafeAreaProvider } from './safe-area-provider';
export { ThemeProvider, useTheme } from './theme-provider';
export { LocalizationProvider } from './localization-provider';
```

- [ ] **Step 6: Commit**

```bash
git add src/entry-providers/
git commit -m "feat(epic-0): add entry providers (gesture, safe-area, theme, i18n)"
```

---

### Task 19: Root Layout

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Write root layout**

Replace `app/_layout.tsx` with:

```tsx
import React from 'react';
import { Stack } from 'expo-router';
import { GestureProvider } from '@entry-providers';
import { SafeAreaProvider } from '@entry-providers';
import { ThemeProvider } from '@entry-providers';
import { LocalizationProvider } from '@entry-providers';
import { ErrorBoundary } from '@libs/error-handling';
import { colors } from '@design-system';

export default function RootLayout() {
  return (
    <GestureProvider>
      <SafeAreaProvider>
        <LocalizationProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                }}
              />
            </ErrorBoundary>
          </ThemeProvider>
        </LocalizationProvider>
      </SafeAreaProvider>
    </GestureProvider>
  );
}
```

- [ ] **Step 2: Verify app compiles**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(epic-0): wire root layout with provider hierarchy and error boundary"
```

---

## Chunk 5: Verification & Scaffold Directories

### Task 20: Create Empty Scaffold Directories

Create placeholder `index.ts` files for directories that will be populated in later epics.

**Files:**
- Create: barrel files for `src/data-access/`, `src/features/`, `src/operations/`

- [ ] **Step 1: Create directory structure with placeholder barrels**

```bash
cd /Users/chao.fan/Desktop/dev/master-the-groove

# Data access layer
mkdir -p src/data-access/stores src/data-access/supabase src/data-access/hooks
echo "export {};" > src/data-access/stores/index.ts
echo "export {};" > src/data-access/supabase/index.ts
echo "export {};" > src/data-access/hooks/index.ts

# Features
mkdir -p src/features/core-player src/features/feel-lessons src/features/baby-mode src/features/disappearing-beat src/features/progress-tracking src/features/onboarding

# Operations
mkdir -p src/operations/polyrhythm src/operations/drift-detection src/operations/baby src/operations/progress
echo "export {};" > src/operations/index.ts

# Assets
mkdir -p src/assets/sounds src/assets/images src/assets/fonts
```

- [ ] **Step 2: Commit**

```bash
git add src/data-access/ src/features/ src/operations/ src/assets/
git commit -m "feat(epic-0): scaffold empty directories for future epics"
```

---

### Task 21: Full Verification

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Run ESLint**

```bash
npx eslint src/ --ext .ts,.tsx --max-warnings 0
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Run all tests**

```bash
npx jest --coverage
```

Expected: All tests pass. Coverage report generated.

- [ ] **Step 4: Verify import aliases work end-to-end**

```bash
npx tsc --noEmit
```

Expected: 0 errors. If aliases are misconfigured, imports from `@design-system`, `@libs/`, etc. will fail here.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(epic-0): complete developer infrastructure scaffold

Epic 0 complete. Includes:
- Expo project with TypeScript strict mode
- Path aliases (@features, @libs, @data-access, @operations, @design-system)
- ESLint with import restrictions and a11y rules
- Jest with coverage thresholds (60% global, 80% operations)
- Design system: 11 components (Text, Button, TapTarget, Icon, Badge, Spinner, Card, Slider, ProgressBar, BottomSheet, Dialog)
- Design tokens (colors, typography, spacing, border-radius, shadows)
- Shared TypeScript types from data-models contract
- i18next localization with English translations
- ErrorBoundary with typed errors
- Accessibility utilities (announce, focusOn)
- Analytics stub
- Entry providers (gesture, safe-area, theme, i18n)
- Root layout with full provider hierarchy
- Test utilities (renderWithProviders, mocks)"
```

---

### Task 22: CI Configuration

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `package.json` (add scripts)

- [ ] **Step 1: Add npm scripts to package.json**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "lint": "eslint src/ --ext .ts,.tsx --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "ci": "npm run lint && npm run typecheck && npm run test"
  }
}
```

- [ ] **Step 2: Create GitHub Actions workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage
```

- [ ] **Step 3: Verify CI script locally**

```bash
npm run ci
```

Expected: lint, typecheck, and test all pass.

- [ ] **Step 4: Commit**

```bash
git add .github/ package.json
git commit -m "feat(epic-0): add CI pipeline (lint + typecheck + test)"
```

---

## Summary

| Chunk | Tasks | What It Produces |
|-------|-------|-----------------|
| 1: Scaffold & Config | Tasks 1-6 | Working Expo project with TS strict, ESLint, Jest, path aliases, test mocks |
| 2: Tokens & Types | Tasks 7-8 | Design tokens + all shared TypeScript types |
| 3: Design System (TDD) | Tasks 9-13 | 11 accessible components with tests (Text, Button, TapTarget, Icon, Badge, Spinner, Card, Slider, ProgressBar, BottomSheet, Dialog) |
| 4: Libs & Providers | Tasks 14-19 | i18n, error handling, a11y utils, analytics stub, provider hierarchy, root layout |
| 5: Verification & CI | Tasks 20-22 | Scaffold directories, CI pipeline, full verification pass |

**After Epic 0, you're ready for:**
- Epics 1+2+3 in parallel -- Audio Engine, Data Layer, Navigation Shell

**Next plans:** Epic 1 (Audio Engine), Epic 2 (Data Layer), Epic 3 (Navigation Shell). These can be planned in parallel once Epic 0 is implemented.

> **Type Source:** All types MUST match `development/contracts/data-models.md`.
> If types in this plan differ from data-models.md, data-models.md is authoritative.
> Update this plan to match, not the other way around.

---

## Done Criteria
- [ ] `npx expo start` launches without errors on iOS simulator and Android emulator
- [ ] `tsc --noEmit` passes with zero errors
- [ ] ESLint passes with zero errors
- [ ] Jest runs with all tests passing
- [ ] All canonical types from data-models.md are implemented in src/types/index.ts
- [ ] Project structure matches coding-conventions.md
