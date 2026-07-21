import { ClinicalTextSection } from './clinical-text-section.js';

export const MEAL_CONTENT_MAX_LENGTH = 4000;

export class MealContent {
  private constructor(private readonly section: ClinicalTextSection) {}

  static empty(): MealContent {
    return new MealContent(ClinicalTextSection.empty(MEAL_CONTENT_MAX_LENGTH));
  }

  static create(raw: string | null | undefined): MealContent {
    return new MealContent(
      ClinicalTextSection.create(raw, MEAL_CONTENT_MAX_LENGTH),
    );
  }

  static fromPersistence(value: string | null | undefined): MealContent {
    return new MealContent(
      ClinicalTextSection.fromPersistence(value, MEAL_CONTENT_MAX_LENGTH),
    );
  }

  equals(other: MealContent): boolean {
    return this.section.equals(other.section);
  }

  isEmpty(): boolean {
    return this.section.isEmpty();
  }

  toPersistence(): string | null {
    return this.section.toPersistence();
  }
}
