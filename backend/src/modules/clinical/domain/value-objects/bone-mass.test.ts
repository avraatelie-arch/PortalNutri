import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { BoneMass } from './bone-mass.js';

describe('BoneMass', () => {
  it('accepts valid values', () => {
    assert.equal(BoneMass.create('2.75').toString(), '2.75');
  });

  it('rejects negative values', () => {
    assert.throws(
      () => BoneMass.create('-0.01'),
      BodyCompositionMeasurementDomainError,
    );
  });
});
