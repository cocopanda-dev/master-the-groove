module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'prefer-arrow', 'react-native-a11y'],
  extends: ['expo', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    'import/no-default-export': 'error',
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@features/*/*/**'], message: 'Import from @features/<name> barrel only.' },
          { group: ['@libs/*/*/**'], message: 'Import from @libs/<name> barrel only.' },
          { group: ['../features/*'], message: 'Use @features alias, not relative paths.' },
          {
            group: ['@design-system/components/*/**'],
            message: 'Import from @design-system barrel only.',
          },
        ],
      },
    ],
    'react-native-a11y/has-valid-accessibility-role': 'warn',
  },
  overrides: [
    {
      files: ['app/**/*.tsx'],
      rules: { 'import/no-default-export': 'off' },
    },
    {
      files: ['App.tsx', 'index.ts'],
      rules: {
        'import/no-default-export': 'off',
        'prefer-arrow/prefer-arrow-functions': 'off',
      },
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
