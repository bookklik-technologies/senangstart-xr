const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    ignores: ['dist/**', 'examples/js/**', 'src/third-party/**'],
  },
  {
    files: ['src/**/*.js', 'tests/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        AFRAME: 'readonly',
        THREE: 'readonly',
        SXR: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
      'no-var': 'warn',
    },
  },
  {
    // test output and CLI scripts legitimately print
    files: ['tests/**/*.js', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
