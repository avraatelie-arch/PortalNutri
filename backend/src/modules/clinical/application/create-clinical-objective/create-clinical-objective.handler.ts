import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import { parseClinicalObjectivePriority } from '../../domain/value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../../domain/value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../../domain/value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../../domain/value-objects/success-criteria.js';
import {
  buildClinicalObjectiveCreationContext,
} from '../clinical-objective-creation-context.js';
import { createClinicalObjectiveCreationContextErrors } from '../clinical-objective-creation-context.errors.js';
import { toClinicalObjectiveResult } from '../clinical-objective-result.js';
import { executeClinicalObjectiveUseCase } from '../execute-clinical-objective-use-case.js';
import { persistAndDispatchClinicalObjectiveEvents } from '../persist-and-dispatch-clinical-objective-events.js';
import type { AnamnesisDirectoryPort } from '../ports/anamnesis-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryPort } from '../ports/patient-clinical-directory.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import { CreateClinicalObjectiveCommand } from './create-clinical-objective.command.js';

export class CreateClinicalObjectiveHandler {
  private readonly creationContextErrors =
    createClinicalObjectiveCreationContextErrors();

  constructor(
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly patientClinicalDirectory: PatientClinicalDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly anamnesisDirectory: AnamnesisDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreateClinicalObjectiveCommand) {
    return executeClinicalObjectiveUseCase(async () => {
      const {
        tenantId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        type,
        priority,
        title,
        clinicalRationale,
        successCriteria,
        targetDate,
      } = command.request;

      await buildClinicalObjectiveCreationContext({
        tenantDirectory: this.tenantDirectory,
        patientClinicalDirectory: this.patientClinicalDirectory,
        nutritionistDirectory: this.nutritionistDirectory,
        clinicalEncounterDirectory: this.clinicalEncounterDirectory,
        anamnesisDirectory: this.anamnesisDirectory,
        request: {
          tenantId,
          patientId,
          createdByNutritionistId,
          responsibleNutritionistId,
          originClinicalEncounterId,
          originAnamnesisId,
        },
        errors: this.creationContextErrors,
      });

      const objective = ClinicalObjective.create({
        tenantId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        type: ClinicalObjectiveType.parse(type),
        priority: priority ? parseClinicalObjectivePriority(priority) : undefined,
        title: title !== undefined ? ClinicalObjectiveTitle.create(title) : undefined,
        clinicalRationale:
          clinicalRationale !== undefined
            ? ClinicalRationale.create(clinicalRationale)
            : undefined,
        successCriteria:
          successCriteria !== undefined
            ? SuccessCriteria.create(successCriteria)
            : undefined,
        targetDate,
        now: this.clock.now(),
      });

      await this.clinicalObjectiveRepository.save(objective);
      await this.eventDispatcher.dispatch(objective.pullDomainEvents());

      return toClinicalObjectiveResult(objective);
    });
  }
}
