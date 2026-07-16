import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { TenantRepository } from '../../iam/domain/repositories/tenant-repository.js';
import type { PatientRepository } from '../domain/repositories/patient-repository.js';
import { ActivatePatientHandler } from '../application/activate-patient/activate-patient.handler.js';
import { CreatePatientHandler } from '../application/create-patient/create-patient.handler.js';
import { DeactivatePatientHandler } from '../application/deactivate-patient/deactivate-patient.handler.js';
import { FindPatientHandler } from '../application/find-patient/find-patient.handler.js';
import { UpdatePatientProfileHandler } from '../application/update-patient-profile/update-patient-profile.handler.js';

export interface PatientFactoryDependencies {
  patientRepository: PatientRepository;
  tenantRepository: TenantRepository;
  eventDispatcher: EventDispatcher;
}

export interface PatientHandlers {
  createPatientHandler: CreatePatientHandler;
  findPatientHandler: FindPatientHandler;
  activatePatientHandler: ActivatePatientHandler;
  deactivatePatientHandler: DeactivatePatientHandler;
  updatePatientProfileHandler: UpdatePatientProfileHandler;
}

export function createPatientHandlers({
  patientRepository,
  tenantRepository,
  eventDispatcher,
}: PatientFactoryDependencies): PatientHandlers {
  return {
    createPatientHandler: new CreatePatientHandler(
      patientRepository,
      tenantRepository,
      eventDispatcher,
    ),
    findPatientHandler: new FindPatientHandler(patientRepository),
    activatePatientHandler: new ActivatePatientHandler(
      patientRepository,
      eventDispatcher,
    ),
    deactivatePatientHandler: new DeactivatePatientHandler(
      patientRepository,
      eventDispatcher,
    ),
    updatePatientProfileHandler: new UpdatePatientProfileHandler(
      patientRepository,
      eventDispatcher,
    ),
  };
}
