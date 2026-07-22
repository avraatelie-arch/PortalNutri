import type { ClinicalEvolution } from '../aggregates/clinical-evolution.aggregate.js';
import { ClinicalEvolutionFinalizationRequirementsNotMetDomainError } from '../errors/clinical-evolution-finalization-requirements-not-met.domain-error.js';

export interface EvolutionFinalizationPolicy {
  validate(evolution: ClinicalEvolution): void;
}

export class DefaultEvolutionFinalizationPolicy implements EvolutionFinalizationPolicy {
  validate(evolution: ClinicalEvolution): void {
    const hasGroupA =
      !evolution.getSubjectiveEvolution().isEmpty()
      || !evolution.getProfessionalObservations().isEmpty()
      || !evolution.getTreatmentResponse().isEmpty();

    const hasGroupB =
      !evolution.getProfessionalObservations().isEmpty()
      || !evolution.getNextClinicalConsiderations().isEmpty();

    if (!hasGroupA || !hasGroupB) {
      throw new ClinicalEvolutionFinalizationRequirementsNotMetDomainError();
    }
  }
}
