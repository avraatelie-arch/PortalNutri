import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import type { EventDispatcher } from '../../core/application/events/event-dispatcher.js';
import { getPlatformEventRuntime } from '../../core/composition/platform-event-runtime.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import { PrismaTenantRepository } from '../iam/infrastructure/repositories/prisma-tenant.repository.js';
import {
  createPatientHandlers,
  type PatientHandlers,
} from './composition/patient.factory.js';
import {
  createPatientNutritionistAssignmentHandlers,
  type PatientNutritionistAssignmentHandlers,
} from './composition/patient-nutritionist-assignment.factory.js';
import { PrismaNutritionistDirectoryAdapter } from './infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientRepository } from './infrastructure/repositories/prisma-patient.repository.js';
import { PrismaPatientNutritionistAssignmentRepository } from './infrastructure/repositories/prisma-patient-nutritionist-assignment.repository.js';

export interface PatientDependencies {
  patientHandlers: PatientHandlers;
  patientNutritionistAssignmentHandlers: PatientNutritionistAssignmentHandlers;
}

export function createPatientDependencies(
  _env: Env,
  eventDispatcher: EventDispatcher = getPlatformEventRuntime().eventDispatcher,
): PatientDependencies {
  const prisma = getPrismaClient();
  const patientRepository = new PrismaPatientRepository(prisma);
  const tenantRepository = new PrismaTenantRepository(prisma);
  const assignmentRepository = new PrismaPatientNutritionistAssignmentRepository(
    prisma,
  );
  const nutritionistDirectory = new PrismaNutritionistDirectoryAdapter(prisma);

  return {
    patientHandlers: createPatientHandlers({
      patientRepository,
      tenantRepository,
      eventDispatcher,
    }),
    patientNutritionistAssignmentHandlers:
      createPatientNutritionistAssignmentHandlers({
        assignmentRepository,
        patientRepository,
        nutritionistDirectory,
        tenantRepository,
        eventDispatcher,
      }),
  };
}

export async function registerPatientModule(
  _app: FastifyInstance,
): Promise<void> {}
