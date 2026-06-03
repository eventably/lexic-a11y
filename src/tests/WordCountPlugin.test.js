import { act, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

import { countWords, WordCountPlugin } from '../components/WordCountPlugin';
import i18n from '../utils/i18n';

// Captured update listener so tests can simulate editor updates
let capturedListener = null;

const mockEditor = {
  registerUpdateListener: jest.fn((listener) => {
    capturedListener = listener;
    return () => {
      capturedListener = null;
    };
  }),
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [mockEditor],
}));

let mockText = '';
jest.mock('lexical', () => ({
  $getRoot: jest.fn(() => ({
    getTextContent: () => mockText,
  })),
}));

const renderWithI18n = (component) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};

// Simulate a Lexical update cycle with the given document text
const simulateUpdate = (text) => {
  mockText = text;
  act(() => {
    capturedListener({ editorState: { read: (cb) => cb() } });
  });
};

describe('countWords', () => {
  it('counts words separated by arbitrary whitespace', () => {
    expect(countWords('one two\tthree\n four')).toBe(4);
  });

  it('returns 0 for empty text', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only text', () => {
    expect(countWords('   \n\t  ')).toBe(0);
  });

  it('counts a single word', () => {
    expect(countWords('hello')).toBe(1);
  });
});

describe('WordCountPlugin Component', () => {
  beforeEach(() => {
    mockText = '';
    mockEditor.registerUpdateListener.mockClear();
  });

  it('renders a polite live region with role status', () => {
    renderWithI18n(<WordCountPlugin />);

    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('shows zero counts initially', () => {
    renderWithI18n(<WordCountPlugin />);

    expect(screen.getByRole('status')).toHaveTextContent('0 words, 0 characters');
  });

  it('updates counts when the editor content changes', () => {
    renderWithI18n(<WordCountPlugin />);

    simulateUpdate('Hello accessible world');

    expect(screen.getByRole('status')).toHaveTextContent('3 words, 22 characters');
  });

  it('uses singular forms for a single word and character', () => {
    renderWithI18n(<WordCountPlugin />);

    simulateUpdate('a');

    expect(screen.getByRole('status')).toHaveTextContent('1 word, 1 character');
  });

  it('unregisters the update listener on unmount', () => {
    const { unmount } = renderWithI18n(<WordCountPlugin />);

    expect(capturedListener).not.toBeNull();
    unmount();
    expect(capturedListener).toBeNull();
  });
});
