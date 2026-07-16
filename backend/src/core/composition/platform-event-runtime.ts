import { EventDispatcher } from '../application/events/event-dispatcher.js';
import { AuditEventHandler } from '../infrastructure/audit/audit-event-handler.js';
import { DefaultAuditLogger } from '../infrastructure/audit/default-audit-logger.js';
import { DefaultAuditPublisher } from '../infrastructure/audit/default-audit-publisher.js';
import { InMemoryAuditSink } from '../infrastructure/audit/in-memory-audit-sink.js';
import { DefaultEventBusLogger } from '../infrastructure/events/default-event-bus-logger.js';
import { EventHandlerRegistry } from '../infrastructure/events/event-handler-registry.js';
import { InProcessEventBus } from '../infrastructure/events/in-process-event-bus.js';

export interface PlatformEventRuntime {
  eventHandlerRegistry: EventHandlerRegistry;
  auditPublisher: DefaultAuditPublisher;
  eventDispatcher: EventDispatcher;
}

let platformEventRuntime: PlatformEventRuntime | null = null;

export function getPlatformEventRuntime(): PlatformEventRuntime {
  if (!platformEventRuntime) {
    const eventHandlerRegistry = new EventHandlerRegistry();
    const auditPublisher = new DefaultAuditPublisher(
      new InMemoryAuditSink(),
      new DefaultAuditLogger(),
    );

    eventHandlerRegistry.registerGlobal(new AuditEventHandler(auditPublisher));

    platformEventRuntime = {
      eventHandlerRegistry,
      auditPublisher,
      eventDispatcher: new EventDispatcher(
        new InProcessEventBus(eventHandlerRegistry, new DefaultEventBusLogger()),
      ),
    };
  }

  return platformEventRuntime;
}

export function resetPlatformEventRuntimeForTests(): void {
  platformEventRuntime = null;
}
