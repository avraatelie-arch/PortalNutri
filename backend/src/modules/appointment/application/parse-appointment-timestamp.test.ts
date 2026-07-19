import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../domain/errors/domain-error.js';
import { parseAppointmentTimestamp } from './parse-appointment-timestamp.js';

describe('parseAppointmentTimestamp', () => {
  it('accepts UTC timestamps with Z suffix', () => {
    const parsed = parseAppointmentTimestamp('2026-07-18T14:00:00.000Z');

    assert.equal(parsed.toISOString(), '2026-07-18T14:00:00.000Z');
  });

  it('accepts timestamps with numeric offset', () => {
    const parsed = parseAppointmentTimestamp('2026-07-18T11:00:00.000-03:00');

    assert.equal(parsed.toISOString(), '2026-07-18T14:00:00.000Z');
  });

  it('accepts timestamps with compact offset', () => {
    const parsed = parseAppointmentTimestamp('2026-07-18T19:30:00.000+0530');

    assert.equal(parsed.toISOString(), '2026-07-18T14:00:00.000Z');
  });

  it('rejects timezone-less timestamps', () => {
    assert.throws(
      () => parseAppointmentTimestamp('2026-07-18T14:00:00.000'),
      /Appointment timestamp must include a timezone or UTC offset/,
    );
  });

  it('rejects empty values', () => {
    assert.throws(
      () => parseAppointmentTimestamp('   '),
      /Appointment timestamp is required/,
    );
  });

  it('rejects invalid timestamps', () => {
    assert.throws(
      () => parseAppointmentTimestamp('not-a-dateZ'),
      DomainError,
    );
  });
});
