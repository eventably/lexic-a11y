// heading-validation.js
// Pure validation logic for document heading structure (WCAG-aligned).

// Convert a heading tag ('h1'..'h6') to its numeric level
export function headingLevel(tag) {
  return Number.parseInt(String(tag).replace(/^h/i, ''), 10);
}

/**
 * Validate a document's heading sequence.
 *
 * @param {Array<{ tag: string, text: string }>} headings in document order
 * @returns {Array<object>} structured warnings:
 *   - { type: 'skipped-level', index, from, to } when a heading is more than
 *     one level deeper than the previous heading (e.g. H1 -> H3)
 *   - { type: 'multiple-h1', count } when more than one H1 exists
 */
export function validateHeadingStructure(headings) {
  const warnings = [];

  let previousLevel = null;
  headings.forEach((heading, index) => {
    const level = headingLevel(heading.tag);
    if (previousLevel !== null && level > previousLevel + 1) {
      warnings.push({
        type: 'skipped-level',
        index,
        from: `H${previousLevel}`,
        to: `H${level}`,
      });
    }
    previousLevel = level;
  });

  const h1Count = headings.filter((heading) => headingLevel(heading.tag) === 1).length;
  if (h1Count > 1) {
    warnings.push({ type: 'multiple-h1', count: h1Count });
  }

  return warnings;
}
