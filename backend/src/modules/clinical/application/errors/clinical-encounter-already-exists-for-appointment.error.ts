import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterAlreadyExistsForAppointmentError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_ALREADY_EXISTS_FOR_APPOINTMENT' as const;

  constructor(
    readonly tenantId: string,
    readonly appointmentId: string,
  ) {
    super(
      `A clinical encounter already exists for appointment "${appointmentId}" in tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterAlreadyExistsForAppointmentError';
  }
}
