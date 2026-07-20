import type { Decimal } from '@prisma/client/runtime/library';
import { ClinicalMeasurementReasonCode } from '../errors/clinical-measurement.domain-error.js';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import {
  formatClinicalDecimal,
  isClinicalDecimalNegative,
  parseClinicalDecimal,
  parseOptionalClinicalDecimal,
} from './clinical-decimal-utils.js';

const VISCERAL_FAT_SCALE = 2;
const MAX_VISCERAL_FAT_LEVEL = '100';

export class VisceralFatLevel {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string): VisceralFatLevel {
    const value = parseClinicalDecimal(raw, 'visceralFatLevel', VISCERAL_FAT_SCALE);
    return VisceralFatLevel.fromValidatedDecimal(value);
  }

  static createOptional(raw: string | null | undefined): VisceralFatLevel | null {
    const value = parseOptionalClinicalDecimal(raw, 'visceralFatLevel', VISCERAL_FAT_SCALE);

    if (value === null) {
      return null;
    }

    return VisceralFatLevel.fromValidatedDecimal(value);
  }

  static fromDecimal(value: Decimal): VisceralFatLevel {
    return new VisceralFatLevel(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, VISCERAL_FAT_SCALE);
  }

  private static fromValidatedDecimal(value: Decimal): VisceralFatLevel {
    if (isClinicalDecimalNegative(value)) {
      throw new BodyCompositionMeasurementDomainError(
        'visceralFatLevel',
        ClinicalMeasurementReasonCode.BELOW_MINIMUM,
      );
    }

    const maxValue = parseClinicalDecimal(MAX_VISCERAL_FAT_LEVEL, 'visceralFatLevel', VISCERAL_FAT_SCALE);

    if (value.greaterThan(maxValue)) {
      throw new BodyCompositionMeasurementDomainError(
        'visceralFatLevel',
        ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM,
      );
    }

    return new VisceralFatLevel(value);
  }
}
