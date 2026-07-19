import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AppointmentNotCompletedError extends ApplicationError {
  readonly code = 'APPOINTMENT_NOT_COMPLETED' as const;

  constructor(
    readonly tenantId: string,
    readonly appointmentId: string,
  ) {
    super(
      `Appointment with id "${appointmentId}" must be completed before starting a clinical encounter.`,
    );
    this.name = 'AppointmentNotCompletedError';
  }
}
