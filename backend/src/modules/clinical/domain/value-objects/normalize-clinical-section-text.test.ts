import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeClinicalSectionText } from './normalize-clinical-section-text.js';

describe('normalizeClinicalSectionText', () => {
  it('applies the FEATURE-031 spec example', () => {
    const input = '  Patient reports   nausea.\r\n\r\n  Symptoms worsen at night.  ';
    const expected = 'Patient reports nausea.\n\nSymptoms worsen at night.';

    assert.equal(normalizeClinicalSectionText(input), expected);
  });

  it('preserves intentional paragraph breaks', () => {
    const input = 'First paragraph line one\nFirst paragraph line two\n\nSecond paragraph';
    const expected = 'First paragraph line one\nFirst paragraph line two\n\nSecond paragraph';

    assert.equal(normalizeClinicalSectionText(input), expected);
  });

  it('collapses repeated spaces inside the same line', () => {
    assert.equal(
      normalizeClinicalSectionText('Hello    world\t\ttest'),
      'Hello world test',
    );
  });

  it('normalizes Windows line endings', () => {
    assert.equal(
      normalizeClinicalSectionText('Line one\r\nLine two'),
      'Line one\nLine two',
    );
  });

  it('returns null for blank input', () => {
    assert.equal(normalizeClinicalSectionText(''), null);
    assert.equal(normalizeClinicalSectionText('   '), null);
    assert.equal(normalizeClinicalSectionText('\n\n'), null);
    assert.equal(normalizeClinicalSectionText('\r\n\t  '), null);
  });

  it('collapses multiple blank lines into a single paragraph break', () => {
    assert.equal(
      normalizeClinicalSectionText('Paragraph one\n\n\n\nParagraph two'),
      'Paragraph one\n\nParagraph two',
    );
  });

  it('does not collapse the whole text into a single line', () => {
    const normalized = normalizeClinicalSectionText('Section A\n\nSection B');

    assert.ok(normalized?.includes('\n\n'));
    assert.equal(normalized, 'Section A\n\nSection B');
  });
});
