import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import {
  ClinicalEvolutionSection,
  ClinicalEvolutionSectionValue,
} from '../../domain/value-objects/clinical-evolution-section.js';
import {
  AdherenceAndBarriers,
  AdverseEventsNotes,
  NextClinicalConsiderations,
  ProfessionalObservations,
  SubjectiveEvolution,
  TreatmentResponse,
} from '../../domain/value-objects/clinical-evolution-text-sections.js';
import { toClinicalEvolutionResult } from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedClinicalEvolution } from '../load-tenant-scoped-clinical-evolution.js';
import { mapClinicalEvolutionDomainError } from '../map-clinical-evolution-domain-error.js';
import { persistAndDispatchClinicalEvolutionEvents } from '../persist-and-dispatch-clinical-evolution-events.js';
import type { Clock } from '../ports/clock.port.js';
import { EditClinicalEvolutionCommand } from './edit-clinical-evolution.command.js';

export class EditClinicalEvolutionHandler {
  constructor(
    private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: EditClinicalEvolutionCommand) {
    return executeClinicalUseCase(async () => {
      const {
        tenantId,
        clinicalEvolutionId,
        subjectiveEvolution,
        professionalObservations,
        treatmentResponse,
        adherenceAndBarriers,
        adverseEventsNotes,
        nextClinicalConsiderations,
      } = command.request;

      const evolution = await loadTenantScopedClinicalEvolution(
        this.clinicalEvolutionRepository,
        tenantId,
        clinicalEvolutionId,
      );

      const now = this.clock.now();
      let changed = false;

      try {
        if (subjectiveEvolution !== undefined) {
          changed =
            evolution.updateSection(
              ClinicalEvolutionSection.fromValue(
                ClinicalEvolutionSectionValue.SubjectiveEvolution,
              ),
              SubjectiveEvolution.create(subjectiveEvolution),
              now,
            ) || changed;
        }

        if (professionalObservations !== undefined) {
          changed =
            evolution.updateSection(
              ClinicalEvolutionSection.fromValue(
                ClinicalEvolutionSectionValue.ProfessionalObservations,
              ),
              ProfessionalObservations.create(professionalObservations),
              now,
            ) || changed;
        }

        if (treatmentResponse !== undefined) {
          changed =
            evolution.updateSection(
              ClinicalEvolutionSection.fromValue(
                ClinicalEvolutionSectionValue.TreatmentResponse,
              ),
              TreatmentResponse.create(treatmentResponse),
              now,
            ) || changed;
        }

        if (adherenceAndBarriers !== undefined) {
          changed =
            evolution.updateSection(
              ClinicalEvolutionSection.fromValue(
                ClinicalEvolutionSectionValue.AdherenceAndBarriers,
              ),
              AdherenceAndBarriers.create(adherenceAndBarriers),
              now,
            ) || changed;
        }

        if (adverseEventsNotes !== undefined) {
          changed =
            evolution.updateSection(
              ClinicalEvolutionSection.fromValue(
                ClinicalEvolutionSectionValue.AdverseEventsNotes,
              ),
              AdverseEventsNotes.create(adverseEventsNotes),
              now,
            ) || changed;
        }

        if (nextClinicalConsiderations !== undefined) {
          changed =
            evolution.updateSection(
              ClinicalEvolutionSection.fromValue(
                ClinicalEvolutionSectionValue.NextClinicalConsiderations,
              ),
              NextClinicalConsiderations.create(nextClinicalConsiderations),
              now,
            ) || changed;
        }
      }
      catch (error) {
        mapClinicalEvolutionDomainError(
          tenantId,
          clinicalEvolutionId,
          'edit',
          error,
        );
      }

      if (changed) {
        await persistAndDispatchClinicalEvolutionEvents(
          this.clinicalEvolutionRepository,
          this.eventDispatcher,
          evolution,
        );
      }

      return toClinicalEvolutionResult(evolution);
    });
  }
}
