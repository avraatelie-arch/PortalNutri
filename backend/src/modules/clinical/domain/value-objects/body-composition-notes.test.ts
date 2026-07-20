import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { BodyCompositionNotes } from './body-composition-notes.js';

describe('BodyCompositionNotes', () => {
  it('normalizes whitespace and preserves paragraphs', () => {
    const notes = BodyCompositionNotes.create('  First line\n\nSecond   line  ');

    assert.equal(notes.toString(), 'First line\n\nSecond line');
  });

  it('treats blank input as null', () => {
    assert.equal(BodyCompositionNotes.create('   ').toString(), null);
    assert.equal(BodyCompositionNotes.create(null).toString(), null);
  });

  it('rejects notes exceeding maximum length', () => {
    assert.throws(
      () => BodyCompositionNotes.create('a'.repeat(5001)),
      BodyCompositionMeasurementDomainError,
    );
  });
});
