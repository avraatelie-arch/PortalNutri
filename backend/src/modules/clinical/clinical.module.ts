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
import { DefaultAnamnesisCompletionPolicy } from './domain/policies/anamnesis-completion-policy.js';
import { PrismaClinicalEncounterRepository } from './infrastructure/repositories/prisma-clinical-encounter.repository.js';
import { PrismaAnamnesisRepository } from './infrastructure/repositories/prisma-anamnesis.repository.js';
import { PrismaTenantDirectoryAdapter } from './infrastructure/adapters/prisma-tenant-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from './infrastructure/adapters/prisma-patient-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter } from './infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaAppointmentDirectoryAdapter } from './infrastructure/adapters/prisma-appointment-directory.adapter.js';
import { PrismaClinicalEncounterDirectoryAdapter } from './infrastructure/adapters/prisma-clinical-encounter-directory.adapter.js';

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
      anamnesisRepository: new PrismaAnamnesisRepository(prisma),
      tenantDirectory: new PrismaTenantDirectoryAdapter(prisma),
      patientDirectory: new PrismaPatientDirectoryAdapter(prisma),
      nutritionistDirectory: new PrismaNutritionistDirectoryAdapter(prisma),
      appointmentDirectory: new PrismaAppointmentDirectoryAdapter(prisma),
      clinicalEncounterDirectory: new PrismaClinicalEncounterDirectoryAdapter(
        prisma,
      ),
      anamnesisCompletionPolicy: new DefaultAnamnesisCompletionPolicy(),
      clock: new SystemClock(),
      eventDispatcher,
    }),
  };
}

export async function registerClinicalModule(
  _app: FastifyInstance,
): Promise<void> {}
