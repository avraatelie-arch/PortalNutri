import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import type { EventDispatcher } from '../../core/application/events/event-dispatcher.js';
import { getPlatformEventRuntime } from '../../core/composition/platform-event-runtime.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import {
  createClinicalHandlers,
  type ClinicalHandlers,
} from './composition/clinical.factory.js';
import { SystemClock } from './infrastructure/clock/system-clock.js';
import { PrismaClinicalEncounterRepository } from './infrastructure/repositories/prisma-clinical-encounter.repository.js';
import { PrismaTenantDirectoryAdapter } from './infrastructure/adapters/prisma-tenant-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from './infrastructure/adapters/prisma-patient-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter } from './infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaAppointmentDirectoryAdapter } from './infrastructure/adapters/prisma-appointment-directory.adapter.js';

export interface ClinicalDependencies {
  clinicalHandlers: ClinicalHandlers;
}

export function createClinicalDependencies(
  _env: Env,
  eventDispatcher: EventDispatcher = getPlatformEventRuntime().eventDispatcher,
): ClinicalDependencies {
  const prisma = getPrismaClient();

  return {
    clinicalHandlers: createClinicalHandlers({
      encounterRepository: new PrismaClinicalEncounterRepository(prisma),
      tenantDirectory: new PrismaTenantDirectoryAdapter(prisma),
      patientDirectory: new PrismaPatientDirectoryAdapter(prisma),
      nutritionistDirectory: new PrismaNutritionistDirectoryAdapter(prisma),
      appointmentDirectory: new PrismaAppointmentDirectoryAdapter(prisma),
      clock: new SystemClock(),
      eventDispatcher,
    }),
  };
}

export async function registerClinicalModule(
  _app: FastifyInstance,
): Promise<void> {}
