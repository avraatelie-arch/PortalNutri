import type { Decimal } from '@prisma/client/runtime/library';
import { formatClinicalDecimal } from './clinical-decimal-utils.js';

const WHR_SCALE = 3;

export class WaistToHipRatio {
  private constructor(private readonly value: Decimal) {}

  static fromDecimal(value: Decimal): WaistToHipRatio {
    return new WaistToHipRatio(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, WHR_SCALE);
  }
}
