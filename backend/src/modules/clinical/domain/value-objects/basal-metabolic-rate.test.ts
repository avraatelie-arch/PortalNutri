import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { BasalMetabolicRate } from './basal-metabolic-rate.js';

describe('BasalMetabolicRate', () => {
  it('accepts valid integer values', () => {
    assert.equal(BasalMetabolicRate.create('1350').toString(), '1350');
    assert.equal(BasalMetabolicRate.create('2450').getValue(), 2450);
  });

  it('createOptional returns null for blank input', () => {
    assert.equal(BasalMetabolicRate.createOptional(null), null);
    assert.equal(BasalMetabolicRate.createOptional(''), null);
  });

  it('rejects decimal values', () => {
    assert.throws(
      () => BasalMetabolicRate.create('1350.5'),
      BodyCompositionMeasurementDomainError,
    );
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => BasalMetabolicRate.create('10001'),
      BodyCompositionMeasurementDomainError,
    );
  });
});
