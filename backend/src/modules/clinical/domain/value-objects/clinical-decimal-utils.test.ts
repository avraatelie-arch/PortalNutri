import { Decimal } from '@prisma/client/runtime/library';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalMeasurementDomainError } from '../errors/clinical-measurement.domain-error.js';
import {
  compareClinicalDecimals,
  decimalFromPrisma,
  formatClinicalDecimal,
  isClinicalDecimalNegative,
  isClinicalDecimalPositive,
  isClinicalDecimalZero,
  parseClinicalDecimal,
  parseOptionalClinicalDecimal,
  roundHalfUp,
} from './clinical-decimal-utils.js';

describe('clinical-decimal-utils', () => {
  it('parses string decimal inputs', () => {
    const parsed = parseClinicalDecimal('72.50', 'weightKg', 2);

    assert.equal(parsed.toFixed(), '72.5');
  });

  it('rejects empty, NaN and Infinity values', () => {
    assert.throws(
      () => parseClinicalDecimal('', 'weightKg', 2),
      ClinicalMeasurementDomainError,
    );
    assert.throws(
      () => parseClinicalDecimal('NaN', 'weightKg', 2),
      ClinicalMeasurementDomainError,
    );
    assert.throws(
      () => parseClinicalDecimal('Infinity', 'weightKg', 2),
      ClinicalMeasurementDomainError,
    );
  });

  it('returns null for optional blank input', () => {
    assert.equal(parseOptionalClinicalDecimal(null, 'waistCircumferenceCm', 2), null);
    assert.equal(parseOptionalClinicalDecimal('   ', 'waistCircumferenceCm', 2), null);
  });

  it('rounds half-up explicitly', () => {
    assert.equal(roundHalfUp(new Decimal('1.005'), 2).toFixed(2), '1.01');
    assert.equal(roundHalfUp(new Decimal('25.086'), 2).toFixed(2), '25.09');
  });

  it('rejects excessive precision', () => {
    assert.throws(
      () => parseClinicalDecimal('72.501', 'weightKg', 2),
      /precision exceeds 2 decimal places/,
    );
  });

  it('compares decimals deterministically', () => {
    assert.equal(compareClinicalDecimals(new Decimal('1'), new Decimal('2')), -1);
    assert.equal(compareClinicalDecimals(new Decimal('2'), new Decimal('2')), 0);
    assert.equal(compareClinicalDecimals(new Decimal('3'), new Decimal('2')), 1);
  });

  it('detects zero, positive and negative values', () => {
    assert.equal(isClinicalDecimalZero(new Decimal('0')), true);
    assert.equal(isClinicalDecimalPositive(new Decimal('1')), true);
    assert.equal(isClinicalDecimalNegative(new Decimal('-1')), true);
  });

  it('formats and converts prisma decimals', () => {
    const prismaDecimal = new Decimal('72.50');

    assert.equal(formatClinicalDecimal(prismaDecimal, 2), '72.50');
    assert.equal(decimalFromPrisma(prismaDecimal).toFixed(), '72.5');
  });
});
