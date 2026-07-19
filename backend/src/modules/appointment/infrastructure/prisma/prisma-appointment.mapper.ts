import type { Appointment as AppointmentRecord } from '@prisma/client';
import {
  AppointmentMode as PrismaMode,
  AppointmentStatus as PrismaStatus,
} from '@prisma/client';
import { Appointment } from '../../domain/aggregates/appointment.aggregate.js';
import { AppointmentId } from '../../domain/value-objects/appointment-id.js';
import { AppointmentMode } from '../../domain/value-objects/appointment-mode.js';
import { AppointmentNotes } from '../../domain/value-objects/appointment-notes.js';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.js';

export type AppointmentPersistenceInput = {
  id: string;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  startsAt: Date;
  endsAt: Date;
  mode: PrismaMode;
  status: PrismaStatus;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
  completedAt: Date | null;
};

export function toPersistence(appointment: Appointment): AppointmentPersistenceInput {
  return {
    id: appointment.getId().toString(),
    tenantId: appointment.getTenantId(),
    patientId: appointment.getPatientId(),
    nutritionistId: appointment.getNutritionistId(),
    startsAt: appointment.getStartsAt(),
    endsAt: appointment.getEndsAt(),
    mode: toPrismaMode(appointment.getMode()),
    status: toPrismaStatus(appointment.getStatus()),
    notes: appointment.getNotes().toString(),
    cancellationReason: appointment.getCancellationReason(),
    createdAt: appointment.getCreatedAt(),
    updatedAt: appointment.getUpdatedAt(),
    cancelledAt: appointment.getCancelledAt(),
    completedAt: appointment.getCompletedAt(),
  };
}

export function toDomain(record: AppointmentRecord): Appointment {
  return Appointment.reconstitute({
    id: AppointmentId.create(record.id),
    tenantId: record.tenantId,
    patientId: record.patientId,
    nutritionistId: record.nutritionistId,
    startsAt: record.startsAt,
    endsAt: record.endsAt,
    mode: toDomainMode(record.mode),
    status: toDomainStatus(record.status),
    notes: AppointmentNotes.create(record.notes),
    cancellationReason: record.cancellationReason,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    cancelledAt: record.cancelledAt,
    completedAt: record.completedAt,
  });
}

function toPrismaMode(mode: AppointmentMode): PrismaMode {
  return mode.toString() as PrismaMode;
}

function toDomainMode(mode: PrismaMode): AppointmentMode {
  return AppointmentMode.create(mode);
}

function toPrismaStatus(status: AppointmentStatus): PrismaStatus {
  return status as PrismaStatus;
}

function toDomainStatus(status: PrismaStatus): AppointmentStatus {
  return status as AppointmentStatus;
}
