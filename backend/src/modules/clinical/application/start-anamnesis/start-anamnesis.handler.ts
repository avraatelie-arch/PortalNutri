import type { AnamnesisRepository } from '../../domain/repositories/anamnesis-repository.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { toAnamnesisResult } from '../anamnesis-result.js';
import { TenantNotFoundForAnamnesisError } from '../errors/tenant-not-found-for-anamnesis.error.js';
import { TenantInactiveForAnamnesisError } from '../errors/tenant-inactive-for-anamnesis.error.js';
import { ClinicalEncounterNotFoundForAnamnesisError } from '../errors/clinical-encounter-not-found-for-anamnesis.error.js';
import { ClinicalEncounterNotOpenForAnamnesisError } from '../errors/clinical-encounter-not-open-for-anamnesis.error.js';
import { ClinicalEncounterPatientMismatchError } from '../errors/clinical-encounter-patient-mismatch.error.js';
import { ClinicalEncounterNutritionistMismatchError } from '../errors/clinical-encounter-nutritionist-mismatch.error.js';
import { AnamnesisAlreadyExistsForEncounterError } from '../errors/anamnesis-already-exists-for-encounter.error.js';
import { StartAnamnesisCommand } from './start-anamnesis.command.js';

export class StartAnamnesisHandler {
  constructor(
    private readonly anamnesisRepository: AnamnesisRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: StartAnamnesisCommand) {
    return executeClinicalUseCase(async () => {
      const { tenantId, clinicalEncounterId, patientId, nutritionistId } =
        command.request;

      const tenant = await this.tenantDirectory.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundForAnamnesisError(tenantId);
      }

      if (tenant.status !== 'ACTIVE') {
        throw new TenantInactiveForAnamnesisError(tenantId);
      }

      const encounter = await this.clinicalEncounterDirectory.findByTenantAndId(
        tenantId,
        clinicalEncounterId,
      );

      if (!encounter) {
        throw new ClinicalEncounterNotFoundForAnamnesisError(
          tenantId,
          clinicalEncounterId,
        );
      }

      if (encounter.status !== 'OPEN') {
        throw new ClinicalEncounterNotOpenForAnamnesisError(
          tenantId,
          clinicalEncounterId,
        );
      }

      if (encounter.patientId !== patientId) {
        throw new ClinicalEncounterPatientMismatchError(
          tenantId,
          clinicalEncounterId,
          patientId,
        );
      }

      if (encounter.nutritionistId !== nutritionistId) {
        throw new ClinicalEncounterNutritionistMismatchError(
          tenantId,
          clinicalEncounterId,
          nutritionistId,
        );
      }

      const alreadyExists = await this.anamnesisRepository.existsByClinicalEncounter(
        tenantId,
        clinicalEncounterId,
      );

      if (alreadyExists) {
        throw new AnamnesisAlreadyExistsForEncounterError(
          tenantId,
          clinicalEncounterId,
        );
      }

      const now = this.clock.now();

      const anamnesis = Anamnesis.create({
        tenantId,
        clinicalEncounterId,
        patientId,
        nutritionistId,
        now,
      });

      await this.anamnesisRepository.save(anamnesis);
      await this.eventDispatcher.dispatch(anamnesis.pullDomainEvents());

      return toAnamnesisResult(anamnesis);
    });
  }
}
