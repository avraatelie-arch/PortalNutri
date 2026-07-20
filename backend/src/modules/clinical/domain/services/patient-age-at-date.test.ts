import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculatePatientAgeAtDate } from './patient-age-at-date.js';

describe('calculatePatientAgeAtDate', () => {
  it('returns age before birthday in the measurement year', () => {
    const birthDate = new Date('2000-06-15T00:00:00.000Z');
    const measuredAt = new Date('2026-03-10T12:00:00.000Z');

    assert.equal(calculatePatientAgeAtDate(birthDate, measuredAt), 25);
  });

  it('returns age on birthday', () => {
    const birthDate = new Date('2000-06-15T00:00:00.000Z');
    const measuredAt = new Date('2026-06-15T12:00:00.000Z');

    assert.equal(calculatePatientAgeAtDate(birthDate, measuredAt), 26);
  });

  it('returns age after birthday in the measurement year', () => {
    const birthDate = new Date('2000-06-15T00:00:00.000Z');
    const measuredAt = new Date('2026-08-01T12:00:00.000Z');

    assert.equal(calculatePatientAgeAtDate(birthDate, measuredAt), 26);
  });

  it('returns exactly 18 on eighteenth birthday', () => {
    const birthDate = new Date('2008-07-20T00:00:00.000Z');
    const measuredAt = new Date('2026-07-20T10:00:00.000Z');

    assert.equal(calculatePatientAgeAtDate(birthDate, measuredAt), 18);
  });
});
