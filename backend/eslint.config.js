import js from '@eslint/js';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base recommended ESLint rules
  js.configs.recommended,

  // Prettier config to disable conflicting rules
  prettierConfig,

  {
    // Files to apply this configuration to
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],

    // Language options
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Node.js globals (process, __dirname, etc.)
        ...globals.es2021, // ES2021 globals
        ...globals.mongo, // Optional: if you want MongoDB shell globals
      },
    },

    // Plugins
    plugins: {
      prettier: prettierPlugin,
    },

    // Rules
    rules: {
      // ---- Prettier ----
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],

      // ---- Possible Errors ----
      'no-console': 'off', // We use console.log for logging
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',

      // ---- Best Practices ----
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-else-return': 'warn',
      'no-empty-function': 'warn',

      // ---- Stylistic (handled by Prettier) ----
      // Note: Stylistic rules like semi, quotes, indent, comma-dangle, etc.
      // are handled by Prettier via eslint-config-prettier

      // ---- ES Modules specific ----
      'import/no-unresolved': 'off', // handled by Node.js runtime
      'import/extensions': 'off', // we use .js extensions explicitly

      // ---- Common Errors in our codebase ----
      'no-prototype-builtins': 'off', // sometimes we use hasOwnProperty
    },
  },

  // Ignore specific files/folders
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.env',
      '.env.*',
      '*.min.js',
    ],
  },
];
