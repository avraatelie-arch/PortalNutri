import type { PrismaClient } from '@prisma/client';
import {
  AppointmentStatus as PrismaStatus,
} from '@prisma/client';
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository.js';
import type { Appointment } from '../../domain/aggregates/appointment.aggregate.js';
import type { AppointmentId } from '../../domain/value-objects/appointment-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-appointment.mapper.js';

const CONFLICT_STATUSES: PrismaStatus[] = [
  PrismaStatus.SCHEDULED,
  PrismaStatus.CONFIRMED,
];

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(appointment: Appointment): Promise<void> {
    const data = toPersistence(appointment);

    await this.prisma.appointment.upsert({
      where: { id: data.id },
      create: data,
      update: {
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        status: data.status,
        notes: data.notes,
        cancellationReason: data.cancellationReason,
        updatedAt: data.updatedAt,
        cancelledAt: data.cancelledAt,
        completedAt: data.completedAt,
      },
    });
  }

  async findById(id: AppointmentId): Promise<Appointment | null> {
    const record = await this.prisma.appointment.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByTenantAndId(
    tenantId: string,
    id: AppointmentId,
  ): Promise<Appointment | null> {
    const record = await this.prisma.appointment.findFirst({
      where: {
        id: id.toString(),
        tenantId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findOverlappingForNutritionist(params: {
    tenantId: string;
    nutritionistId: string;
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: string;
  }): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: this.buildOverlapWhere(params.tenantId, {
        nutritionistId: params.nutritionistId,
        startsAt: params.startsAt,
        endsAt: params.endsAt,
        excludeAppointmentId: params.excludeAppointmentId,
      }),
    });

    return records.map(toDomain);
  }

  async findOverlappingForPatient(params: {
    tenantId: string;
    patientId: string;
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: string;
  }): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: this.buildOverlapWhere(params.tenantId, {
        patientId: params.patientId,
        startsAt: params.startsAt,
        endsAt: params.endsAt,
        excludeAppointmentId: params.excludeAppointmentId,
      }),
    });

    return records.map(toDomain);
  }

  async findByNutritionistAndPeriod(params: {
    tenantId: string;
    nutritionistId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: {
        tenantId: params.tenantId,
        nutritionistId: params.nutritionistId,
        startsAt: { lt: params.periodEnd },
        endsAt: { gt: params.periodStart },
      },
      orderBy: { startsAt: 'asc' },
    });

    return records.map(toDomain);
  }

  async findByPatientAndPeriod(params: {
    tenantId: string;
    patientId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: {
        tenantId: params.tenantId,
        patientId: params.patientId,
        startsAt: { lt: params.periodEnd },
        endsAt: { gt: params.periodStart },
      },
      orderBy: { startsAt: 'asc' },
    });

    return records.map(toDomain);
  }

  private buildOverlapWhere(
    tenantId: string,
    params: {
      patientId?: string;
      nutritionistId?: string;
      startsAt: Date;
      endsAt: Date;
      excludeAppointmentId?: string;
    },
  ) {
    return {
      tenantId,
      ...(params.patientId ? { patientId: params.patientId } : {}),
      ...(params.nutritionistId
        ? { nutritionistId: params.nutritionistId }
        : {}),
      status: { in: CONFLICT_STATUSES },
      startsAt: { lt: params.endsAt },
      endsAt: { gt: params.startsAt },
      ...(params.excludeAppointmentId
        ? { id: { not: params.excludeAppointmentId } }
        : {}),
    };
  }
}
