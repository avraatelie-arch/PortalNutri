import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { VisceralFatLevel } from './visceral-fat-level.js';

describe('VisceralFatLevel', () => {
  it('accepts valid values including zero', () => {
    assert.equal(VisceralFatLevel.create('0').toString(), '0.00');
    assert.equal(VisceralFatLevel.create('8.00').toString(), '8.00');
  });

  it('rejects negative values', () => {
    assert.throws(
      () => VisceralFatLevel.create('-1'),
      BodyCompositionMeasurementDomainError,
    );
  });
});
