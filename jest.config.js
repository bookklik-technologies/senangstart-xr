module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js', '**/?(*.)+(spec|test).js'],
  transform: {},
  setupFiles: ['jest-canvas-mock'],
};
