import type { Decimal } from '@prisma/client/runtime/library';
import { ClinicalMeasurementReasonCode } from '../errors/clinical-measurement.domain-error.js';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import {
  formatClinicalDecimal,
  isClinicalDecimalNegative,
  parseClinicalDecimal,
  parseOptionalClinicalDecimal,
} from './clinical-decimal-utils.js';

const PERCENTAGE_SCALE = 2;
const MAX_PERCENTAGE = '100';

export class BodyWaterPercentage {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string): BodyWaterPercentage {
    const value = parseClinicalDecimal(raw, 'bodyWaterPercentage', PERCENTAGE_SCALE);
    return BodyWaterPercentage.fromValidatedDecimal(value);
  }

  static createOptional(raw: string | null | undefined): BodyWaterPercentage | null {
    const value = parseOptionalClinicalDecimal(raw, 'bodyWaterPercentage', PERCENTAGE_SCALE);

    if (value === null) {
      return null;
    }

    return BodyWaterPercentage.fromValidatedDecimal(value);
  }

  static fromDecimal(value: Decimal): BodyWaterPercentage {
    return new BodyWaterPercentage(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, PERCENTAGE_SCALE);
  }

  private static fromValidatedDecimal(value: Decimal): BodyWaterPercentage {
    if (isClinicalDecimalNegative(value)) {
      throw new BodyCompositionMeasurementDomainError(
        'bodyWaterPercentage',
        ClinicalMeasurementReasonCode.BELOW_MINIMUM,
      );
    }

    const maxValue = parseClinicalDecimal(MAX_PERCENTAGE, 'bodyWaterPercentage', PERCENTAGE_SCALE);

    if (value.greaterThan(maxValue)) {
      throw new BodyCompositionMeasurementDomainError(
        'bodyWaterPercentage',
        ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM,
      );
    }

    return new BodyWaterPercentage(value);
  }
}
