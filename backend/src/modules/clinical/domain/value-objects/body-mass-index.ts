import type { Decimal } from '@prisma/client/runtime/library';
import { formatClinicalDecimal } from './clinical-decimal-utils.js';

const BMI_SCALE = 2;

export class BodyMassIndex {
  private constructor(private readonly value: Decimal) {}

  static fromDecimal(value: Decimal): BodyMassIndex {
    return new BodyMassIndex(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, BMI_SCALE);
  }
}
