import type { PatientRepository } from '../../domain/repositories/patient-repository.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { executePatientUseCase } from '../execute-patient-use-case.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { FindPatientQuery } from './find-patient.query.js';
import {
  toFindPatientResult,
  type FindPatientResult,
} from './find-patient.result.js';

export class FindPatientHandler {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(query: FindPatientQuery): Promise<FindPatientResult> {
    return executePatientUseCase(async () => {
      const patient = await this.patientRepository.findById(
        PatientId.create(query.patientId),
      );

      if (!patient) {
        throw new PatientNotFoundError(query.patientId);
      }

      return toFindPatientResult(patient);
    });
  }
}
