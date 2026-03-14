/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./src/__tests__/jest-setup.ts'],
  testMatch: ['**/?(*.)+(spec|test).{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/src/__tests__/mocks/', '/src/__tests__/jest-'],
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
  },
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

module.exports = config;
