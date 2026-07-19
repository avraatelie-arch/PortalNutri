import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNotFoundForAppointmentError extends ApplicationError {
  readonly code = 'PATIENT_NOT_FOUND_FOR_APPOINTMENT' as const;

  constructor(readonly patientId: string) {
    super(`Patient with id "${patientId}" was not found for appointment.`);
    this.name = 'PatientNotFoundForAppointmentError';
  }
}
