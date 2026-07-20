import type { Decimal } from '@prisma/client/runtime/library';
import {
  ClinicalMeasurementReasonCode,
} from '../errors/clinical-measurement.domain-error.js';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import {
  formatClinicalDecimal,
  isClinicalDecimalNegative,
  parseClinicalDecimal,
} from './clinical-decimal-utils.js';

const PERCENTAGE_SCALE = 2;
const MAX_PERCENTAGE = '100';

export class BodyFatPercentage {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string): BodyFatPercentage {
    const value = parseClinicalDecimal(raw, 'bodyFatPercentage', PERCENTAGE_SCALE);

    if (isClinicalDecimalNegative(value)) {
      throw new BodyCompositionMeasurementDomainError(
        'bodyFatPercentage',
        ClinicalMeasurementReasonCode.BELOW_MINIMUM,
      );
    }

    const maxValue = parseClinicalDecimal(MAX_PERCENTAGE, 'bodyFatPercentage', PERCENTAGE_SCALE);

    if (value.greaterThan(maxValue)) {
      throw new BodyCompositionMeasurementDomainError(
        'bodyFatPercentage',
        ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM,
      );
    }

    return new BodyFatPercentage(value);
  }

  static fromDecimal(value: Decimal): BodyFatPercentage {
    return new BodyFatPercentage(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, PERCENTAGE_SCALE);
  }
}
