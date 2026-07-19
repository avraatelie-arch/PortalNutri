import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import type { EventDispatcher } from '../../core/application/events/event-dispatcher.js';
import { getPlatformEventRuntime } from '../../core/composition/platform-event-runtime.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import {
  createAppointmentHandlers,
  type AppointmentHandlers,
} from './composition/appointment.factory.js';
import { SystemClock } from './infrastructure/clock/system-clock.js';
import { PrismaAppointmentRepository } from './infrastructure/repositories/prisma-appointment.repository.js';
import { PrismaTenantDirectoryAdapter } from './infrastructure/adapters/prisma-tenant-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from './infrastructure/adapters/prisma-patient-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter } from './infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientNutritionistAssignmentDirectoryAdapter } from './infrastructure/adapters/prisma-patient-nutritionist-assignment-directory.adapter.js';

export interface AppointmentDependencies {
  appointmentHandlers: AppointmentHandlers;
}

export function createAppointmentDependencies(
  _env: Env,
  eventDispatcher: EventDispatcher = getPlatformEventRuntime().eventDispatcher,
): AppointmentDependencies {
  const prisma = getPrismaClient();

  return {
    appointmentHandlers: createAppointmentHandlers({
      appointmentRepository: new PrismaAppointmentRepository(prisma),
      tenantDirectory: new PrismaTenantDirectoryAdapter(prisma),
      patientDirectory: new PrismaPatientDirectoryAdapter(prisma),
      nutritionistDirectory: new PrismaNutritionistDirectoryAdapter(prisma),
      assignmentDirectory:
        new PrismaPatientNutritionistAssignmentDirectoryAdapter(prisma),
      clock: new SystemClock(),
      eventDispatcher,
    }),
  };
}

export async function registerAppointmentModule(
  _app: FastifyInstance,
): Promise<void> {}
