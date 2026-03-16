import type { Config } from 'jest';

const config: Config = {
  displayName: 'integration',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
      },
    }],
  },
  testMatch: ['<rootDir>/integration-tests/**/*.test.ts'],
  testSequencer: '<rootDir>/integration-tests/sequencer.js',
  maxWorkers: 1,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globalSetup: '<rootDir>/integration-tests/globalSetup.ts',
  globalTeardown: '<rootDir>/integration-tests/globalTeardown.ts',
};

export default config;
