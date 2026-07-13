import type { AuditPublisher } from '../../application/audit/audit-publisher.js';
import type { EventHandler } from '../../application/events/event-handler.js';
import type { PlatformEvent } from '../../application/events/platform-event.js';

export class AuditEventHandler implements EventHandler {
  readonly handlerName = 'audit-event-handler';

  constructor(private readonly auditPublisher: AuditPublisher) {}

  async handle(event: PlatformEvent): Promise<void> {
    await this.auditPublisher.record(event);
  }
}
