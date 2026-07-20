import {
  ClinicalMeasurementReasonCode,
} from '../errors/clinical-measurement.domain-error.js';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';
import { normalizeClinicalSectionText } from './normalize-clinical-section-text.js';

export const BODY_COMPOSITION_NOTES_MAX_LENGTH = 5000;

export class BodyCompositionNotes {
  private constructor(private readonly value: string | null) {}

  static create(raw: string | null | undefined): BodyCompositionNotes {
    if (raw === null || raw === undefined) {
      return new BodyCompositionNotes(null);
    }

    const normalized = normalizeClinicalSectionText(raw);

    if (normalized === null) {
      return new BodyCompositionNotes(null);
    }

    if (normalized.length > BODY_COMPOSITION_NOTES_MAX_LENGTH) {
      throw new BodyCompositionMeasurementDomainError(
        'notes',
        ClinicalMeasurementReasonCode.EXCEEDS_MAX_LENGTH,
        String(BODY_COMPOSITION_NOTES_MAX_LENGTH),
      );
    }

    return new BodyCompositionNotes(normalized);
  }

  static fromPersistence(value: string | null): BodyCompositionNotes {
    return new BodyCompositionNotes(value);
  }

  toPersistence(): string | null {
    return this.value;
  }

  toString(): string | null {
    return this.value;
  }
}
