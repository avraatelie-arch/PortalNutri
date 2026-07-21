import { DomainError } from '../errors/domain-error.js';
import { ClinicalObjectiveTitleRequiredDomainError } from '../errors/clinical-objective-title-required.domain-error.js';

export const CLINICAL_OBJECTIVE_TITLE_MAX_LENGTH = 200;

export class ClinicalObjectiveTitle {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): ClinicalObjectiveTitle {
    if (value === null || value === undefined) {
      return new ClinicalObjectiveTitle('');
    }

    const normalized = normalizeTitle(value);

    if (normalized.length > CLINICAL_OBJECTIVE_TITLE_MAX_LENGTH) {
      throw new DomainError(
        `Clinical objective title must not exceed ${CLINICAL_OBJECTIVE_TITLE_MAX_LENGTH} characters.`,
      );
    }

    return new ClinicalObjectiveTitle(normalized);
  }

  static createForActivation(value: string): ClinicalObjectiveTitle {
    const title = ClinicalObjectiveTitle.create(value);

    if (title.isEmpty()) {
      throw new ClinicalObjectiveTitleRequiredDomainError();
    }

    return title;
  }

  static fromPersistence(value: string): ClinicalObjectiveTitle {
    return new ClinicalObjectiveTitle(value ?? '');
  }

  equals(other: ClinicalObjectiveTitle): boolean {
    return this.value === other.value;
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  toPersistence(): string {
    return this.value;
  }
}

function normalizeTitle(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
