import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalMeasurementDomainError } from '../errors/clinical-measurement.domain-error.js';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { BodyFatPercentage } from './body-fat-percentage.js';

describe('BodyFatPercentage', () => {
  it('accepts valid values including zero', () => {
    assert.equal(BodyFatPercentage.create('0').toString(), '0.00');
    assert.equal(BodyFatPercentage.create('22.50').toString(), '22.50');
    assert.equal(BodyFatPercentage.create('100').toString(), '100.00');
  });

  it('rejects negative values', () => {
    assert.throws(
      () => BodyFatPercentage.create('-1'),
      BodyCompositionMeasurementDomainError,
    );
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => BodyFatPercentage.create('100.01'),
      BodyCompositionMeasurementDomainError,
    );
  });

  it('rejects excessive precision', () => {
    assert.throws(
      () => BodyFatPercentage.create('22.501'),
      ClinicalMeasurementDomainError,
    );
  });

  it('rejects NaN and Infinity', () => {
    assert.throws(() => BodyFatPercentage.create('NaN'), ClinicalMeasurementDomainError);
    assert.throws(
      () => BodyFatPercentage.create('Infinity'),
      ClinicalMeasurementDomainError,
    );
  });
});
