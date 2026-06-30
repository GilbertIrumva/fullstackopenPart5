import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// [5.12] flat ESLint config. Vite scaffolded the base; the `rules` block
// below adds a few personal-preference tweaks so the lint feedback matches
// how this project is written.
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // catch typos in comparisons
      eqeqeq: 'error',
      // unused params/vars are an error, but allow `_foo` opt-outs
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // keep console noise visible but non-blocking
      'no-console': 'warn',
      // a few small style preferences
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
])
