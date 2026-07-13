import { createAuditEntryFromPlatformEvent } from '../../application/audit/audit-entry.js';
import type { AuditLogger } from '../../application/audit/audit-logger.js';
import type { AuditPublisher } from '../../application/audit/audit-publisher.js';
import type { AuditSink } from '../../application/audit/audit-sink.js';
import type { PlatformEvent } from '../../application/events/platform-event.js';

export class DefaultAuditPublisher implements AuditPublisher {
  constructor(
    private readonly sink: AuditSink,
    private readonly logger: AuditLogger,
  ) {}

  async record(event: PlatformEvent): Promise<void> {
    try {
      const entry = createAuditEntryFromPlatformEvent(event);
      await this.sink.save(entry);
    }
    catch (error) {
      this.logger.logAuditFailure({
        eventName: event.eventName,
        error,
      });
    }
  }
}
