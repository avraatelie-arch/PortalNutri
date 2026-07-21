import { AggregateRoot } from './aggregate-root.js';
import { ClinicalObjectiveInvalidTransitionDomainError } from '../errors/clinical-objective-invalid-transition.domain-error.js';
import { ClinicalObjectiveTerminalDomainError } from '../errors/clinical-objective-terminal.domain-error.js';
import { ClinicalObjectiveTitleRequiredDomainError } from '../errors/clinical-objective-title-required.domain-error.js';
import { ClinicalObjectiveTargetDateInvalidDomainError } from '../errors/clinical-objective-target-date-invalid.domain-error.js';
import {
  ClinicalObjectiveActivated,
  ClinicalObjectiveCancelled,
  ClinicalObjectiveCompleted,
  ClinicalObjectiveCreated,
  ClinicalObjectivePaused,
  ClinicalObjectiveResponsibleNutritionistChanged,
  ClinicalObjectiveResumed,
  ClinicalObjectiveUpdated,
} from '../events/clinical-objective-events.js';
import { ClinicalObjectiveId } from '../value-objects/clinical-objective-id.js';
import {
  ClinicalObjectivePriority,
  ClinicalObjectivePriorityValue,
} from '../value-objects/clinical-objective-priority.js';
import {
  ClinicalObjectiveStatus,
  ClinicalObjectiveStatusValue,
  isTerminalClinicalObjectiveStatus,
} from '../value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../value-objects/success-criteria.js';

export type ClinicalObjectiveChangedField =
  | 'title'
  | 'clinicalRationale'
  | 'successCriteria'
  | 'priority'
  | 'targetDate';

export interface CreateClinicalObjectiveProps {
  id?: ClinicalObjectiveId;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  type: ClinicalObjectiveType;
  priority?: ClinicalObjectivePriority;
  title?: ClinicalObjectiveTitle;
  clinicalRationale?: ClinicalRationale;
  successCriteria?: SuccessCriteria;
  targetDate?: Date | null;
  now: Date;
}

export interface ReconstituteClinicalObjectiveProps {
  id: ClinicalObjectiveId;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  type: ClinicalObjectiveType;
  status: ClinicalObjectiveStatus;
  priority: ClinicalObjectivePriority;
  version: number;
  title: ClinicalObjectiveTitle;
  clinicalRationale: ClinicalRationale;
  successCriteria: SuccessCriteria;
  targetDate: Date | null;
  activatedAt: Date | null;
  pausedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditClinicalObjectiveProps {
  title?: ClinicalObjectiveTitle;
  clinicalRationale?: ClinicalRationale;
  successCriteria?: SuccessCriteria;
  priority?: ClinicalObjectivePriority;
  targetDate?: Date | null;
}

export class ClinicalObjective extends AggregateRoot {
  private constructor(
    private readonly id: ClinicalObjectiveId,
    private readonly tenantId: string,
    private readonly patientId: string,
    private readonly createdByNutritionistId: string,
    private responsibleNutritionistId: string,
    private readonly originClinicalEncounterId: string | null,
    private readonly originAnamnesisId: string | null,
    private readonly type: ClinicalObjectiveType,
    private status: ClinicalObjectiveStatus,
    private priority: ClinicalObjectivePriority,
    private version: number,
    private title: ClinicalObjectiveTitle,
    private clinicalRationale: ClinicalRationale,
    private successCriteria: SuccessCriteria,
    private targetDate: Date | null,
    private activatedAt: Date | null,
    private pausedAt: Date | null,
    private completedAt: Date | null,
    private cancelledAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateClinicalObjectiveProps): ClinicalObjective {
    const id = props.id ?? ClinicalObjectiveId.generate();
    const originClinicalEncounterId = props.originClinicalEncounterId ?? null;
    const originAnamnesisId = props.originAnamnesisId ?? null;
    const priority = props.priority ?? ClinicalObjectivePriorityValue.Medium;
    const title = props.title ?? ClinicalObjectiveTitle.create('');
    const clinicalRationale = props.clinicalRationale ?? ClinicalRationale.empty();
    const successCriteria = props.successCriteria ?? SuccessCriteria.empty();
    const targetDate = props.targetDate ? new Date(props.targetDate) : null;

    const objective = new ClinicalObjective(
      id,
      props.tenantId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      originClinicalEncounterId,
      originAnamnesisId,
      props.type,
      ClinicalObjectiveStatusValue.Draft,
      priority,
      1,
      title,
      clinicalRationale,
      successCriteria,
      targetDate,
      null,
      null,
      null,
      null,
      props.now,
      props.now,
    );

    objective.addDomainEvent(
      new ClinicalObjectiveCreated(
        id.toString(),
        props.tenantId,
        props.patientId,
        props.createdByNutritionistId,
        props.responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        props.type.toString(),
        ClinicalObjectiveStatusValue.Draft,
        priority,
        1,
        props.now,
      ),
    );

    return objective;
  }

