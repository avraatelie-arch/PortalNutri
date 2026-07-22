import type { Decimal } from '@prisma/client/runtime/library';
import {
  formatClinicalDecimal,
  parseClinicalDecimal,
  parseOptionalClinicalDecimal,
  decimalFromPrisma,
} from './clinical-decimal-utils.js';

export const DOSE_QUANTITY_MAX_SCALE = 4;

export class DoseQuantity {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string): DoseQuantity {
    return new DoseQuantity(
      parseClinicalDecimal(raw, 'doseQuantity', DOSE_QUANTITY_MAX_SCALE),
    );
  }

  static createOptional(raw: string | null | undefined): DoseQuantity | null {
    const parsed = parseOptionalClinicalDecimal(
      raw,
      'doseQuantity',
      DOSE_QUANTITY_MAX_SCALE,
    );

    return parsed ? new DoseQuantity(parsed) : null;
  }

  static fromPersistence(value: Decimal | null | undefined): DoseQuantity | null {
    if (value === null || value === undefined) {
      return null;
    }

    return new DoseQuantity(decimalFromPrisma(value));
  }

  equals(other: DoseQuantity): boolean {
    return this.value.equals(other.value);
  }

  toPersistence(): string {
    return formatClinicalDecimal(this.value, DOSE_QUANTITY_MAX_SCALE);
  }

  toDecimal(): Decimal {
    return this.value;
  }
}
