import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { BodyWaterPercentage } from './body-water-percentage.js';

describe('BodyWaterPercentage', () => {
  it('accepts valid values', () => {
    assert.equal(BodyWaterPercentage.create('58.20').toString(), '58.20');
  });

  it('createOptional returns null for blank input', () => {
    assert.equal(BodyWaterPercentage.createOptional(''), null);
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => BodyWaterPercentage.create('100.01'),
      BodyCompositionMeasurementDomainError,
    );
  });
});
