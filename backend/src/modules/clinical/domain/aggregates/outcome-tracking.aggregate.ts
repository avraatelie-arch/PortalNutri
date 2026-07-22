import { AggregateRoot } from './aggregate-root.js';
import { OutcomeRecordingRequirementsNotMetDomainError } from '../errors/outcome-recording-requirements-not-met.domain-error.js';
import { OutcomeTrackingInvalidTransitionDomainError } from '../errors/outcome-tracking-invalid-transition.domain-error.js';
import { OutcomeTrackingNotDraftDomainError } from '../errors/outcome-tracking-not-draft.domain-error.js';
import { OutcomeTrackingTerminalDomainError } from '../errors/outcome-tracking-terminal.domain-error.js';
import {
  OutcomeTrackingCancelled,
  OutcomeTrackingRecorded,
  OutcomeTrackingResponsibleNutritionistChanged,
  OutcomeTrackingStarted,
  OutcomeTrackingUpdated,
} from '../events/outcome-tracking-events.js';
import type { OutcomeRecordingPolicy } from '../policies/outcome-recording-policy.js';
import type { AdherenceFactor } from '../value-objects/adherence-factor.js';
import type { OutcomeAssessment } from '../value-objects/outcome-assessment.js';
import {
  OutcomeClinicalNotes,
  ProfessionalRationale,
} from '../value-objects/outcome-assessment-text.js';
import { OutcomeTrackingId } from '../value-objects/outcome-tracking-id.js';
import {
  OutcomeTrackingStatusValue,
  isTerminalOutcomeTrackingStatus,
  type OutcomeTrackingStatus,
} from '../value-objects/outcome-tracking-status.js';

export type OutcomeTrackingChangedField =
  | 'outcomeAssessment'
  | 'adherenceFactor'
  | 'professionalRationale'
  | 'clinicalNotes'
  | 'evaluatedAt';

export interface CreateOutcomeTrackingProps {
  id?: OutcomeTrackingId;
  tenantId: string;
  patientId: string;
  clinicalObjectiveId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  clinicalMomentAt?: Date | null;
  now: Date;
}

export interface ReconstituteOutcomeTrackingProps {
  id: OutcomeTrackingId;
  tenantId: string;
  patientId: string;
  clinicalObjectiveId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  clinicalMomentAt: Date | null;
  status: OutcomeTrackingStatus;
  version: number;
  outcomeAssessment: OutcomeAssessment | null;
  adherenceFactor: AdherenceFactor | null;
  professionalRationale: ProfessionalRationale;
  clinicalNotes: OutcomeClinicalNotes;
  evaluatedAt: Date | null;
  recordedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditOutcomeTrackingProps {
  outcomeAssessment?: OutcomeAssessment | null;
  adherenceFactor?: AdherenceFactor | null;
  professionalRationale?: ProfessionalRationale;
  clinicalNotes?: OutcomeClinicalNotes;
  evaluatedAt?: Date | null;
}

/**
 * Patient-scoped aggregate anchored to a ClinicalObjective.
 * Records a single structured clinical conclusion about therapeutic progress.
 * Content is immutable after record(); no side effects on ClinicalObjective.
 */
export class OutcomeTracking extends AggregateRoot {
  private constructor(
    private readonly id: OutcomeTrackingId,
    private readonly tenantId: string,
    private readonly patientId: string,
    private readonly clinicalObjectiveId: string,
    private readonly createdByNutritionistId: string,
    private responsibleNutritionistId: string,
    private readonly originClinicalEncounterId: string | null,
    private readonly originAnamnesisId: string | null,
    private readonly clinicalMomentAt: Date | null,
    private status: OutcomeTrackingStatus,
    private version: number,
    private outcomeAssessment: OutcomeAssessment | null,
    private adherenceFactor: AdherenceFactor | null,
    private professionalRationale: ProfessionalRationale,
    private clinicalNotes: OutcomeClinicalNotes,
    private evaluatedAt: Date | null,
    private recordedAt: Date | null,
    private cancelledAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateOutcomeTrackingProps): OutcomeTracking {
    const id = props.id ?? OutcomeTrackingId.generate();
    const originClinicalEncounterId = props.originClinicalEncounterId ?? null;
    const originAnamnesisId = props.originAnamnesisId ?? null;
    const clinicalMomentAt = props.clinicalMomentAt
      ? new Date(props.clinicalMomentAt)
      : null;

    const tracking = new OutcomeTracking(
      id,
      props.tenantId,
      props.patientId,
      props.clinicalObjectiveId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      originClinicalEncounterId,
      originAnamnesisId,
      clinicalMomentAt,
      OutcomeTrackingStatusValue.Draft,
      1,
      null,
      null,
      ProfessionalRationale.empty(),
      OutcomeClinicalNotes.empty(),
      null,
      null,
      null,
      props.now,
      props.now,
    );

    tracking.addDomainEvent(
      new OutcomeTrackingStarted(
        id.toString(),
        props.tenantId,
        props.patientId,
        props.clinicalObjectiveId,
        props.createdByNutritionistId,
        props.responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        OutcomeTrackingStatusValue.Draft,
        clinicalMomentAt,
        1,
        props.now,
      ),
    );

    return tracking;
  }

