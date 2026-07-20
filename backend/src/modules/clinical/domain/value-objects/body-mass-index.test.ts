import { Decimal } from '@prisma/client/runtime/library';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyMassIndex } from './body-mass-index.js';

describe('BodyMassIndex', () => {
  it('accepts valid values from decimal', () => {
    const bmi = BodyMassIndex.fromDecimal(new Decimal('25.09'));

    assert.equal(bmi.toString(), '25.09');
  });

  it('preserves decimal value through getter', () => {
    const bmi = BodyMassIndex.fromDecimal(new Decimal('22.86'));

    assert.equal(bmi.getValue().toFixed(2), '22.86');
  });
});
