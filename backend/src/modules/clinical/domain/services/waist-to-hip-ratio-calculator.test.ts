import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCircumference } from '../value-objects/body-circumference.js';
import { WaistToHipRatioCalculator } from './waist-to-hip-ratio-calculator.js';

describe('WaistToHipRatioCalculator', () => {
  const calculator = new WaistToHipRatioCalculator();

  it('calculates ratio when both measurements are present', () => {
    const ratio = calculator.calculate(
      BodyCircumference.create('88', 'waistCircumferenceCm'),
      BodyCircumference.create('100', 'hipCircumferenceCm'),
    );

    assert.equal(ratio?.toString(), '0.880');
  });

  it('returns null when waist is missing', () => {
    const ratio = calculator.calculate(
      null,
      BodyCircumference.create('100', 'hipCircumferenceCm'),
    );

    assert.equal(ratio, null);
  });

  it('returns null when hip is missing', () => {
    const ratio = calculator.calculate(
      BodyCircumference.create('88', 'waistCircumferenceCm'),
      null,
    );

    assert.equal(ratio, null);
  });

  it('rounds deterministically to three decimal places', () => {
    const ratio = calculator.calculate(
      BodyCircumference.create('85', 'waistCircumferenceCm'),
      BodyCircumference.create('97', 'hipCircumferenceCm'),
    );

    assert.equal(ratio?.toString(), '0.876');
  });
});
