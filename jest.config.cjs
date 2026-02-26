/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/main/**'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@app$': '<rootDir>/src/app.ts',
    '^@adapters/(.*)$': '<rootDir>/src/adapters/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};