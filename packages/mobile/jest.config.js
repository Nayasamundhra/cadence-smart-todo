/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // lucide's "react-native" export condition points at ESM that Jest cannot load; use its CJS build.
    // Only per-icon paths are mapped on purpose: the barrel must never be imported (see design/icons/lucide.ts).
    '^lucide-react-native/icons/(.*)$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/icons/$1.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