  static reconstitute(props: ReconstituteOutcomeTrackingProps): OutcomeTracking {
    return new OutcomeTracking(
      props.id,
      props.tenantId,
      props.patientId,
      props.clinicalObjectiveId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      props.originClinicalEncounterId,
      props.originAnamnesisId,
      props.clinicalMomentAt ? new Date(props.clinicalMomentAt) : null,
      props.status,
      props.version,
      props.outcomeAssessment,
      props.adherenceFactor,
      props.professionalRationale,
      props.clinicalNotes,
      props.evaluatedAt ? new Date(props.evaluatedAt) : null,
      props.recordedAt ? new Date(props.recordedAt) : null,
      props.cancelledAt ? new Date(props.cancelledAt) : null,
      props.createdAt,
      props.updatedAt,
    );
  }

  edit(props: EditOutcomeTrackingProps, now: Date): boolean {
    ensureNotTerminal(this.status);
    ensureDraft(this.status);

    const changedFields: OutcomeTrackingChangedField[] = [];

    if (props.outcomeAssessment !== undefined) {
      const next = props.outcomeAssessment;
      const changed =
        (this.outcomeAssessment === null && next !== null)
        || (this.outcomeAssessment !== null && next === null)
        || (this.outcomeAssessment !== null
          && next !== null
          && !this.outcomeAssessment.equals(next));

      if (changed) {
        this.outcomeAssessment = next;
        changedFields.push('outcomeAssessment');
      }
    }

    if (props.adherenceFactor !== undefined) {
      const next = props.adherenceFactor;
      const changed =
        (this.adherenceFactor === null && next !== null)
        || (this.adherenceFactor !== null && next === null)
        || (this.adherenceFactor !== null
          && next !== null
          && !this.adherenceFactor.equals(next));

      if (changed) {
        this.adherenceFactor = next;
        changedFields.push('adherenceFactor');
      }
    }

    if (
      props.professionalRationale
      && !this.professionalRationale.equals(props.professionalRationale)
    ) {
      this.professionalRationale = props.professionalRationale;
      changedFields.push('professionalRationale');
    }

    if (props.clinicalNotes && !this.clinicalNotes.equals(props.clinicalNotes)) {
      this.clinicalNotes = props.clinicalNotes;
      changedFields.push('clinicalNotes');
    }

    if (props.evaluatedAt !== undefined) {
      const next = props.evaluatedAt ? new Date(props.evaluatedAt) : null;
      const currentTime = this.evaluatedAt?.getTime() ?? null;
      const nextTime = next?.getTime() ?? null;

      if (currentTime !== nextTime) {
        this.evaluatedAt = next;
        changedFields.push('evaluatedAt');
      }
    }

    if (changedFields.length === 0) {
      return false;
    }

    this.bumpVersion(now);
    this.addDomainEvent(
      new OutcomeTrackingUpdated(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.clinicalObjectiveId,
        this.responsibleNutritionistId,
        this.status,
        this.version,
        changedFields,
        now,
      ),
    );

    return true;
  }