  static reconstitute(
    props: ReconstituteClinicalObjectiveProps,
  ): ClinicalObjective {
    return new ClinicalObjective(
      props.id,
      props.tenantId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      props.originClinicalEncounterId,
      props.originAnamnesisId,
      props.type,
      props.status,
      props.priority,
      props.version,
      props.title,
      props.clinicalRationale,
      props.successCriteria,
      props.targetDate ? new Date(props.targetDate) : null,
      props.activatedAt ? new Date(props.activatedAt) : null,
      props.pausedAt ? new Date(props.pausedAt) : null,
      props.completedAt ? new Date(props.completedAt) : null,
      props.cancelledAt ? new Date(props.cancelledAt) : null,
      props.createdAt,
      props.updatedAt,
    );
  }

  activate(now: Date): void {
    ensureMutable(this.status);

    if (this.status !== ClinicalObjectiveStatusValue.Draft) {
      throw new ClinicalObjectiveInvalidTransitionDomainError(
        this.status,
        'activate',
      );
    }

    if (this.title.isEmpty()) {
      throw new ClinicalObjectiveTitleRequiredDomainError();
    }

    validateTargetDateAgainstActivation(this.targetDate, now);

    this.status = ClinicalObjectiveStatusValue.Active;
    this.activatedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalObjectiveActivated(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.responsibleNutritionistId,
        this.type.toString(),
        this.priority,
        this.status,
        this.version,
        now,
        now,
      ),
    );
  }

