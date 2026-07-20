import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalMeasurementDomainError } from '../errors/clinical-measurement.domain-error.js';
import { BodyHeight } from './body-height.js';

describe('BodyHeight', () => {
  it('accepts boundary values', () => {
    assert.equal(BodyHeight.create('30').toString(), '30.00');
    assert.equal(BodyHeight.create('300').toString(), '300.00');
  });

  it('rejects values below minimum', () => {
    assert.throws(
      () => BodyHeight.create('29.99'),
      ClinicalMeasurementDomainError,
    );
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => BodyHeight.create('300.01'),
      ClinicalMeasurementDomainError,
    );
  });

  it('rejects excessive precision', () => {
    assert.throws(
      () => BodyHeight.create('170.001'),
      /precision exceeds 2 decimal places/,
    );
  });

  it('exposes height as decimal value', () => {
    assert.equal(BodyHeight.create('170').getValue().toFixed(2), '170.00');
  });
});
