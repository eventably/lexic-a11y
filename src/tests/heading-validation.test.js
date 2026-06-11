import { headingLevel, validateHeadingStructure } from '../utils/heading-validation';

const h = (tag, text = 'Heading') => ({ tag, text });

describe('headingLevel', () => {
  it('parses h1..h6 tags', () => {
    expect(headingLevel('h1')).toBe(1);
    expect(headingLevel('h6')).toBe(6);
  });
});

describe('validateHeadingStructure', () => {
  it('returns no warnings for an empty document', () => {
    expect(validateHeadingStructure([])).toEqual([]);
  });

  it('returns no warnings for a well-formed sequence', () => {
    const warnings = validateHeadingStructure([h('h1'), h('h2'), h('h3'), h('h2'), h('h2')]);
    expect(warnings).toEqual([]);
  });

  it('flags a skipped level (H1 -> H3)', () => {
    const warnings = validateHeadingStructure([h('h1'), h('h3')]);
    expect(warnings).toEqual([{ type: 'skipped-level', index: 1, from: 'H1', to: 'H3' }]);
  });

  it('flags each skipped jump independently', () => {
    const warnings = validateHeadingStructure([h('h1'), h('h3'), h('h2'), h('h5')]);
    expect(warnings).toEqual([
      { type: 'skipped-level', index: 1, from: 'H1', to: 'H3' },
      { type: 'skipped-level', index: 3, from: 'H2', to: 'H5' },
    ]);
  });

  it('allows moving up multiple levels at once (H4 -> H2)', () => {
    expect(validateHeadingStructure([h('h1'), h('h2'), h('h3'), h('h4'), h('h2')])).toEqual([]);
  });

  it('flags multiple H1 headings', () => {
    const warnings = validateHeadingStructure([h('h1'), h('h2'), h('h1')]);
    expect(warnings).toEqual([{ type: 'multiple-h1', count: 2 }]);
  });

  it('reports both skipped levels and multiple H1s together', () => {
    const warnings = validateHeadingStructure([h('h1'), h('h3'), h('h1')]);
    expect(warnings).toHaveLength(2);
    expect(warnings.map((w) => w.type)).toEqual(['skipped-level', 'multiple-h1']);
  });
});
