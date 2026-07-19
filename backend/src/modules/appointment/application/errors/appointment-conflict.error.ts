import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AppointmentConflictError extends ApplicationError {
  readonly code = 'APPOINTMENT_CONFLICT' as const;

  constructor(readonly tenantId: string) {
    super(
      `An appointment conflict exists for the requested time range in tenant "${tenantId}".`,
    );
    this.name = 'AppointmentConflictError';
  }
}
