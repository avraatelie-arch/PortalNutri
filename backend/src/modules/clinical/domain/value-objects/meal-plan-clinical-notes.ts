import { ClinicalTextSection } from './clinical-text-section.js';
import { MEAL_PLAN_TEXT_MAX_LENGTH } from './therapeutic-strategy.js';

export class MealPlanClinicalNotes {
  private constructor(private readonly section: ClinicalTextSection) {}

  static empty(): MealPlanClinicalNotes {
    return new MealPlanClinicalNotes(
      ClinicalTextSection.empty(MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  static create(raw: string | null | undefined): MealPlanClinicalNotes {
    return new MealPlanClinicalNotes(
      ClinicalTextSection.create(raw, MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  static fromPersistence(value: string | null | undefined): MealPlanClinicalNotes {
    return new MealPlanClinicalNotes(
      ClinicalTextSection.fromPersistence(value, MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  equals(other: MealPlanClinicalNotes): boolean {
    return this.section.equals(other.section);
  }

  isEmpty(): boolean {
    return this.section.isEmpty();
  }

  toPersistence(): string | null {
    return this.section.toPersistence();
  }
}
