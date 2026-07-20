import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AnthropometricMeasurementDomainError } from '../errors/anthropometric-measurement.domain-error.js';
import { BodyWeight } from './body-weight.js';

describe('BodyWeight', () => {
  it('accepts valid values', () => {
    const weight = BodyWeight.create('72.50');

    assert.equal(weight.toString(), '72.50');
  });

  it('rejects zero', () => {
    assert.throws(
      () => BodyWeight.create('0'),
      AnthropometricMeasurementDomainError,
    );
  });

  it('rejects negative values', () => {
    assert.throws(
      () => BodyWeight.create('-1'),
      AnthropometricMeasurementDomainError,
    );
  });

  it('rejects values above maximum', () => {
    assert.throws(
      () => BodyWeight.create('500.01'),
      AnthropometricMeasurementDomainError,
    );
  });

  it('rejects excessive precision', () => {
    assert.throws(
      () => BodyWeight.create('72.501'),
      /precision exceeds 2 decimal places/,
    );
  });

  it('rejects NaN and Infinity', () => {
    assert.throws(() => BodyWeight.create('NaN'), AnthropometricMeasurementDomainError);
    assert.throws(
      () => BodyWeight.create('Infinity'),
      AnthropometricMeasurementDomainError,
    );
  });
});
