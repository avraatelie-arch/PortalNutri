import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { MetabolicAge } from './metabolic-age.js';

describe('MetabolicAge', () => {
  it('accepts valid integer values', () => {
    assert.equal(MetabolicAge.create('42').toString(), '42');
  });

  it('createOptional returns null for blank input', () => {
    assert.equal(MetabolicAge.createOptional(undefined), null);
  });

  it('rejects decimal values', () => {
    assert.throws(
      () => MetabolicAge.create('42.5'),
      BodyCompositionMeasurementDomainError,
    );
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => MetabolicAge.create('151'),
      BodyCompositionMeasurementDomainError,
    );
  });
});
