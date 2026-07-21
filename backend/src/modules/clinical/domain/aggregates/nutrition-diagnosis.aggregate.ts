import { AggregateRoot } from './aggregate-root.js';
import { NutritionDiagnosisCancellationReasonRequiredDomainError } from '../errors/nutrition-diagnosis-cancellation-reason-required.domain-error.js';
import { NutritionDiagnosisInvalidTransitionDomainError } from '../errors/nutrition-diagnosis-invalid-transition.domain-error.js';
import { NutritionDiagnosisInterpretationRequiredDomainError } from '../errors/nutrition-diagnosis-interpretation-required.domain-error.js';
import { NutritionDiagnosisTerminalDomainError } from '../errors/nutrition-diagnosis-terminal.domain-error.js';
import {
  NutritionDiagnosisCancelled,
  NutritionDiagnosisConfirmed,
  NutritionDiagnosisCreated,
  NutritionDiagnosisResponsibleNutritionistChanged,
  NutritionDiagnosisUpdated,
} from '../events/nutrition-diagnosis-events.js';
import type { CancellationReason } from '../value-objects/cancellation-reason.js';
import { NutritionDiagnosisId } from '../value-objects/nutrition-diagnosis-id.js';
import {
  NutritionDiagnosisStatusValue,
  isTerminalNutritionDiagnosisStatus,
  type NutritionDiagnosisStatus,
} from '../value-objects/nutrition-diagnosis-status.js';
import {
  NutritionProblemCategory,
  NutritionProblemCategoryValue,
} from '../value-objects/nutrition-problem-category.js';
import { ProfessionalInterpretation } from '../value-objects/professional-interpretation.js';

export type NutritionDiagnosisChangedField =
  | 'problemCategory'
  | 'professionalInterpretation';

export interface CreateNutritionDiagnosisProps {
  id?: NutritionDiagnosisId;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  problemCategory?: NutritionProblemCategory;
  professionalInterpretation?: ProfessionalInterpretation;
  now: Date;
}

export interface ReconstituteNutritionDiagnosisProps {
  id: NutritionDiagnosisId;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  problemCategory: NutritionProblemCategory;
  status: NutritionDiagnosisStatus;
  version: number;
  professionalInterpretation: ProfessionalInterpretation;
  cancellationReason: CancellationReason | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditNutritionDiagnosisProps {
  problemCategory?: NutritionProblemCategory;
  professionalInterpretation?: ProfessionalInterpretation;
}

export interface CancelNutritionDiagnosisProps {
  cancellationReason?: CancellationReason;
}

export class NutritionDiagnosis extends AggregateRoot {
  private constructor(
    private readonly id: NutritionDiagnosisId,
    private readonly tenantId: string,
    private readonly patientId: string,
    private readonly createdByNutritionistId: string,
    private responsibleNutritionistId: string,
    private readonly originClinicalEncounterId: string | null,
    private readonly originAnamnesisId: string | null,
    private problemCategory: NutritionProblemCategory,
    private status: NutritionDiagnosisStatus,
    private version: number,
    private professionalInterpretation: ProfessionalInterpretation,
    private cancellationReason: CancellationReason | null,
    private confirmedAt: Date | null,
    private cancelledAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateNutritionDiagnosisProps): NutritionDiagnosis {
    const id = props.id ?? NutritionDiagnosisId.generate();
    const originClinicalEncounterId = props.originClinicalEncounterId ?? null;
    const originAnamnesisId = props.originAnamnesisId ?? null;
    const problemCategory =
      props.problemCategory ?? NutritionProblemCategory.parse(NutritionProblemCategoryValue.Other);
    const professionalInterpretation =
      props.professionalInterpretation ?? ProfessionalInterpretation.empty();

    const diagnosis = new NutritionDiagnosis(
      id,
      props.tenantId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      originClinicalEncounterId,
      originAnamnesisId,
      problemCategory,
      NutritionDiagnosisStatusValue.Draft,
      1,
      professionalInterpretation,
      null,
      null,
      null,
      props.now,
      props.now,
    );

    diagnosis.addDomainEvent(
      new NutritionDiagnosisCreated(
        id.toString(),
        props.tenantId,
        props.patientId,
        props.createdByNutritionistId,
        props.responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        problemCategory.toString(),
        NutritionDiagnosisStatusValue.Draft,
        1,
        props.now,
      ),
    );

    return diagnosis;
  }