  record(now: Date, policy: OutcomeRecordingPolicy): void {
    ensureNotTerminal(this.status);

    if (this.status !== OutcomeTrackingStatusValue.Draft) {
      throw new OutcomeTrackingInvalidTransitionDomainError(this.status, 'record');
    }

    try {
      policy.validate(this);
    } catch (error) {
      if (error instanceof OutcomeRecordingRequirementsNotMetDomainError) {
        throw error;
      }

      throw error;
    }

    const evaluatedAt = this.evaluatedAt ? new Date(this.evaluatedAt) : now;

    this.status = OutcomeTrackingStatusValue.Recorded;
    this.evaluatedAt = evaluatedAt;
    this.recordedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new OutcomeTrackingRecorded(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.clinicalObjectiveId,
        this.responsibleNutritionistId,
        this.status,
        this.outcomeAssessment!.toString(),
        this.adherenceFactor?.toString() ?? null,
        evaluatedAt,
        now,
        this.version,
        now,
      ),
    );
  }

  cancel(now: Date): void {
    ensureNotTerminal(this.status);

    if (this.status !== OutcomeTrackingStatusValue.Draft) {
      throw new OutcomeTrackingInvalidTransitionDomainError(this.status, 'cancel');
    }

    this.status = OutcomeTrackingStatusValue.Cancelled;
    this.cancelledAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new OutcomeTrackingCancelled(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.clinicalObjectiveId,
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
    ensureNotTerminal(this.status);

    if (this.responsibleNutritionistId === responsibleNutritionistId) {
      return false;
    }

    this.responsibleNutritionistId = responsibleNutritionistId;
    this.bumpVersion(now);
    this.addDomainEvent(
      new OutcomeTrackingResponsibleNutritionistChanged(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.clinicalObjectiveId,
        this.responsibleNutritionistId,
        this.status,
        this.version,
        now,
      ),
    );

    return true;
  }

  getId(): OutcomeTrackingId {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getPatientId(): string {
    return this.patientId;
  }

  getClinicalObjectiveId(): string {
    return this.clinicalObjectiveId;
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

  getClinicalMomentAt(): Date | null {
    return this.clinicalMomentAt ? new Date(this.clinicalMomentAt) : null;
  }

  getStatus(): OutcomeTrackingStatus {
    return this.status;
  }

  getVersion(): number {
    return this.version;
  }

  getOutcomeAssessment(): OutcomeAssessment | null {
    return this.outcomeAssessment;
  }

  getAdherenceFactor(): AdherenceFactor | null {
    return this.adherenceFactor;
  }

  getProfessionalRationale(): ProfessionalRationale {
    return this.professionalRationale;
  }

  getClinicalNotes(): OutcomeClinicalNotes {
    return this.clinicalNotes;
  }

  getEvaluatedAt(): Date | null {
    return this.evaluatedAt ? new Date(this.evaluatedAt) : null;
  }

  getRecordedAt(): Date | null {
    return this.recordedAt ? new Date(this.recordedAt) : null;
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

function ensureNotTerminal(status: OutcomeTrackingStatus): void {
  if (isTerminalOutcomeTrackingStatus(status)) {
    throw new OutcomeTrackingTerminalDomainError(status);
  }
}

function ensureDraft(status: OutcomeTrackingStatus): void {
  if (status !== OutcomeTrackingStatusValue.Draft) {
    throw new OutcomeTrackingNotDraftDomainError(status);
  }
}
