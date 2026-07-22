import { AggregateRoot } from './aggregate-root.js';
import { PrescriptionLine } from '../entities/prescription-line.js';
import { PrescriptionCancellationReasonRequiredDomainError } from '../errors/prescription-cancellation-reason-required.domain-error.js';
import { PrescriptionDuplicateLineDescriptionDomainError } from '../errors/prescription-duplicate-line-description.domain-error.js';
import { PrescriptionEmitRequirementsNotMetDomainError } from '../errors/prescription-emit-requirements-not-met.domain-error.js';
import { PrescriptionInvalidTransitionDomainError } from '../errors/prescription-invalid-transition.domain-error.js';
import {
  PRESCRIPTION_MAX_LINES,
  PrescriptionMaxLinesExceededDomainError,
} from '../errors/prescription-max-lines-exceeded.domain-error.js';
import { PrescriptionTerminalDomainError } from '../errors/prescription-terminal.domain-error.js';
import {
  PrescriptionCancelled,
  PrescriptionCreated,
  PrescriptionIssued,
  PrescriptionResponsibleNutritionistChanged,
  PrescriptionUpdated,
} from '../events/prescription-events.js';
import type { PrescriptionCancellationReason } from '../value-objects/prescription-cancellation-reason.js';
import { PrescriptionClinicalNotes } from '../value-objects/prescription-text-sections.js';
import { PrescriptionId } from '../value-objects/prescription-id.js';
import {
  PrescriptionStatusValue,
  isTerminalPrescriptionStatus,
  type PrescriptionStatus,
} from '../value-objects/prescription-status.js';
import { PrescriptionTitle } from '../value-objects/prescription-title.js';
import { PatientInstructions } from '../value-objects/prescription-text-sections.js';

export type PrescriptionChangedField =
  | 'title'
  | 'clinicalNotes'
  | 'patientInstructions'
  | 'lines';

export interface CreatePrescriptionProps {
  id?: PrescriptionId;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  title?: PrescriptionTitle;
  clinicalNotes?: PrescriptionClinicalNotes;
  patientInstructions?: PatientInstructions;
  lines?: PrescriptionLine[];
  now: Date;
}

export interface ReconstitutePrescriptionProps {
  id: PrescriptionId;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  status: PrescriptionStatus;
  version: number;
  title: PrescriptionTitle;
  clinicalNotes: PrescriptionClinicalNotes;
  patientInstructions: PatientInstructions;
  cancellationReason: PrescriptionCancellationReason | null;
  issuedAt: Date | null;
  cancelledAt: Date | null;
  lines: PrescriptionLine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EditPrescriptionProps {
  title?: PrescriptionTitle;
  clinicalNotes?: PrescriptionClinicalNotes;
  patientInstructions?: PatientInstructions;
  lines?: PrescriptionLine[];
}

export interface CancelPrescriptionProps {
  cancellationReason?: PrescriptionCancellationReason;
}

/**
 * PrescriptionLine content becomes immutable after EmitPrescription.
 * ISSUED prescriptions must not be edited; clinical evolution requires a new Prescription.
 */
export class Prescription extends AggregateRoot {
  private constructor(
    private readonly id: PrescriptionId,
    private readonly tenantId: string,
    private readonly patientId: string,
    private readonly createdByNutritionistId: string,
    private responsibleNutritionistId: string,
    private readonly originClinicalEncounterId: string | null,
    private readonly originAnamnesisId: string | null,
    private status: PrescriptionStatus,
    private version: number,
    private title: PrescriptionTitle,
    private clinicalNotes: PrescriptionClinicalNotes,
    private patientInstructions: PatientInstructions,
    private cancellationReason: PrescriptionCancellationReason | null,
    private issuedAt: Date | null,
    private cancelledAt: Date | null,
    private lines: PrescriptionLine[],
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreatePrescriptionProps): Prescription {
    const id = props.id ?? PrescriptionId.generate();
    const originClinicalEncounterId = props.originClinicalEncounterId ?? null;
    const originAnamnesisId = props.originAnamnesisId ?? null;
    const title = props.title ?? PrescriptionTitle.create('');
    const clinicalNotes = props.clinicalNotes ?? PrescriptionClinicalNotes.empty();
    const patientInstructions = props.patientInstructions ?? PatientInstructions.empty();
    const lines = props.lines ?? [];

    validateLines(lines);

    const prescription = new Prescription(
      id,
      props.tenantId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      originClinicalEncounterId,
      originAnamnesisId,
      PrescriptionStatusValue.Draft,
      1,
      title,
      clinicalNotes,
      patientInstructions,
      null,
      null,
      null,
      lines,
      props.now,
      props.now,
    );

    prescription.addDomainEvent(
      new PrescriptionCreated(
        id.toString(),
        props.tenantId,
        props.patientId,
        props.createdByNutritionistId,
        props.responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        PrescriptionStatusValue.Draft,
        1,
        props.now,
      ),
    );

    return prescription;
  }

  static reconstitute(props: ReconstitutePrescriptionProps): Prescription {
    return new Prescription(
      props.id,
      props.tenantId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      props.originClinicalEncounterId,
      props.originAnamnesisId,
      props.status,
      props.version,
      props.title,
      props.clinicalNotes,
      props.patientInstructions,
      props.cancellationReason,
      props.issuedAt ? new Date(props.issuedAt) : null,
      props.cancelledAt ? new Date(props.cancelledAt) : null,
      props.lines,
      props.createdAt,
      props.updatedAt,
    );
  }

