import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import type { ClinicalEncounterRepository } from '../../domain/repositories/clinical-encounter-repository.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import { buildOutcomeTrackingCreationContext } from '../outcome-tracking-creation-context.js';
import { createOutcomeTrackingCreationContextErrors } from '../outcome-tracking-creation-context.errors.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { toOutcomeTrackingResult } from '../outcome-tracking-result.js';
import type { AnamnesisDirectoryPort } from '../ports/anamnesis-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryPort } from '../ports/patient-clinical-directory.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import { StartOutcomeTrackingCommand } from './start-outcome-tracking.command.js';

export class StartOutcomeTrackingHandler {
  private readonly creationContextErrors =
    createOutcomeTrackingCreationContextErrors();

  constructor(
    private readonly outcomeTrackingRepository: OutcomeTrackingRepository,
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
    private readonly clinicalEncounterRepository: ClinicalEncounterRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly patientClinicalDirectory: PatientClinicalDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly anamnesisDirectory: AnamnesisDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: StartOutcomeTrackingCommand) {
    return executeOutcomeTrackingUseCase(async () => {
      const {
        tenantId,
        patientId,
        clinicalObjectiveId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
      } = command.request;

      const context = await buildOutcomeTrackingCreationContext({
        tenantDirectory: this.tenantDirectory,
        patientClinicalDirectory: this.patientClinicalDirectory,
        nutritionistDirectory: this.nutritionistDirectory,
        clinicalEncounterRepository: this.clinicalEncounterRepository,
        anamnesisDirectory: this.anamnesisDirectory,
        clinicalObjectiveRepository: this.clinicalObjectiveRepository,
        request: {
          tenantId,
          patientId,
          clinicalObjectiveId,
          createdByNutritionistId,
          responsibleNutritionistId,
          originClinicalEncounterId,
          originAnamnesisId,
        },
        errors: this.creationContextErrors,
      });

      const tracking = OutcomeTracking.create({
        tenantId,
        patientId,
        clinicalObjectiveId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId: context.originClinicalEncounterId,
        originAnamnesisId,
        clinicalMomentAt: context.clinicalMomentAt,
        now: this.clock.now(),
      });

      await this.outcomeTrackingRepository.save(tracking);
      await this.eventDispatcher.dispatch(tracking.pullDomainEvents());

      return toOutcomeTrackingResult(tracking);
    });
  }
}
