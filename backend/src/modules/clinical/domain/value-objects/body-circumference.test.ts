import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AnthropometricMeasurementDomainError } from '../errors/anthropometric-measurement.domain-error.js';
import { BodyCircumference } from './body-circumference.js';

const FIELD = 'waistCircumferenceCm';

describe('BodyCircumference', () => {
  it('allows null values', () => {
    const circumference = BodyCircumference.createOptional(null, FIELD);

    assert.equal(circumference, null);
  });

  it('accepts positive values', () => {
    const circumference = BodyCircumference.create('88.50', FIELD);

    assert.equal(circumference.toString(), '88.50');
  });

  it('rejects zero', () => {
    assert.throws(
      () => BodyCircumference.create('0', FIELD),
      AnthropometricMeasurementDomainError,
    );
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => BodyCircumference.create('500.01', FIELD),
      AnthropometricMeasurementDomainError,
    );
  });

  it('rejects excessive precision', () => {
    assert.throws(
      () => BodyCircumference.create('88.501', FIELD),
      /precision exceeds 2 decimal places/,
    );
  });
});
