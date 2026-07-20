import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { MuscleMass } from './muscle-mass.js';

describe('MuscleMass', () => {
  it('accepts valid values', () => {
    assert.equal(MuscleMass.create('32.10').toString(), '32.10');
  });

  it('rejects negative values', () => {
    assert.throws(
      () => MuscleMass.create('-1'),
      BodyCompositionMeasurementDomainError,
    );
  });
});
