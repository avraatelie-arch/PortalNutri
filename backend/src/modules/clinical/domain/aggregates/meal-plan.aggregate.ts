import { AggregateRoot } from './aggregate-root.js';
import { MealPlanMeal } from '../entities/meal-plan-meal.js';
import { MealPlanActivationRequirementsNotMetDomainError } from '../errors/meal-plan-activation-requirements-not-met.domain-error.js';
import { MealPlanCancellationReasonRequiredDomainError } from '../errors/meal-plan-cancellation-reason-required.domain-error.js';
import { MealPlanInvalidTransitionDomainError } from '../errors/meal-plan-invalid-transition.domain-error.js';
import { MEAL_PLAN_MAX_MEALS, MealPlanMaxMealsExceededDomainError } from '../errors/meal-plan-max-meals-exceeded.domain-error.js';
import { MealPlanTerminalDomainError } from '../errors/meal-plan-terminal.domain-error.js';
import {
  MealPlanActivated,
  MealPlanCancelled,
  MealPlanCreated,
  MealPlanResponsibleNutritionistChanged,
  MealPlanUpdated,
} from '../events/meal-plan-events.js';
import { GeneralGuidelines } from '../value-objects/general-guidelines.js';
import type { MealPlanCancellationReason } from '../value-objects/meal-plan-cancellation-reason.js';
import { MealPlanClinicalNotes } from '../value-objects/meal-plan-clinical-notes.js';
import { MealPlanId } from '../value-objects/meal-plan-id.js';
import {
  MealPlanStatusValue,
  isTerminalMealPlanStatus,
  type MealPlanStatus,
} from '../value-objects/meal-plan-status.js';
import { MealPlanTitle } from '../value-objects/meal-plan-title.js';
import type { MealPlanType } from '../value-objects/meal-plan-type.js';
import { TherapeuticStrategy } from '../value-objects/therapeutic-strategy.js';

export type MealPlanChangedField =
  | 'title'
  | 'planType'
  | 'therapeuticStrategy'
  | 'generalGuidelines'
  | 'clinicalNotes'
  | 'validFrom'
  | 'validUntil'
  | 'meals';

export interface CreateMealPlanProps {
  id?: MealPlanId;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  planType?: MealPlanType | null;
  title?: MealPlanTitle;
  therapeuticStrategy?: TherapeuticStrategy;
  generalGuidelines?: GeneralGuidelines;
  clinicalNotes?: MealPlanClinicalNotes;
  validFrom?: Date | null;
  validUntil?: Date | null;
  meals?: MealPlanMeal[];
  now: Date;
}

export interface ReconstituteMealPlanProps {
  id: MealPlanId;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  planType: MealPlanType | null;
  status: MealPlanStatus;
  version: number;
  title: MealPlanTitle;
  therapeuticStrategy: TherapeuticStrategy;
  generalGuidelines: GeneralGuidelines;
  clinicalNotes: MealPlanClinicalNotes;
  validFrom: Date | null;
  validUntil: Date | null;
  cancellationReason: MealPlanCancellationReason | null;
  activatedAt: Date | null;
  cancelledAt: Date | null;
  meals: MealPlanMeal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EditMealPlanProps {
  title?: MealPlanTitle;
  planType?: MealPlanType | null;
  therapeuticStrategy?: TherapeuticStrategy;
  generalGuidelines?: GeneralGuidelines;
  clinicalNotes?: MealPlanClinicalNotes;
  validFrom?: Date | null;
  validUntil?: Date | null;
  meals?: MealPlanMeal[];
}

export interface CancelMealPlanProps {
  cancellationReason?: MealPlanCancellationReason;
}

export class MealPlan extends AggregateRoot {
  private constructor(
    private readonly id: MealPlanId,
    private readonly tenantId: string,
    private readonly patientId: string,
    private readonly createdByNutritionistId: string,
    private responsibleNutritionistId: string,
    private readonly originClinicalEncounterId: string | null,
    private readonly originAnamnesisId: string | null,
    private planType: MealPlanType | null,
    private status: MealPlanStatus,
    private version: number,
    private title: MealPlanTitle,
    private therapeuticStrategy: TherapeuticStrategy,
    private generalGuidelines: GeneralGuidelines,
    private clinicalNotes: MealPlanClinicalNotes,
    private validFrom: Date | null,
    private validUntil: Date | null,
    private cancellationReason: MealPlanCancellationReason | null,
    private activatedAt: Date | null,
    private cancelledAt: Date | null,
    private meals: MealPlanMeal[],
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateMealPlanProps): MealPlan {
    const id = props.id ?? MealPlanId.generate();
    const originClinicalEncounterId = props.originClinicalEncounterId ?? null;
    const originAnamnesisId = props.originAnamnesisId ?? null;
    const planType = props.planType ?? null;
    const title = props.title ?? MealPlanTitle.create('');
    const therapeuticStrategy = props.therapeuticStrategy ?? TherapeuticStrategy.empty();
    const generalGuidelines = props.generalGuidelines ?? GeneralGuidelines.empty();
    const clinicalNotes = props.clinicalNotes ?? MealPlanClinicalNotes.empty();
    const validFrom = props.validFrom ? new Date(props.validFrom) : null;
    const validUntil = props.validUntil ? new Date(props.validUntil) : null;
    const meals = props.meals ?? [];

    validateMeals(meals);

    const mealPlan = new MealPlan(
      id,
      props.tenantId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      originClinicalEncounterId,
      originAnamnesisId,
      planType,
      MealPlanStatusValue.Draft,
      1,
      title,
      therapeuticStrategy,
      generalGuidelines,
      clinicalNotes,
      validFrom,
      validUntil,
      null,
      null,
      null,
      meals,
      props.now,
      props.now,
    );

    mealPlan.addDomainEvent(
      new MealPlanCreated(
        id.toString(),
        props.tenantId,
        props.patientId,
        props.createdByNutritionistId,
        props.responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        planType?.toPersistence() ?? null,
        MealPlanStatusValue.Draft,
        1,
        props.now,
      ),
    );

    return mealPlan;
  }

