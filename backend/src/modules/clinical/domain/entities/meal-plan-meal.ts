import { MealContent } from '../value-objects/meal-content.js';
import { MealName } from '../value-objects/meal-name.js';
import { MealPlanMealId } from '../value-objects/meal-plan-meal-id.js';
import { MealScheduledTime } from '../value-objects/meal-scheduled-time.js';
import { MealSubstitutionNotes } from '../value-objects/meal-substitution-notes.js';

export interface MealPlanMealProps {
  id?: MealPlanMealId;
  sortOrder: number;
  name: MealName;
  scheduledTime?: MealScheduledTime | null;
  content: MealContent;
  substitutionNotes?: MealSubstitutionNotes;
}

export interface ReconstituteMealPlanMealProps {
  id: MealPlanMealId;
  sortOrder: number;
  name: MealName;
  scheduledTime: MealScheduledTime | null;
  content: MealContent;
  substitutionNotes: MealSubstitutionNotes;
}

export class MealPlanMeal {
  private constructor(
    private readonly id: MealPlanMealId,
    private readonly sortOrder: number,
    private readonly name: MealName,
    private readonly scheduledTime: MealScheduledTime | null,
    private readonly content: MealContent,
    private readonly substitutionNotes: MealSubstitutionNotes,
  ) {}

  static create(props: MealPlanMealProps): MealPlanMeal {
    return new MealPlanMeal(
      props.id ?? MealPlanMealId.generate(),
      props.sortOrder,
      props.name,
      props.scheduledTime ?? null,
      props.content,
      props.substitutionNotes ?? MealSubstitutionNotes.empty(),
    );
  }

  static reconstitute(props: ReconstituteMealPlanMealProps): MealPlanMeal {
    return new MealPlanMeal(
      props.id,
      props.sortOrder,
      props.name,
      props.scheduledTime,
      props.content,
      props.substitutionNotes,
    );
  }

  getId(): MealPlanMealId {
    return this.id;
  }

  getSortOrder(): number {
    return this.sortOrder;
  }

  getName(): MealName {
    return this.name;
  }

  getScheduledTime(): MealScheduledTime | null {
    return this.scheduledTime;
  }

  getContent(): MealContent {
    return this.content;
  }

  getSubstitutionNotes(): MealSubstitutionNotes {
    return this.substitutionNotes;
  }

  equals(other: MealPlanMeal): boolean {
    return (
      this.id.toString() === other.id.toString()
      && this.sortOrder === other.sortOrder
      && this.name.equals(other.name)
      && (
        (this.scheduledTime === null && other.scheduledTime === null)
        || (this.scheduledTime !== null
          && other.scheduledTime !== null
          && this.scheduledTime.equals(other.scheduledTime))
      )
      && this.content.equals(other.content)
      && this.substitutionNotes.equals(other.substitutionNotes)
    );
  }
}
