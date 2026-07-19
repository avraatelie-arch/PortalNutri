import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../errors/domain-error.js';
import { ClinicalNotes, normalizeNotes } from './clinical-notes.js';

describe('ClinicalNotes', () => {
  it('trims leading and trailing whitespace', () => {
    const notes = ClinicalNotes.create('  Hello world  ');

    assert.equal(notes.toString(), 'Hello world');
  });

  it('collapses internal whitespace', () => {
    const notes = ClinicalNotes.create('Hello    world\t\ttest');

    assert.equal(notes.toString(), 'Hello world test');
  });

  it('treats empty string as null equivalent', () => {
    assert.equal(ClinicalNotes.create('').toString(), null);
    assert.equal(ClinicalNotes.create('   ').toString(), null);
    assert.equal(ClinicalNotes.create(null).toString(), null);
    assert.equal(ClinicalNotes.create(undefined).toString(), null);
  });

  it('normalizeNotes returns null for blank input', () => {
    assert.equal(normalizeNotes('   '), null);
    assert.equal(normalizeNotes('\n\t'), null);
  });

  it('equals compares normalized values', () => {
    const first = ClinicalNotes.create('Same notes');
    const second = ClinicalNotes.create('  Same   notes  ');
    const different = ClinicalNotes.create('Different notes');
    const empty = ClinicalNotes.create('');
    const nullNotes = ClinicalNotes.create(null);

    assert.equal(first.equals(second), true);
    assert.equal(first.equals(different), false);
    assert.equal(empty.equals(nullNotes), true);
  });

  it('rejects notes exceeding maximum length', () => {
    const tooLong = 'a'.repeat(5001);

    assert.throws(
      () => ClinicalNotes.create(tooLong),
      /Clinical notes must not exceed 5000 characters/,
    );
  });

  it('accepts notes at maximum length after normalization', () => {
    const notes = ClinicalNotes.create('a'.repeat(5000));

    assert.equal(notes.toString()?.length, 5000);
  });
});
