import type { Decimal } from '@prisma/client/runtime/library';
import {
  ClinicalMeasurementDomainError,
  ClinicalMeasurementReasonCode,
} from '../errors/clinical-measurement.domain-error.js';
import {
  formatClinicalDecimal,
  parseClinicalDecimal,
} from './clinical-decimal-utils.js';

const HEIGHT_SCALE = 2;

export class BodyHeight {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string): BodyHeight {
    const value = parseClinicalDecimal(raw, 'heightCm', HEIGHT_SCALE);
    const minHeight = parseClinicalDecimal('30', 'heightCm', HEIGHT_SCALE);
    const maxHeight = parseClinicalDecimal('300', 'heightCm', HEIGHT_SCALE);

    if (value.lessThan(minHeight)) {
      throw new ClinicalMeasurementDomainError(
        'heightCm',
        ClinicalMeasurementReasonCode.BELOW_MINIMUM,
      );
    }

    if (value.greaterThan(maxHeight)) {
      throw new ClinicalMeasurementDomainError(
        'heightCm',
        ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM,
      );
    }

    return new BodyHeight(value);
  }

  static fromDecimal(value: Decimal): BodyHeight {
    return new BodyHeight(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, HEIGHT_SCALE);
  }
}
