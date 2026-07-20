import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AnthropometricMeasurementDomainError } from '../errors/anthropometric-measurement.domain-error.js';
import { ClinicalSourceRequestId } from './clinical-source-request-id.js';

describe('ClinicalSourceRequestId', () => {
  it('accepts safe identifiers', () => {
    const sourceRequestId = ClinicalSourceRequestId.createOptional('req-001:abc_123');

    assert.equal(sourceRequestId?.toString(), 'req-001:abc_123');
  });

  it('returns null for blank input', () => {
    assert.equal(ClinicalSourceRequestId.createOptional(null), null);
    assert.equal(ClinicalSourceRequestId.createOptional('   '), null);
  });

  it('rejects values exceeding maximum length', () => {
    assert.throws(
      () => ClinicalSourceRequestId.createOptional('a'.repeat(101)),
      AnthropometricMeasurementDomainError,
    );
  });

  it('rejects unsafe characters', () => {
    assert.throws(
      () => ClinicalSourceRequestId.createOptional('req 001'),
      AnthropometricMeasurementDomainError,
    );
    assert.throws(
      () => ClinicalSourceRequestId.createOptional('req@001'),
      AnthropometricMeasurementDomainError,
    );
  });
});