  static reconstitute(
    props: ReconstituteNutritionDiagnosisProps,
  ): NutritionDiagnosis {
    return new NutritionDiagnosis(
      props.id,
      props.tenantId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      props.originClinicalEncounterId,
      props.originAnamnesisId,
      props.problemCategory,
      props.status,
      props.version,
      props.professionalInterpretation,
      props.cancellationReason,
      props.confirmedAt ? new Date(props.confirmedAt) : null,
      props.cancelledAt ? new Date(props.cancelledAt) : null,
      props.createdAt,
      props.updatedAt,
    );
  }

  edit(props: EditNutritionDiagnosisProps, now: Date): NutritionDiagnosisChangedField[] {
    ensureMutable(this.status);

    if (this.status !== NutritionDiagnosisStatusValue.Draft) {
      throw new NutritionDiagnosisInvalidTransitionDomainError(this.status, 'edit');
    }

    const changedFields: NutritionDiagnosisChangedField[] = [];

    if (
      props.problemCategory !== undefined
      && this.problemCategory.toString() !== props.problemCategory.toString()
    ) {
      this.problemCategory = props.problemCategory;
      changedFields.push('problemCategory');
    }

    if (
      props.professionalInterpretation !== undefined
      && !this.professionalInterpretation.equals(props.professionalInterpretation)
    ) {
      this.professionalInterpretation = props.professionalInterpretation;
      changedFields.push('professionalInterpretation');
    }

    if (changedFields.length === 0) {
      return changedFields;
    }

    this.bumpVersion(now);
    this.addDomainEvent(
      new NutritionDiagnosisUpdated(
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

  confirm(now: Date): void {
    ensureMutable(this.status);

    if (this.status !== NutritionDiagnosisStatusValue.Draft) {
      throw new NutritionDiagnosisInvalidTransitionDomainError(this.status, 'confirm');
    }

    if (this.professionalInterpretation.isEmpty()) {
      throw new NutritionDiagnosisInterpretationRequiredDomainError();
    }

    this.status = NutritionDiagnosisStatusValue.Confirmed;
    this.confirmedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new NutritionDiagnosisConfirmed(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.responsibleNutritionistId,
        this.problemCategory.toString(),
        this.status,
        this.version,
        now,
        now,
      ),
    );
  }

  /**
   * Cancelling a CONFIRMED diagnosis is an exceptional administrative operation.
   * Clinical updates must create a new diagnosis instead of modifying a confirmed one.
   */
  cancel(props: CancelNutritionDiagnosisProps, now: Date): void {
    ensureMutable(this.status);

    if (
      this.status !== NutritionDiagnosisStatusValue.Draft
      && this.status !== NutritionDiagnosisStatusValue.Confirmed
    ) {
      throw new NutritionDiagnosisInvalidTransitionDomainError(this.status, 'cancel');
    }

    if (this.status === NutritionDiagnosisStatusValue.Confirmed) {
      if (!props.cancellationReason) {
        throw new NutritionDiagnosisCancellationReasonRequiredDomainError();
      }

      this.cancellationReason = props.cancellationReason;
    }

    this.status = NutritionDiagnosisStatusValue.Cancelled;
    this.cancelledAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new NutritionDiagnosisCancelled(
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
      new NutritionDiagnosisResponsibleNutritionistChanged(
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

  getId(): NutritionDiagnosisId {
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

  getProblemCategory(): NutritionProblemCategory {
    return this.problemCategory;
  }

  getStatus(): NutritionDiagnosisStatus {
    return this.status;
  }

  getVersion(): number {
    return this.version;
  }

  getProfessionalInterpretation(): ProfessionalInterpretation {
    return this.professionalInterpretation;
  }

  getCancellationReason(): CancellationReason | null {
    return this.cancellationReason;
  }

  getConfirmedAt(): Date | null {
    return this.confirmedAt ? new Date(this.confirmedAt) : null;
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

  getEffectiveAt(): Date {
    return this.confirmedAt ?? this.createdAt;
  }

  private bumpVersion(now: Date): void {
    this.version += 1;
    this.updatedAt = now;
  }
}

function ensureMutable(status: NutritionDiagnosisStatus): void {
  if (isTerminalNutritionDiagnosisStatus(status)) {
    throw new NutritionDiagnosisTerminalDomainError(status);
  }
}