  pause(now: Date): void {
    ensureMutable(this.status);

    if (this.status !== ClinicalObjectiveStatusValue.Active) {
      throw new ClinicalObjectiveInvalidTransitionDomainError(this.status, 'pause');
    }

    this.status = ClinicalObjectiveStatusValue.Paused;
    this.pausedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalObjectivePaused(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.responsibleNutritionistId,
        this.status,
        this.version,
        now,
      ),
    );
  }

  resume(now: Date): void {
    ensureMutable(this.status);

    if (this.status !== ClinicalObjectiveStatusValue.Paused) {
      throw new ClinicalObjectiveInvalidTransitionDomainError(this.status, 'resume');
    }

    this.status = ClinicalObjectiveStatusValue.Active;
    this.pausedAt = null;
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalObjectiveResumed(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.responsibleNutritionistId,
        this.status,
        this.version,
        now,
      ),
    );
  }

  complete(now: Date): void {
    ensureMutable(this.status);

    if (this.status !== ClinicalObjectiveStatusValue.Active) {
      throw new ClinicalObjectiveInvalidTransitionDomainError(
        this.status,
        'complete',
      );
    }

    this.status = ClinicalObjectiveStatusValue.Completed;
    this.completedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalObjectiveCompleted(
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

  cancel(now: Date): void {
    ensureMutable(this.status);

    if (
      this.status !== ClinicalObjectiveStatusValue.Draft &&
      this.status !== ClinicalObjectiveStatusValue.Active &&
      this.status !== ClinicalObjectiveStatusValue.Paused
    ) {
      throw new ClinicalObjectiveInvalidTransitionDomainError(this.status, 'cancel');
    }

    this.status = ClinicalObjectiveStatusValue.Cancelled;
    this.cancelledAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalObjectiveCancelled(
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

  edit(props: EditClinicalObjectiveProps, now: Date): ClinicalObjectiveChangedField[] {
    ensureMutable(this.status);

    const changedFields: ClinicalObjectiveChangedField[] = [];

    if (props.title !== undefined && !this.title.equals(props.title)) {
      this.title = props.title;
      changedFields.push('title');
    }

    if (
      props.clinicalRationale !== undefined &&
      !this.clinicalRationale.equals(props.clinicalRationale)
    ) {
      this.clinicalRationale = props.clinicalRationale;
      changedFields.push('clinicalRationale');
    }

    if (
      props.successCriteria !== undefined &&
      !this.successCriteria.equals(props.successCriteria)
    ) {
      this.successCriteria = props.successCriteria;
      changedFields.push('successCriteria');
    }

    if (props.priority !== undefined && this.priority !== props.priority) {
      this.priority = props.priority;
      changedFields.push('priority');
    }

    if (props.targetDate !== undefined) {
      const nextTargetDate = props.targetDate ? new Date(props.targetDate) : null;

      if (!datesEqual(this.targetDate, nextTargetDate)) {
        if (nextTargetDate !== null && this.activatedAt !== null) {
          validateTargetDateAgainstActivation(nextTargetDate, this.activatedAt);
        }

        this.targetDate = nextTargetDate;
        changedFields.push('targetDate');
      }
    }

    if (changedFields.length === 0) {
      return changedFields;
    }

    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalObjectiveUpdated(
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
      new ClinicalObjectiveResponsibleNutritionistChanged(
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

  getId(): ClinicalObjectiveId {
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

  getType(): ClinicalObjectiveType {
    return this.type;
  }

  getStatus(): ClinicalObjectiveStatus {
    return this.status;
  }

  getPriority(): ClinicalObjectivePriority {
    return this.priority;
  }

  getVersion(): number {
    return this.version;
  }

  getTitle(): ClinicalObjectiveTitle {
    return this.title;
  }

  getClinicalRationale(): ClinicalRationale {
    return this.clinicalRationale;
  }

  getSuccessCriteria(): SuccessCriteria {
    return this.successCriteria;
  }

  getTargetDate(): Date | null {
    return this.targetDate ? new Date(this.targetDate) : null;
  }

  getActivatedAt(): Date | null {
    return this.activatedAt ? new Date(this.activatedAt) : null;
  }

  getPausedAt(): Date | null {
    return this.pausedAt ? new Date(this.pausedAt) : null;
  }

  getCompletedAt(): Date | null {
    return this.completedAt ? new Date(this.completedAt) : null;
  }

  getCancelledAt(): Date | null {
    return this.cancelledAt ? new Date(this.cancelledAt) : null;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  private bumpVersion(now: Date): void {
    this.version += 1;
    this.updatedAt = now;
  }
}

function ensureMutable(status: ClinicalObjectiveStatus): void {
  if (isTerminalClinicalObjectiveStatus(status)) {
    throw new ClinicalObjectiveTerminalDomainError(status);
  }
}

function validateTargetDateAgainstActivation(
  targetDate: Date | null,
  activatedAt: Date,
): void {
  if (targetDate === null) {
    return;
  }

  if (toUtcDateKey(targetDate) < toUtcDateKey(activatedAt)) {
    throw new ClinicalObjectiveTargetDateInvalidDomainError();
  }
}

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function datesEqual(first: Date | null, second: Date | null): boolean {
  if (first === null && second === null) {
    return true;
  }

  if (first === null || second === null) {
    return false;
  }

  return first.getTime() === second.getTime();
}
