import { AggregateRoot } from './aggregate-root.js';
import { DomainError } from '../errors/domain-error.js';
import {
  ClinicalEncounterCancelled,
  ClinicalEncounterFinished,
  ClinicalEncounterNotesUpdated,
  ClinicalEncounterStarted,
} from '../events/clinical-encounter-events.js';
import { ClinicalEncounterId } from '../value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../value-objects/clinical-encounter-status.js';
import { ClinicalEncounterType } from '../value-objects/clinical-encounter-type.js';
import { ClinicalNotes } from '../value-objects/clinical-notes.js';

export interface CreateClinicalEncounterProps {
  id?: ClinicalEncounterId;
  tenantId: string;
  appointmentId?: string | null;
  patientId: string;
  nutritionistId: string;
  type: ClinicalEncounterType;
  notes?: ClinicalNotes | null;
  startedAt: Date;
  now: Date;
}

export interface ReconstituteClinicalEncounterProps {
  id: ClinicalEncounterId;
  tenantId: string;
  appointmentId: string | null;
  patientId: string;
  nutritionistId: string;
  type: ClinicalEncounterType;
  status: ClinicalEncounterStatus;
  notes: ClinicalNotes;
  startedAt: Date;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ClinicalEncounter extends AggregateRoot {
  private constructor(
    private readonly id: ClinicalEncounterId,
    private readonly tenantId: string,
    private readonly appointmentId: string | null,
    private readonly patientId: string,
    private readonly nutritionistId: string,
    private readonly type: ClinicalEncounterType,
    private status: ClinicalEncounterStatus,
    private notes: ClinicalNotes,
    private readonly startedAt: Date,
    private finishedAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateClinicalEncounterProps): ClinicalEncounter {
    const id = props.id ?? ClinicalEncounterId.generate();
    const notes = props.notes ?? ClinicalNotes.create(null);
    const appointmentId = props.appointmentId ?? null;

    const encounter = new ClinicalEncounter(
      id,
      props.tenantId,
      appointmentId,
      props.patientId,
      props.nutritionistId,
      props.type,
      ClinicalEncounterStatus.Open,
      notes,
      new Date(props.startedAt),
      null,
      props.now,
      props.now,
    );

    encounter.addDomainEvent(
      new ClinicalEncounterStarted(
        id.toString(),
        props.tenantId,
        props.patientId,
        props.nutritionistId,
        appointmentId,
        ClinicalEncounterStatus.Open,
        props.now,
      ),
    );

    return encounter;
  }

  static reconstitute(
    props: ReconstituteClinicalEncounterProps,
  ): ClinicalEncounter {
    return new ClinicalEncounter(
      props.id,
      props.tenantId,
      props.appointmentId,
      props.patientId,
      props.nutritionistId,
      props.type,
      props.status,
      props.notes,
      new Date(props.startedAt),
      props.finishedAt ? new Date(props.finishedAt) : null,
      props.createdAt,
      props.updatedAt,
    );
  }

  finish(now: Date): void {
    if (this.status === ClinicalEncounterStatus.Finished) {
      return;
    }

    if (this.status === ClinicalEncounterStatus.Cancelled) {
      throw new DomainError('Cannot finish a cancelled clinical encounter.');
    }

    ensureOpen(this.status, 'finish');

    this.status = ClinicalEncounterStatus.Finished;
    this.finishedAt = now;
    this.updatedAt = now;
    this.addDomainEvent(
      new ClinicalEncounterFinished(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        this.appointmentId,
        ClinicalEncounterStatus.Finished,
        now,
      ),
    );
  }

  cancel(now: Date): void {
    if (this.status === ClinicalEncounterStatus.Cancelled) {
      return;
    }

    if (this.status === ClinicalEncounterStatus.Finished) {
      throw new DomainError('Cannot cancel a finished clinical encounter.');
    }

    ensureOpen(this.status, 'cancel');

    this.status = ClinicalEncounterStatus.Cancelled;
    this.updatedAt = now;
    this.addDomainEvent(
      new ClinicalEncounterCancelled(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        this.appointmentId,
        ClinicalEncounterStatus.Cancelled,
        now,
      ),
    );
  }

  updateNotes(notes: ClinicalNotes, now: Date): void {
    ensureOpen(this.status, 'update notes');

    if (this.notes.equals(notes)) {
      return;
    }

    this.notes = notes;
    this.updatedAt = now;
    this.addDomainEvent(
      new ClinicalEncounterNotesUpdated(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        this.appointmentId,
        this.status,
        now,
      ),
    );
  }

  getId(): ClinicalEncounterId {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getAppointmentId(): string | null {
    return this.appointmentId;
  }

  getPatientId(): string {
    return this.patientId;
  }

  getNutritionistId(): string {
    return this.nutritionistId;
  }

  getType(): ClinicalEncounterType {
    return this.type;
  }

  getStatus(): ClinicalEncounterStatus {
    return this.status;
  }

  getNotes(): ClinicalNotes {
    return this.notes;
  }

  getStartedAt(): Date {
    return new Date(this.startedAt);
  }

  getFinishedAt(): Date | null {
    return this.finishedAt ? new Date(this.finishedAt) : null;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }
}

function ensureOpen(status: ClinicalEncounterStatus, action: string): void {
  if (status !== ClinicalEncounterStatus.Open) {
    throw new DomainError(`Cannot ${action} clinical encounter in status ${status}.`);
  }
}
