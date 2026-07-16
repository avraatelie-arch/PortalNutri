import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import type { EventDispatcher } from '../../core/application/events/event-dispatcher.js';
import { getPlatformEventRuntime } from '../../core/composition/platform-event-runtime.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import { PrismaMembershipRepository } from '../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../iam/infrastructure/repositories/prisma-tenant.repository.js';
import {
  createNutritionistHandlers,
  type NutritionistHandlers,
} from './composition/nutritionist.factory.js';
import { PrismaNutritionistRepository } from './infrastructure/repositories/prisma-nutritionist.repository.js';

export interface NutritionDependencies {
  nutritionistHandlers: NutritionistHandlers;
}

export function createNutritionDependencies(
  _env: Env,
  eventDispatcher: EventDispatcher = getPlatformEventRuntime().eventDispatcher,
): NutritionDependencies {
  const prisma = getPrismaClient();
  const nutritionistRepository = new PrismaNutritionistRepository(prisma);
  const personRepository = new PrismaPersonRepository(prisma);
  const tenantRepository = new PrismaTenantRepository(prisma);
  const membershipRepository = new PrismaMembershipRepository(prisma);

  return {
    nutritionistHandlers: createNutritionistHandlers({
      nutritionistRepository,
      personRepository,
      tenantRepository,
      membershipRepository,
      eventDispatcher,
    }),
  };
}

export async function registerNutritionModule(
  _app: FastifyInstance,
): Promise<void> {}
