import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AppointmentNotFoundError extends ApplicationError {
  readonly code = 'APPOINTMENT_NOT_FOUND' as const;

  constructor(
    readonly tenantId: string,
    readonly appointmentId: string,
  ) {
    super(
      `Appointment with id "${appointmentId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'AppointmentNotFoundError';
  }
}
