import { AggregateRoot } from './aggregate-root.js';
import { DomainError } from '../errors/domain-error.js';
import {
  AppointmentCancelled,
  AppointmentCompleted,
  AppointmentConfirmed,
  AppointmentMarkedNoShow,
  AppointmentNotesUpdated,
  AppointmentRescheduled,
  AppointmentScheduled,
} from '../events/appointment-events.js';
import { AppointmentDuration } from '../value-objects/appointment-duration.js';
import { AppointmentId } from '../value-objects/appointment-id.js';
import { AppointmentMode } from '../value-objects/appointment-mode.js';
import { AppointmentNotes } from '../value-objects/appointment-notes.js';
import { AppointmentStatus } from '../value-objects/appointment-status.js';

export interface CreateAppointmentProps {
  id?: AppointmentId;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  startsAt: Date;
  endsAt: Date;
  mode: AppointmentMode;
  notes?: AppointmentNotes | null;
  now: Date;
}

export interface ReconstituteAppointmentProps {
  id: AppointmentId;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  startsAt: Date;
  endsAt: Date;
  mode: AppointmentMode;
  status: AppointmentStatus;
  notes: AppointmentNotes;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
  completedAt: Date | null;
}

export class Appointment extends AggregateRoot {
  private constructor(
    private readonly id: AppointmentId,
    private readonly tenantId: string,
    private readonly patientId: string,
    private readonly nutritionistId: string,
    private startsAt: Date,
    private endsAt: Date,
    private readonly mode: AppointmentMode,
    private status: AppointmentStatus,
    private notes: AppointmentNotes,
    private cancellationReason: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private cancelledAt: Date | null,
    private completedAt: Date | null,
  ) {
    super();
  }

  static create(props: CreateAppointmentProps): Appointment {
    validateFutureStart(props.startsAt, props.now);
    AppointmentDuration.validate(props.startsAt, props.endsAt);

    const id = props.id ?? AppointmentId.generate();
    const notes = props.notes ?? AppointmentNotes.create(null);
    const now = props.now;

    const appointment = new Appointment(
      id,
      props.tenantId,
      props.patientId,
      props.nutritionistId,
      new Date(props.startsAt),
      new Date(props.endsAt),
      props.mode,
      AppointmentStatus.Scheduled,
      notes,
      null,
      now,
      now,
      null,
      null,
    );

    appointment.addDomainEvent(
      new AppointmentScheduled(
        id.toString(),
        props.tenantId,
        props.patientId,
        props.nutritionistId,
        appointment.startsAt,
        appointment.endsAt,
        props.mode.toString(),
        now,
      ),
    );

    return appointment;
  }

  static reconstitute(props: ReconstituteAppointmentProps): Appointment {
    return new Appointment(
      props.id,
      props.tenantId,
      props.patientId,
      props.nutritionistId,
      new Date(props.startsAt),
      new Date(props.endsAt),
      props.mode,
      props.status,
      props.notes,
      props.cancellationReason,
      props.createdAt,
      props.updatedAt,
      props.cancelledAt ? new Date(props.cancelledAt) : null,
      props.completedAt ? new Date(props.completedAt) : null,
    );
  }

  confirm(now: Date): void {
    if (this.status === AppointmentStatus.Confirmed) {
      return;
    }

    ensureActiveLifecycle(this.status, 'confirm');

    this.status = AppointmentStatus.Confirmed;
    this.updatedAt = now;
    this.addDomainEvent(
      new AppointmentConfirmed(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        now,
      ),
    );
  }

  cancel(reason: string, now: Date): void {
    const normalizedReason = reason?.trim();

    if (!normalizedReason) {
      throw new DomainError('Cancellation reason is required.');
    }

    if (this.status === AppointmentStatus.Cancelled) {
      return;
    }

    ensureCancellable(this.status);

    this.status = AppointmentStatus.Cancelled;
    this.cancellationReason = normalizedReason;
    this.cancelledAt = now;
    this.updatedAt = now;
    this.addDomainEvent(
      new AppointmentCancelled(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        normalizedReason,
        now,
      ),
    );
  }

