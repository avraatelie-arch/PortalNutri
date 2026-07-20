import type { Decimal } from '@prisma/client/runtime/library';
import {
  ClinicalMeasurementDomainError,
  ClinicalMeasurementReasonCode,
} from '../errors/clinical-measurement.domain-error.js';
import {
  formatClinicalDecimal,
  isClinicalDecimalPositive,
  isClinicalDecimalZero,
  parseClinicalDecimal,
} from './clinical-decimal-utils.js';

const WEIGHT_SCALE = 2;

export class BodyWeight {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string): BodyWeight {
    const value = parseClinicalDecimal(raw, 'weightKg', WEIGHT_SCALE);

    if (isClinicalDecimalZero(value) || !isClinicalDecimalPositive(value)) {
      throw new ClinicalMeasurementDomainError(
        'weightKg',
        ClinicalMeasurementReasonCode.MUST_BE_GREATER_THAN_ZERO,
      );
    }

    const maxWeight = parseClinicalDecimal('500', 'weightKg', WEIGHT_SCALE);

    if (value.greaterThan(maxWeight)) {
      throw new ClinicalMeasurementDomainError(
        'weightKg',
        ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM,
      );
    }

    return new BodyWeight(value);
  }

  static fromDecimal(value: Decimal): BodyWeight {
    return new BodyWeight(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, WEIGHT_SCALE);
  }
}
