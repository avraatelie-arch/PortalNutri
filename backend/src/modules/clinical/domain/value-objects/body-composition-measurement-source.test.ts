import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../errors/domain-error.js';
import {
  BodyCompositionMeasurementSource,
  BodyCompositionMeasurementSourceValue,
} from './body-composition-measurement-source.js';

describe('BodyCompositionMeasurementSource', () => {
  it('parses valid sources', () => {
    assert.equal(
      BodyCompositionMeasurementSource.parse('bioimpedance').toString(),
      BodyCompositionMeasurementSourceValue.Bioimpedance,
    );
    assert.equal(
      BodyCompositionMeasurementSource.parse('MANUAL').toString(),
      BodyCompositionMeasurementSourceValue.Manual,
    );
  });

  it('rejects invalid sources', () => {
    assert.throws(
      () => BodyCompositionMeasurementSource.parse('INBODY'),
      DomainError,
    );
  });

  it('identifies device-generated sources', () => {
    assert.equal(BodyCompositionMeasurementSource.parse('MANUAL').isDeviceGenerated(), false);
    assert.equal(BodyCompositionMeasurementSource.parse('DEXA').isDeviceGenerated(), true);
    assert.equal(BodyCompositionMeasurementSource.parse('SKINFOLD').isDeviceGenerated(), true);
    assert.equal(BodyCompositionMeasurementSource.parse('OTHER').isDeviceGenerated(), true);
    assert.equal(
      BodyCompositionMeasurementSource.parse('BIOIMPEDANCE').isDeviceGenerated(),
      true,
    );
  });
});