  static reconstitute(props: ReconstituteMealPlanProps): MealPlan {
    return new MealPlan(
      props.id,
      props.tenantId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      props.originClinicalEncounterId,
      props.originAnamnesisId,
      props.planType,
      props.status,
      props.version,
      props.title,
      props.therapeuticStrategy,
      props.generalGuidelines,
      props.clinicalNotes,
      props.validFrom ? new Date(props.validFrom) : null,
      props.validUntil ? new Date(props.validUntil) : null,
      props.cancellationReason,
      props.activatedAt ? new Date(props.activatedAt) : null,
      props.cancelledAt ? new Date(props.cancelledAt) : null,
      props.meals,
      props.createdAt,
      props.updatedAt,
    );
  }

  edit(props: EditMealPlanProps, now: Date): MealPlanChangedField[] {
    ensureMutable(this.status);

    if (this.status !== MealPlanStatusValue.Draft) {
      throw new MealPlanInvalidTransitionDomainError(this.status, 'edit');
    }

    const changedFields: MealPlanChangedField[] = [];

    if (props.title !== undefined && !this.title.equals(props.title)) {
      this.title = props.title;
      changedFields.push('title');
    }

    if (props.planType !== undefined) {
      const nextPlanType = props.planType?.toPersistence() ?? null;
      const currentPlanType = this.planType?.toPersistence() ?? null;

      if (nextPlanType !== currentPlanType) {
        this.planType = props.planType;
        changedFields.push('planType');
      }
    }

    if (
      props.therapeuticStrategy !== undefined
      && !this.therapeuticStrategy.equals(props.therapeuticStrategy)
    ) {
      this.therapeuticStrategy = props.therapeuticStrategy;
      changedFields.push('therapeuticStrategy');
    }

    if (
      props.generalGuidelines !== undefined
      && !this.generalGuidelines.equals(props.generalGuidelines)
    ) {
      this.generalGuidelines = props.generalGuidelines;
      changedFields.push('generalGuidelines');
    }

    if (
      props.clinicalNotes !== undefined
      && !this.clinicalNotes.equals(props.clinicalNotes)
    ) {
      this.clinicalNotes = props.clinicalNotes;
      changedFields.push('clinicalNotes');
    }

    if (props.validFrom !== undefined) {
      const nextValidFrom = props.validFrom ? new Date(props.validFrom) : null;
      const currentTime = this.validFrom?.getTime() ?? null;
      const nextTime = nextValidFrom?.getTime() ?? null;

      if (currentTime !== nextTime) {
        this.validFrom = nextValidFrom;
        changedFields.push('validFrom');
      }
    }

    if (props.validUntil !== undefined) {
      const nextValidUntil = props.validUntil ? new Date(props.validUntil) : null;
      const currentTime = this.validUntil?.getTime() ?? null;
      const nextTime = nextValidUntil?.getTime() ?? null;

      if (currentTime !== nextTime) {
        this.validUntil = nextValidUntil;
        changedFields.push('validUntil');
      }
    }

    if (props.meals !== undefined) {
      validateMeals(props.meals);

      if (!mealsEqual(this.meals, props.meals)) {
        this.meals = props.meals;
        changedFields.push('meals');
      }
    }

    if (changedFields.length === 0) {
      return changedFields;
    }

    this.bumpVersion(now);
    this.addDomainEvent(
      new MealPlanUpdated(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.version,
        changedFields,
        now,
      ),
    );

    return changedFields;
  }

