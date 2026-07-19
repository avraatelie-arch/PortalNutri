import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AppointmentNotFoundForEncounterError extends ApplicationError {
  readonly code = 'APPOINTMENT_NOT_FOUND_FOR_ENCOUNTER' as const;

  constructor(
    readonly tenantId: string,
    readonly appointmentId: string,
  ) {
    super(
      `Appointment with id "${appointmentId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'AppointmentNotFoundForEncounterError';
  }
}
