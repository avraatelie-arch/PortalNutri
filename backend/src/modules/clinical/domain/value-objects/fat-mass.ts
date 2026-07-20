import type { Decimal } from '@prisma/client/runtime/library';
import { ClinicalMeasurementReasonCode } from '../errors/clinical-measurement.domain-error.js';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import {
  formatClinicalDecimal,
  isClinicalDecimalNegative,
  parseClinicalDecimal,
  parseOptionalClinicalDecimal,
} from './clinical-decimal-utils.js';

const MASS_SCALE = 2;
const MAX_MASS_KG = '500';

function validateNonNegativeMass(value: Decimal, fieldName: string): void {
  if (isClinicalDecimalNegative(value)) {
    throw new BodyCompositionMeasurementDomainError(
      fieldName,
      ClinicalMeasurementReasonCode.BELOW_MINIMUM,
    );
  }

  const maxMass = parseClinicalDecimal(MAX_MASS_KG, fieldName, MASS_SCALE);

  if (value.greaterThan(maxMass)) {
    throw new BodyCompositionMeasurementDomainError(
      fieldName,
      ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM,
    );
  }
}

export class FatMass {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string): FatMass {
    const value = parseClinicalDecimal(raw, 'fatMassKg', MASS_SCALE);
    validateNonNegativeMass(value, 'fatMassKg');
    return new FatMass(value);
  }

  static createOptional(raw: string | null | undefined): FatMass | null {
    const value = parseOptionalClinicalDecimal(raw, 'fatMassKg', MASS_SCALE);

    if (value === null) {
      return null;
    }

    validateNonNegativeMass(value, 'fatMassKg');
    return new FatMass(value);
  }

  static fromDecimal(value: Decimal): FatMass {
    return new FatMass(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, MASS_SCALE);
  }
}
