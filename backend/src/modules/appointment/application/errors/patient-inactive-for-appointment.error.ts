import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientInactiveForAppointmentError extends ApplicationError {
  readonly code = 'PATIENT_INACTIVE_FOR_APPOINTMENT' as const;

  constructor(readonly patientId: string) {
    super(`Patient with id "${patientId}" is inactive.`);
    this.name = 'PatientInactiveForAppointmentError';
  }
}
