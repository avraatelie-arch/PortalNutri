import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantNotFoundForAppointmentError extends ApplicationError {
  readonly code = 'TENANT_NOT_FOUND_FOR_APPOINTMENT' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" was not found for appointment.`);
    this.name = 'TenantNotFoundForAppointmentError';
  }
}
