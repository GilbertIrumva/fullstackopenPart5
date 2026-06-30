import js from '@eslint/js'
import globals from 'globals'

// [5.12] flat ESLint config for the server. CommonJS codebase, Node runtime.
// Rules mirror the frontend config so feedback stays consistent across the
// project.
export default [
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      eqeqeq: 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off', // logger.js intentionally wraps console
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
]