  /** DRAFT only — PrescriptionLine content is immutable after emit. */
  edit(props: EditPrescriptionProps, now: Date): PrescriptionChangedField[] {
    ensureMutable(this.status);

    if (this.status !== PrescriptionStatusValue.Draft) {
      throw new PrescriptionInvalidTransitionDomainError(this.status, 'edit');
    }

    const changedFields: PrescriptionChangedField[] = [];

    if (props.title !== undefined && !this.title.equals(props.title)) {
      this.title = props.title;
      changedFields.push('title');
    }

    if (
      props.clinicalNotes !== undefined
      && !this.clinicalNotes.equals(props.clinicalNotes)
    ) {
      this.clinicalNotes = props.clinicalNotes;
      changedFields.push('clinicalNotes');
    }

    if (
      props.patientInstructions !== undefined
      && !this.patientInstructions.equals(props.patientInstructions)
    ) {
      this.patientInstructions = props.patientInstructions;
      changedFields.push('patientInstructions');
    }

    if (props.lines !== undefined) {
      validateLines(props.lines);

      if (!linesEqual(this.lines, props.lines)) {
        this.lines = props.lines;
        changedFields.push('lines');
      }
    }

    if (changedFields.length === 0) {
      return changedFields;
    }

    this.bumpVersion(now);
    this.addDomainEvent(
      new PrescriptionUpdated(
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

  emit(now: Date): void {
    ensureMutable(this.status);

    if (this.status !== PrescriptionStatusValue.Draft) {
      throw new PrescriptionInvalidTransitionDomainError(this.status, 'emit');
    }

    if (this.title.isEmpty()) {
      throw new PrescriptionEmitRequirementsNotMetDomainError();
    }

    if (this.lines.length === 0) {
      throw new PrescriptionEmitRequirementsNotMetDomainError();
    }

    assertNoDuplicateLineDescriptions(this.lines);

    for (const line of this.lines) {
      if (
        line.getDescription().isEmpty()
        || !line.getDose().isCompleteForEmit()
        || !line.getFrequency().isCompleteForEmit()
      ) {
        throw new PrescriptionEmitRequirementsNotMetDomainError();
      }
    }

    this.status = PrescriptionStatusValue.Issued;
    this.issuedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new PrescriptionIssued(
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

  /**
   * Cancelling an ISSUED prescription is an exceptional administrative operation.
   * Clinical updates must create a new prescription instead of modifying an issued one.
   */
  cancel(props: CancelPrescriptionProps, now: Date): void {
    ensureMutable(this.status);

    if (
      this.status !== PrescriptionStatusValue.Draft
      && this.status !== PrescriptionStatusValue.Issued
    ) {
      throw new PrescriptionInvalidTransitionDomainError(this.status, 'cancel');
    }

    if (this.status === PrescriptionStatusValue.Issued) {
      if (!props.cancellationReason) {
        throw new PrescriptionCancellationReasonRequiredDomainError();
      }

      this.cancellationReason = props.cancellationReason;
    }

    this.status = PrescriptionStatusValue.Cancelled;
    this.cancelledAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new PrescriptionCancelled(
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
      new PrescriptionResponsibleNutritionistChanged(
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

  getId(): PrescriptionId {
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

  getStatus(): PrescriptionStatus {
    return this.status;
  }

  getVersion(): number {
    return this.version;
  }

  getTitle(): PrescriptionTitle {
    return this.title;
  }

  getClinicalNotes(): PrescriptionClinicalNotes {
    return this.clinicalNotes;
  }

  getPatientInstructions(): PatientInstructions {
    return this.patientInstructions;
  }

  getCancellationReason(): PrescriptionCancellationReason | null {
    return this.cancellationReason;
  }

  getIssuedAt(): Date | null {
    return this.issuedAt ? new Date(this.issuedAt) : null;
  }

  getCancelledAt(): Date | null {
    return this.cancelledAt ? new Date(this.cancelledAt) : null;
  }

  getLines(): readonly PrescriptionLine[] {
    return this.lines;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  getEffectiveAt(): Date {
    return this.issuedAt ?? this.createdAt;
  }

  private bumpVersion(now: Date): void {
    this.version += 1;
    this.updatedAt = now;
  }
}

function ensureMutable(status: PrescriptionStatus): void {
  if (isTerminalPrescriptionStatus(status)) {
    throw new PrescriptionTerminalDomainError(status);
  }
}

function validateLines(lines: PrescriptionLine[]): void {
  if (lines.length > PRESCRIPTION_MAX_LINES) {
    throw new PrescriptionMaxLinesExceededDomainError();
  }
}

function linesEqual(left: PrescriptionLine[], right: PrescriptionLine[]): boolean {
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

function assertNoDuplicateLineDescriptions(lines: PrescriptionLine[]): void {
  const seen = new Set<string>();

  for (const line of lines) {
    const key = line.getDescription().getNormalizedKey();

    if (key.length === 0) {
      continue;
    }

    if (seen.has(key)) {
      throw new PrescriptionDuplicateLineDescriptionDomainError();
    }

    seen.add(key);
  }
}
