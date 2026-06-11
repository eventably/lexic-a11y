module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  // The @afixt packages (and their uuid dependency) ship ESM only —
  // let babel-jest transpile them
  transformIgnorePatterns: ['/node_modules/(?!(@afixt/|uuid/))'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/index.js', '!src/tests/**/*.{js,jsx}'],
};
