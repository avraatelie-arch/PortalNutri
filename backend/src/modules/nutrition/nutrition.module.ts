import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import { EventDispatcher } from '../../core/application/events/event-dispatcher.js';
import { AuditEventHandler } from '../../core/infrastructure/audit/audit-event-handler.js';
import { DefaultAuditLogger } from '../../core/infrastructure/audit/default-audit-logger.js';
import { DefaultAuditPublisher } from '../../core/infrastructure/audit/default-audit-publisher.js';
import { InMemoryAuditSink } from '../../core/infrastructure/audit/in-memory-audit-sink.js';
import { EventHandlerRegistry } from '../../core/infrastructure/events/event-handler-registry.js';
import { InProcessEventBus } from '../../core/infrastructure/events/in-process-event-bus.js';
import { DefaultEventBusLogger } from '../../core/infrastructure/events/default-event-bus-logger.js';
import { PrismaMembershipRepository } from '../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../iam/infrastructure/repositories/prisma-tenant.repository.js';
import {
  createNutritionistHandlers,
  type NutritionistHandlers,
} from './composition/nutritionist.factory.js';
import { PrismaNutritionistRepository } from './infrastructure/repositories/prisma-nutritionist.repository.js';

export interface NutritionDependencies {
  eventDispatcher: EventDispatcher;
  nutritionistHandlers: NutritionistHandlers;
}

export function createNutritionDependencies(_env: Env): NutritionDependencies {
  const prisma = getPrismaClient();
  const nutritionistRepository = new PrismaNutritionistRepository(prisma);
  const personRepository = new PrismaPersonRepository(prisma);
  const tenantRepository = new PrismaTenantRepository(prisma);
  const membershipRepository = new PrismaMembershipRepository(prisma);
  const eventHandlerRegistry = new EventHandlerRegistry();
  const auditPublisher = new DefaultAuditPublisher(
    new InMemoryAuditSink(),
    new DefaultAuditLogger(),
  );

  eventHandlerRegistry.registerGlobal(new AuditEventHandler(auditPublisher));

  const eventDispatcher = new EventDispatcher(
    new InProcessEventBus(eventHandlerRegistry, new DefaultEventBusLogger()),
  );

  return {
    eventDispatcher,
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
