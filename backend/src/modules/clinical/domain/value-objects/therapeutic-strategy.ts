import { ClinicalTextSection } from './clinical-text-section.js';

export const MEAL_PLAN_TEXT_MAX_LENGTH = 4000;

export class TherapeuticStrategy {
  private constructor(private readonly section: ClinicalTextSection) {}

  static empty(): TherapeuticStrategy {
    return new TherapeuticStrategy(
      ClinicalTextSection.empty(MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  static create(raw: string | null | undefined): TherapeuticStrategy {
    return new TherapeuticStrategy(
      ClinicalTextSection.create(raw, MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  static fromPersistence(value: string | null | undefined): TherapeuticStrategy {
    return new TherapeuticStrategy(
      ClinicalTextSection.fromPersistence(value, MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  equals(other: TherapeuticStrategy): boolean {
    return this.section.equals(other.section);
  }

  isEmpty(): boolean {
    return this.section.isEmpty();
  }

  toPersistence(): string | null {
    return this.section.toPersistence();
  }
}
