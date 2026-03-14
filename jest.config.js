/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./src/__tests__/jest-setup.ts'],
  testMatch: ['**/?(*.)+(spec|test).{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/src/__tests__/mocks/', '/src/__tests__/jest-', '\\.claude/worktrees/'],
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
    '^@entry-providers/(.*)$': '<rootDir>/src/entry-providers/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@navigation$': '<rootDir>/src/navigation',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|native-base|react-native-svg|uuid)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: { branches: 50, functions: 50, lines: 55, statements: 55 },
    './src/operations/': { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};

module.exports = config;