  complete(now: Date): void {
    if (this.status === AppointmentStatus.Completed) {
      return;
    }

    ensureCompletable(this.status);

    this.status = AppointmentStatus.Completed;
    this.completedAt = now;
    this.updatedAt = now;
    this.addDomainEvent(
      new AppointmentCompleted(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        now,
      ),
    );
  }

  markNoShow(now: Date): void {
    if (this.status === AppointmentStatus.NoShow) {
      return;
    }

    ensureNoShowable(this.status);

    this.status = AppointmentStatus.NoShow;
    this.updatedAt = now;
    this.addDomainEvent(
      new AppointmentMarkedNoShow(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        now,
      ),
    );
  }

  reschedule(newStartsAt: Date, newEndsAt: Date, now: Date): void {
    ensureReschedulable(this.status);
    validateFutureStart(newStartsAt, now);
    AppointmentDuration.validate(newStartsAt, newEndsAt);

    this.startsAt = new Date(newStartsAt);
    this.endsAt = new Date(newEndsAt);
    this.updatedAt = now;
    this.addDomainEvent(
      new AppointmentRescheduled(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        this.startsAt,
        this.endsAt,
        this.mode.toString(),
        now,
      ),
    );
  }

  updateNotes(notes: AppointmentNotes, now: Date): void {
    if (this.status === AppointmentStatus.Completed) {
      throw new DomainError('Completed appointments cannot update notes.');
    }

    if (this.notes.equals(notes)) {
      return;
    }

    this.notes = notes;
    this.updatedAt = now;
    this.addDomainEvent(
      new AppointmentNotesUpdated(
        this.id.toString(),
        this.tenantId,
        this.patientId,
        this.nutritionistId,
        now,
      ),
    );
  }

  getId(): AppointmentId {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getPatientId(): string {
    return this.patientId;
  }

  getNutritionistId(): string {
    return this.nutritionistId;
  }

  getStartsAt(): Date {
    return new Date(this.startsAt);
  }

  getEndsAt(): Date {
    return new Date(this.endsAt);
  }

  getMode(): AppointmentMode {
    return this.mode;
  }

  getStatus(): AppointmentStatus {
    return this.status;
  }

  getNotes(): AppointmentNotes {
    return this.notes;
  }

  getCancellationReason(): string | null {
    return this.cancellationReason;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  getCancelledAt(): Date | null {
    return this.cancelledAt ? new Date(this.cancelledAt) : null;
  }

  getCompletedAt(): Date | null {
    return this.completedAt ? new Date(this.completedAt) : null;
  }
}

function validateFutureStart(startsAt: Date, now: Date): void {
  if (startsAt.getTime() <= now.getTime()) {
    throw new DomainError('Appointment start must be in the future.');
  }
}

function ensureActiveLifecycle(status: AppointmentStatus, action: string): void {
  if (
    status === AppointmentStatus.Cancelled ||
    status === AppointmentStatus.Completed ||
    status === AppointmentStatus.NoShow
  ) {
    throw new DomainError(`Cannot ${action} appointment in status ${status}.`);
  }
}

function ensureCancellable(status: AppointmentStatus): void {
  if (
    status === AppointmentStatus.Completed ||
    status === AppointmentStatus.NoShow
  ) {
    throw new DomainError(`Cannot cancel appointment in status ${status}.`);
  }

  ensureActiveLifecycle(status, 'cancel');
}

function ensureCompletable(status: AppointmentStatus): void {
  if (
    status === AppointmentStatus.Cancelled ||
    status === AppointmentStatus.NoShow
  ) {
    throw new DomainError(`Cannot complete appointment in status ${status}.`);
  }

  ensureActiveLifecycle(status, 'complete');
}

function ensureNoShowable(status: AppointmentStatus): void {
  if (
    status === AppointmentStatus.Cancelled ||
    status === AppointmentStatus.Completed
  ) {
    throw new DomainError(`Cannot mark no-show for appointment in status ${status}.`);
  }

  ensureActiveLifecycle(status, 'mark as no-show');
}

function ensureReschedulable(status: AppointmentStatus): void {
  if (
    status !== AppointmentStatus.Scheduled &&
    status !== AppointmentStatus.Confirmed
  ) {
    throw new DomainError(`Cannot reschedule appointment in status ${status}.`);
  }
}
