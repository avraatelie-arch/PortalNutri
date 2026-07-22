import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import type { ClinicalEncounterRepository } from '../../domain/repositories/clinical-encounter-repository.js';
import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import { toClinicalEvolutionResult } from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { ClinicalEncounterNotFoundForClinicalEvolutionError } from '../errors/clinical-encounter-not-found-for-clinical-evolution.error.js';
import { ClinicalEncounterNotOpenForClinicalEvolutionError } from '../errors/clinical-encounter-not-open-for-clinical-evolution.error.js';
import { ClinicalEncounterNutritionistMismatchForClinicalEvolutionError } from '../errors/clinical-encounter-nutritionist-mismatch-for-clinical-evolution.error.js';
import { ClinicalEncounterPatientMismatchForClinicalEvolutionError } from '../errors/clinical-encounter-patient-mismatch-for-clinical-evolution.error.js';
import { ClinicalEvolutionAlreadyExistsForEncounterError } from '../errors/clinical-evolution-already-exists-for-encounter.error.js';
import { TenantInactiveForClinicalEvolutionError } from '../errors/tenant-inactive-for-clinical-evolution.error.js';
import { TenantNotFoundForClinicalEvolutionError } from '../errors/tenant-not-found-for-clinical-evolution.error.js';
import { persistAndDispatchClinicalEvolutionEvents } from '../persist-and-dispatch-clinical-evolution-events.js';
import type { Clock } from '../ports/clock.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import { StartClinicalEvolutionCommand } from './start-clinical-evolution.command.js';

export class StartClinicalEvolutionHandler {
  constructor(
    private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository,
    private readonly clinicalEncounterRepository: ClinicalEncounterRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: StartClinicalEvolutionCommand) {
    return executeClinicalUseCase(async () => {
      const {
        tenantId,
        clinicalEncounterId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
      } = command.request;

      const tenant = await this.tenantDirectory.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundForClinicalEvolutionError(tenantId);
      }

      if (tenant.status !== 'ACTIVE') {
        throw new TenantInactiveForClinicalEvolutionError(tenantId);
      }

      const encounter = await this.clinicalEncounterRepository.findByTenantAndId(
        tenantId,
        ClinicalEncounterId.create(clinicalEncounterId),
      );

      if (!encounter) {
        throw new ClinicalEncounterNotFoundForClinicalEvolutionError(
          tenantId,
          clinicalEncounterId,
        );
      }

      if (encounter.getStatus() !== ClinicalEncounterStatus.Open) {
        throw new ClinicalEncounterNotOpenForClinicalEvolutionError(
          tenantId,
          clinicalEncounterId,
        );
      }

      if (encounter.getPatientId() !== patientId) {
        throw new ClinicalEncounterPatientMismatchForClinicalEvolutionError(
          tenantId,
          clinicalEncounterId,
          patientId,
        );
      }

      if (encounter.getNutritionistId() !== responsibleNutritionistId) {
        throw new ClinicalEncounterNutritionistMismatchForClinicalEvolutionError(
          tenantId,
          clinicalEncounterId,
          responsibleNutritionistId,
        );
      }

      const alreadyExists =
        await this.clinicalEvolutionRepository.existsByClinicalEncounter(
          tenantId,
          clinicalEncounterId,
        );

      if (alreadyExists) {
        throw new ClinicalEvolutionAlreadyExistsForEncounterError(
          tenantId,
          clinicalEncounterId,
        );
      }

      const now = this.clock.now();

      const evolution = ClinicalEvolution.create({
        tenantId,
        clinicalEncounterId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        clinicalMomentAt: encounter.getStartedAt(),
        now,
      });

      await this.clinicalEvolutionRepository.save(evolution);
      await this.eventDispatcher.dispatch(evolution.pullDomainEvents());

      return toClinicalEvolutionResult(evolution);
    });
  }
}
