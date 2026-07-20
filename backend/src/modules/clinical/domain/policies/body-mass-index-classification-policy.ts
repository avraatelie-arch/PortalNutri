import { Decimal } from '@prisma/client/runtime/library';
import { calculatePatientAgeAtDate } from '../services/patient-age-at-date.js';
import type { BodyMassIndex } from '../value-objects/body-mass-index.js';
import {
  BodyMassIndexClassification,
  type BodyMassIndexClassification as BodyMassIndexClassificationValue,
} from '../value-objects/body-mass-index-classification.js';

export interface BodyMassIndexClassificationInput {
  bmi: BodyMassIndex;
  birthDate: Date | null;
  measuredAt: Date;
}

export interface BodyMassIndexClassificationPolicy {
  supports(patientAge: number | null): boolean;
  classify(input: BodyMassIndexClassificationInput): BodyMassIndexClassificationValue;
}

export class DefaultBodyMassIndexClassificationPolicy
  implements BodyMassIndexClassificationPolicy
{
  supports(patientAge: number | null): boolean {
    return patientAge !== null && patientAge >= 18;
  }

  classify(input: BodyMassIndexClassificationInput): BodyMassIndexClassificationValue {
    if (input.birthDate === null) {
      return BodyMassIndexClassification.Unclassified;
    }

    const patientAge = calculatePatientAgeAtDate(input.birthDate, input.measuredAt);

    if (patientAge < 18) {
      return BodyMassIndexClassification.PediatricNotSupported;
    }

    return classifyAdultBmi(input.bmi.getValue());
  }
}

function classifyAdultBmi(bmi: Decimal): BodyMassIndexClassificationValue {
  const underweight = new Decimal('18.5');
  const normal = new Decimal('25');
  const overweight = new Decimal('30');
  const obesityI = new Decimal('35');
  const obesityII = new Decimal('40');

  if (bmi.lessThan(underweight)) {
    return BodyMassIndexClassification.Underweight;
  }

  if (bmi.lessThan(normal)) {
    return BodyMassIndexClassification.Normal;
  }

  if (bmi.lessThan(overweight)) {
    return BodyMassIndexClassification.Overweight;
  }

  if (bmi.lessThan(obesityI)) {
    return BodyMassIndexClassification.ObesityClassI;
  }

  if (bmi.lessThan(obesityII)) {
    return BodyMassIndexClassification.ObesityClassII;
  }

  return BodyMassIndexClassification.ObesityClassIII;
}
