import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { LeanMass } from './lean-mass.js';

describe('LeanMass', () => {
  it('accepts valid values including zero', () => {
    assert.equal(LeanMass.create('0').toString(), '0.00');
    assert.equal(LeanMass.create('55.25').toString(), '55.25');
  });

  it('createOptional returns null for blank input', () => {
    assert.equal(LeanMass.createOptional(null), null);
    assert.equal(LeanMass.createOptional('   '), null);
  });

  it('rejects negative values', () => {
    assert.throws(
      () => LeanMass.create('-1'),
      BodyCompositionMeasurementDomainError,
    );
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => LeanMass.create('500.01'),
      BodyCompositionMeasurementDomainError,
    );
  });
});
