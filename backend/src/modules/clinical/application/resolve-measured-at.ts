import type { Clock } from './ports/clock.port.js';
import { AnthropometricAssessmentBeforeBirthError } from './errors/anthropometric-assessment-before-birth.error.js';
import { AnthropometricAssessmentFutureDateError } from './errors/anthropometric-assessment-future-date.error.js';
import {
  MEASURED_AT_FUTURE_TOLERANCE_MS,
  resolveClinicalMeasuredAt,
  validateClinicalMeasuredAt,
} from './resolve-clinical-measured-at.js';

export { MEASURED_AT_FUTURE_TOLERANCE_MS };

export function resolveMeasuredAt(
  measuredAt: Date | undefined,
  clock: Clock,
): Date {
  return resolveClinicalMeasuredAt(measuredAt, clock);
}

export function validateMeasuredAt(
  measuredAt: Date,
  clock: Clock,
  birthDate: Date | null,
  tenantId: string,
  patientId: string,
): void {
  validateClinicalMeasuredAt(measuredAt, clock, birthDate, {
    onFutureDate: () => new AnthropometricAssessmentFutureDateError(tenantId, patientId),
    onBeforeBirth: () => new AnthropometricAssessmentBeforeBirthError(tenantId, patientId),
  });
}
