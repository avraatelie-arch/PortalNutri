import { ClinicalTextSection } from './clinical-text-section.js';
import { MEAL_PLAN_TEXT_MAX_LENGTH } from './therapeutic-strategy.js';

export class GeneralGuidelines {
  private constructor(private readonly section: ClinicalTextSection) {}

  static empty(): GeneralGuidelines {
    return new GeneralGuidelines(
      ClinicalTextSection.empty(MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  static create(raw: string | null | undefined): GeneralGuidelines {
    return new GeneralGuidelines(
      ClinicalTextSection.create(raw, MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  static fromPersistence(value: string | null | undefined): GeneralGuidelines {
    return new GeneralGuidelines(
      ClinicalTextSection.fromPersistence(value, MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  equals(other: GeneralGuidelines): boolean {
    return this.section.equals(other.section);
  }

  isEmpty(): boolean {
    return this.section.isEmpty();
  }

  toPersistence(): string | null {
    return this.section.toPersistence();
  }
}
