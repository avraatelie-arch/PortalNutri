import type { Anamnesis } from '../aggregates/anamnesis.aggregate.js';
import { AnamnesisIncompleteDomainError } from '../errors/anamnesis-incomplete.domain-error.js';

export interface AnamnesisCompletionPolicy {
  validate(anamnesis: Anamnesis): void;
}

export class DefaultAnamnesisCompletionPolicy implements AnamnesisCompletionPolicy {
  validate(anamnesis: Anamnesis): void {
    if (anamnesis.getChiefComplaint().isEmpty()) {
      throw new AnamnesisIncompleteDomainError();
    }
  }
}
