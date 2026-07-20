import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalMeasurementDomainError } from '../errors/clinical-measurement.domain-error.js';
import { BodyWeight } from './body-weight.js';

describe('BodyWeight', () => {
  it('accepts valid values', () => {
    const weight = BodyWeight.create('72.50');

    assert.equal(weight.toString(), '72.50');
  });

  it('rejects zero', () => {
    assert.throws(
      () => BodyWeight.create('0'),
      ClinicalMeasurementDomainError,
    );
  });

  it('rejects negative values', () => {
    assert.throws(
      () => BodyWeight.create('-1'),
      ClinicalMeasurementDomainError,
    );
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => BodyWeight.create('500.01'),
      ClinicalMeasurementDomainError,
    );
  });

  it('rejects excessive precision', () => {
    assert.throws(
      () => BodyWeight.create('72.501'),
      /precision exceeds 2 decimal places/,
    );
  });

  it('rejects NaN and Infinity', () => {
    assert.throws(() => BodyWeight.create('NaN'), ClinicalMeasurementDomainError);
    assert.throws(
      () => BodyWeight.create('Infinity'),
      ClinicalMeasurementDomainError,
    );
  });
});
