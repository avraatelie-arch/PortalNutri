import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AppointmentTenantMismatchError extends ApplicationError {
  readonly code = 'APPOINTMENT_TENANT_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly resourceType: 'patient' | 'nutritionist',
    readonly resourceId: string,
  ) {
    super(
      `${resourceType} "${resourceId}" does not belong to tenant "${tenantId}".`,
    );
    this.name = 'AppointmentTenantMismatchError';
  }
}
