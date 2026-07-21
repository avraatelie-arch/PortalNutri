import { DomainError } from '../errors/domain-error.js';
import { ClinicalTextSection } from './clinical-text-section.js';
import { MEAL_PLAN_TEXT_MAX_LENGTH } from './therapeutic-strategy.js';

export class MealPlanCancellationReason {
  private constructor(private readonly section: ClinicalTextSection) {}

  static create(raw: string | null | undefined): MealPlanCancellationReason {
    const section = ClinicalTextSection.create(raw, MEAL_PLAN_TEXT_MAX_LENGTH);

    if (section.isEmpty()) {
      throw new DomainError('Cancellation reason is required.');
    }

    return new MealPlanCancellationReason(section);
  }

  static fromPersistence(
    value: string | null | undefined,
  ): MealPlanCancellationReason | null {
    if (value === null || value === undefined) {
      return null;
    }

    return new MealPlanCancellationReason(
      ClinicalTextSection.fromPersistence(value, MEAL_PLAN_TEXT_MAX_LENGTH),
    );
  }

  toPersistence(): string {
    const value = this.section.toPersistence();

    if (value === null) {
      throw new DomainError('Cancellation reason is required.');
    }

    return value;
  }
}
