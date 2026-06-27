import { render } from '@testing-library/react';

import { InitialContentPlugin } from '../components/InitialContentPlugin';

// Run editor.update callbacks synchronously so the seeding logic executes.
const mockEditor = { update: jest.fn((cb) => cb()) };
const mockRoot = { clear: jest.fn(), select: jest.fn(), append: jest.fn() };
const mockSelection = { insertNodes: jest.fn() };

jest.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [mockEditor],
}));

jest.mock('lexical', () => ({
  $getRoot: () => mockRoot,
  $getSelection: () => mockSelection,
  $isRangeSelection: jest.fn(() => true),
}));

jest.mock('../utils/html-to-nodes', () => ({
  htmlToNodes: jest.fn(() => ['node-1', 'node-2']),
}));

const { $isRangeSelection } = require('lexical');

const { htmlToNodes } = require('../utils/html-to-nodes');

describe('InitialContentPlugin', () => {
  beforeEach(() => {
    mockEditor.update.mockClear();
    mockRoot.clear.mockClear();
    mockRoot.select.mockClear();
    mockRoot.append.mockClear();
    mockSelection.insertNodes.mockClear();
    htmlToNodes.mockClear();
    $isRangeSelection.mockReturnValue(true);
  });

  it('seeds the editor with the converted nodes on mount', () => {
    render(<InitialContentPlugin html="<p>Hello</p>" />);

    expect(htmlToNodes).toHaveBeenCalledWith(mockEditor, '<p>Hello</p>');
    expect(mockRoot.clear).toHaveBeenCalledTimes(1);
    expect(mockRoot.select).toHaveBeenCalledTimes(1);
    expect(mockSelection.insertNodes).toHaveBeenCalledWith(['node-1', 'node-2']);
  });

  it('is a no-op when html is empty', () => {
    render(<InitialContentPlugin html="" />);

    expect(mockEditor.update).not.toHaveBeenCalled();
    expect(htmlToNodes).not.toHaveBeenCalled();
  });

  it('is a no-op when html is omitted', () => {
    render(<InitialContentPlugin />);

    expect(mockEditor.update).not.toHaveBeenCalled();
  });

  it('seeds only once even if re-rendered with new html', () => {
    const { rerender } = render(<InitialContentPlugin html="<p>One</p>" />);
    rerender(<InitialContentPlugin html="<p>Two</p>" />);

    expect(htmlToNodes).toHaveBeenCalledTimes(1);
    expect(htmlToNodes).toHaveBeenCalledWith(mockEditor, '<p>One</p>');
  });

  it('falls back to appending nodes to root when there is no range selection', () => {
    $isRangeSelection.mockReturnValue(false);

    render(<InitialContentPlugin html="<p>Hello</p>" />);

    expect(mockSelection.insertNodes).not.toHaveBeenCalled();
    expect(mockRoot.append).toHaveBeenCalledWith('node-1', 'node-2');
  });
});
