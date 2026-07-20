import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { FatMass } from './fat-mass.js';

describe('FatMass', () => {
  it('accepts valid values including zero', () => {
    assert.equal(FatMass.create('0').toString(), '0.00');
    assert.equal(FatMass.create('17.25').toString(), '17.25');
  });

  it('createOptional returns null for blank input', () => {
    assert.equal(FatMass.createOptional(undefined), null);
  });

  it('rejects negative values', () => {
    assert.throws(
      () => FatMass.create('-0.01'),
      BodyCompositionMeasurementDomainError,
    );
  });
});
