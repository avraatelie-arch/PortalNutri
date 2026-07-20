import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalMeasurementDomainError } from '../errors/clinical-measurement.domain-error.js';
import { AnthropometricNotes } from './anthropometric-notes.js';

describe('AnthropometricNotes', () => {
  it('normalizes whitespace and preserves paragraphs', () => {
    const notes = AnthropometricNotes.create('  First line\n\nSecond   line  ');

    assert.equal(notes.toString(), 'First line\n\nSecond line');
  });

  it('treats blank input as null', () => {
    assert.equal(AnthropometricNotes.create('   ').toString(), null);
    assert.equal(AnthropometricNotes.create(null).toString(), null);
  });

  it('rejects notes exceeding maximum length', () => {
    assert.throws(
      () => AnthropometricNotes.create('a'.repeat(5001)),
      ClinicalMeasurementDomainError,
    );
  });

  it('accepts notes at maximum length', () => {
    const notes = AnthropometricNotes.create('a'.repeat(5000));

    assert.equal(notes.toString()?.length, 5000);
  });
});
