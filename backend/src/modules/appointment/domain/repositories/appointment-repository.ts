import type { Appointment } from '../aggregates/appointment.aggregate.js';
import type { AppointmentId } from '../value-objects/appointment-id.js';

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findById(id: AppointmentId): Promise<Appointment | null>;
  findByTenantAndId(
    tenantId: string,
    id: AppointmentId,
  ): Promise<Appointment | null>;
  findOverlappingForNutritionist(params: {
    tenantId: string;
    nutritionistId: string;
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: string;
  }): Promise<Appointment[]>;
  findOverlappingForPatient(params: {
    tenantId: string;
    patientId: string;
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: string;
  }): Promise<Appointment[]>;
  findByNutritionistAndPeriod(params: {
    tenantId: string;
    nutritionistId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<Appointment[]>;
  findByPatientAndPeriod(params: {
    tenantId: string;
    patientId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<Appointment[]>;
}
