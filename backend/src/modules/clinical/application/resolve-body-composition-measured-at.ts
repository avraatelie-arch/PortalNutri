import type { Clock } from './ports/clock.port.js';
import {
  resolveClinicalMeasuredAt,
  validateClinicalMeasuredAt,
} from './resolve-clinical-measured-at.js';
import { BodyCompositionAssessmentBeforeBirthError } from './errors/body-composition-assessment-before-birth.error.js';
import { BodyCompositionAssessmentFutureDateError } from './errors/body-composition-assessment-future-date.error.js';

export function resolveBodyCompositionMeasuredAt(
  measuredAt: Date | undefined,
  clock: Clock,
): Date {
  return resolveClinicalMeasuredAt(measuredAt, clock);
}

export function validateBodyCompositionMeasuredAt(
  measuredAt: Date,
  clock: Clock,
  birthDate: Date | null,
  tenantId: string,
  patientId: string,
): void {
  validateClinicalMeasuredAt(measuredAt, clock, birthDate, {
    onFutureDate: () =>
      new BodyCompositionAssessmentFutureDateError(tenantId, patientId),
    onBeforeBirth: () =>
      new BodyCompositionAssessmentBeforeBirthError(tenantId, patientId),
  });
}
