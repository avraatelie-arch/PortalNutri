import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyHeight } from '../value-objects/body-height.js';
import { BodyWeight } from '../value-objects/body-weight.js';
import { BodyMassIndexCalculator } from './body-mass-index-calculator.js';

describe('BodyMassIndexCalculator', () => {
  const calculator = new BodyMassIndexCalculator();

  it('calculates BMI using height conversion and half-up rounding', () => {
    const bmi = calculator.calculate(
      BodyWeight.create('72.5'),
      BodyHeight.create('170'),
    );

    assert.equal(bmi.toString(), '25.09');
  });

  it('calculates a second known example', () => {
    const bmi = calculator.calculate(
      BodyWeight.create('70'),
      BodyHeight.create('175'),
    );

    assert.equal(bmi.toString(), '22.86');
  });
});