  activate(now: Date): void {
    ensureMutable(this.status);

    if (this.status !== MealPlanStatusValue.Draft) {
      throw new MealPlanInvalidTransitionDomainError(this.status, 'activate');
    }

    if (this.title.isEmpty()) {
      throw new MealPlanActivationRequirementsNotMetDomainError();
    }

    const hasTherapeuticStrategy = !this.therapeuticStrategy.isEmpty();
    const hasMealContent = this.meals.some((meal) => !meal.getContent().isEmpty());

    if (!hasTherapeuticStrategy && !hasMealContent) {
      throw new MealPlanActivationRequirementsNotMetDomainError();
    }

    this.status = MealPlanStatusValue.Active;
    this.activatedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new MealPlanActivated(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.responsibleNutritionistId,
        this.planType?.toPersistence() ?? null,
        this.status,
        this.version,
        now,
        now,
      ),
    );
  }

  /**
   * Cancelling an ACTIVE meal plan is an exceptional administrative operation.
   * Clinical updates must create a new meal plan instead of modifying an active one.
   */
  cancel(props: CancelMealPlanProps, now: Date): void {
    ensureMutable(this.status);

    if (
      this.status !== MealPlanStatusValue.Draft
      && this.status !== MealPlanStatusValue.Active
    ) {
      throw new MealPlanInvalidTransitionDomainError(this.status, 'cancel');
    }

    if (this.status === MealPlanStatusValue.Active) {
      if (!props.cancellationReason) {
        throw new MealPlanCancellationReasonRequiredDomainError();
      }

      this.cancellationReason = props.cancellationReason;
    }

    this.status = MealPlanStatusValue.Cancelled;
    this.cancelledAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new MealPlanCancelled(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.responsibleNutritionistId,
        this.status,
        this.version,
        now,
        now,
      ),
    );
  }

  changeResponsibleNutritionist(
    responsibleNutritionistId: string,
    now: Date,
  ): boolean {
    ensureMutable(this.status);

    if (this.responsibleNutritionistId === responsibleNutritionistId) {
      return false;
    }

    this.responsibleNutritionistId = responsibleNutritionistId;
    this.bumpVersion(now);
    this.addDomainEvent(
      new MealPlanResponsibleNutritionistChanged(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.responsibleNutritionistId,
        this.version,
        now,
      ),
    );

    return true;
  }

  getId(): MealPlanId {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getPatientId(): string {
    return this.patientId;
  }

  getCreatedByNutritionistId(): string {
    return this.createdByNutritionistId;
  }

  getResponsibleNutritionistId(): string {
    return this.responsibleNutritionistId;
  }

  getOriginClinicalEncounterId(): string | null {
    return this.originClinicalEncounterId;
  }

  getOriginAnamnesisId(): string | null {
    return this.originAnamnesisId;
  }

  getPlanType(): MealPlanType | null {
    return this.planType;
  }

  getStatus(): MealPlanStatus {
    return this.status;
  }

  getVersion(): number {
    return this.version;
  }

  getTitle(): MealPlanTitle {
    return this.title;
  }

  getTherapeuticStrategy(): TherapeuticStrategy {
    return this.therapeuticStrategy;
  }

  getGeneralGuidelines(): GeneralGuidelines {
    return this.generalGuidelines;
  }

  getClinicalNotes(): MealPlanClinicalNotes {
    return this.clinicalNotes;
  }

  getValidFrom(): Date | null {
    return this.validFrom ? new Date(this.validFrom) : null;
  }

  getValidUntil(): Date | null {
    return this.validUntil ? new Date(this.validUntil) : null;
  }

  getCancellationReason(): MealPlanCancellationReason | null {
    return this.cancellationReason;
  }

  getActivatedAt(): Date | null {
    return this.activatedAt ? new Date(this.activatedAt) : null;
  }

  getCancelledAt(): Date | null {
    return this.cancelledAt ? new Date(this.cancelledAt) : null;
  }

  getMeals(): readonly MealPlanMeal[] {
    return this.meals;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  getEffectiveAt(): Date {
    return this.activatedAt ?? this.createdAt;
  }

  private bumpVersion(now: Date): void {
    this.version += 1;
    this.updatedAt = now;
  }
}

function ensureMutable(status: MealPlanStatus): void {
  if (isTerminalMealPlanStatus(status)) {
    throw new MealPlanTerminalDomainError(status);
  }
}

function validateMeals(meals: MealPlanMeal[]): void {
  if (meals.length > MEAL_PLAN_MAX_MEALS) {
    throw new MealPlanMaxMealsExceededDomainError();
  }
}

function mealsEqual(left: MealPlanMeal[], right: MealPlanMeal[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (!left[index]?.equals(right[index]!)) {
      return false;
    }
  }

  return true;
}
