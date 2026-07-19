import type { AppointmentRepository } from '../../domain/repositories/appointment-repository.js';
import type { Appointment } from '../../domain/aggregates/appointment.aggregate.js';
import type { AppointmentId } from '../../domain/value-objects/appointment-id.js';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.js';

export class InMemoryAppointmentRepository implements AppointmentRepository {
  private readonly appointments = new Map<string, Appointment>();

  async save(appointment: Appointment): Promise<void> {
    this.appointments.set(appointment.getId().toString(), appointment);
  }

  async findById(id: AppointmentId): Promise<Appointment | null> {
    return this.appointments.get(id.toString()) ?? null;
  }

  async findByTenantAndId(
    tenantId: string,
    id: AppointmentId,
  ): Promise<Appointment | null> {
    const appointment = this.appointments.get(id.toString());

    if (!appointment || appointment.getTenantId() !== tenantId) {
      return null;
    }

    return appointment;
  }

  async findOverlappingForNutritionist(params: {
    tenantId: string;
    nutritionistId: string;
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: string;
  }): Promise<Appointment[]> {
    return this.findOverlapping(
      (appointment) =>
        appointment.getTenantId() === params.tenantId &&
        appointment.getNutritionistId() === params.nutritionistId,
      params,
    );
  }

  async findOverlappingForPatient(params: {
    tenantId: string;
    patientId: string;
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: string;
  }): Promise<Appointment[]> {
    return this.findOverlapping(
      (appointment) =>
        appointment.getTenantId() === params.tenantId &&
        appointment.getPatientId() === params.patientId,
      params,
    );
  }

  async findByNutritionistAndPeriod(params: {
    tenantId: string;
    nutritionistId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<Appointment[]> {
    return [...this.appointments.values()].filter(
      (appointment) =>
        appointment.getTenantId() === params.tenantId &&
        appointment.getNutritionistId() === params.nutritionistId &&
        appointment.getStartsAt().getTime() < params.periodEnd.getTime() &&
        appointment.getEndsAt().getTime() > params.periodStart.getTime(),
    );
  }

  async findByPatientAndPeriod(params: {
    tenantId: string;
    patientId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<Appointment[]> {
    return [...this.appointments.values()].filter(
      (appointment) =>
        appointment.getTenantId() === params.tenantId &&
        appointment.getPatientId() === params.patientId &&
        appointment.getStartsAt().getTime() < params.periodEnd.getTime() &&
        appointment.getEndsAt().getTime() > params.periodStart.getTime(),
    );
  }

  private findOverlapping(
    matchesEntity: (appointment: Appointment) => boolean,
    params: {
      startsAt: Date;
      endsAt: Date;
      excludeAppointmentId?: string;
    },
  ): Appointment[] {
    return [...this.appointments.values()].filter((appointment) => {
      if (!matchesEntity(appointment)) {
        return false;
      }

      if (
        params.excludeAppointmentId &&
        appointment.getId().toString() === params.excludeAppointmentId
      ) {
        return false;
      }

      if (
        appointment.getStatus() !== AppointmentStatus.Scheduled &&
        appointment.getStatus() !== AppointmentStatus.Confirmed
      ) {
        return false;
      }

      return (
        appointment.getStartsAt().getTime() < params.endsAt.getTime() &&
        appointment.getEndsAt().getTime() > params.startsAt.getTime()
      );
    });
  }
}
