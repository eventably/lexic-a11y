// Add Jest setup for DOM testing
import '@testing-library/jest-dom';

// Mock browser environment for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn();

// jsdom does not provide TextEncoder/TextDecoder (needed by @afixt/a11y-assert)
const { TextDecoder, TextEncoder } = require('node:util');
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
