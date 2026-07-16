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
import { PrismaTenantRepository } from '../iam/infrastructure/repositories/prisma-tenant.repository.js';
import {
  createPatientHandlers,
  type PatientHandlers,
} from './composition/patient.factory.js';
import { PrismaPatientRepository } from './infrastructure/repositories/prisma-patient.repository.js';

export interface PatientDependencies {
  eventDispatcher: EventDispatcher;
  patientHandlers: PatientHandlers;
}

export function createPatientDependencies(_env: Env): PatientDependencies {
  const prisma = getPrismaClient();
  const patientRepository = new PrismaPatientRepository(prisma);
  const tenantRepository = new PrismaTenantRepository(prisma);
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
    patientHandlers: createPatientHandlers({
      patientRepository,
      tenantRepository,
      eventDispatcher,
    }),
  };
}

export async function registerPatientModule(
  _app: FastifyInstance,
): Promise<void> {}
