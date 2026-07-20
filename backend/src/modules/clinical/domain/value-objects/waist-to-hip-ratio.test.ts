import { Decimal } from '@prisma/client/runtime/library';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WaistToHipRatio } from './waist-to-hip-ratio.js';

describe('WaistToHipRatio', () => {
  it('accepts valid values from decimal', () => {
    const ratio = WaistToHipRatio.fromDecimal(new Decimal('0.875'));

    assert.equal(ratio.toString(), '0.875');
  });

  it('preserves decimal value through getter', () => {
    const ratio = WaistToHipRatio.fromDecimal(new Decimal('0.880'));

    assert.equal(ratio.getValue().toFixed(3), '0.880');
  });
});
