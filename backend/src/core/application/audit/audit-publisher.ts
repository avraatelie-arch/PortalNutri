import type { PlatformEvent } from '../events/platform-event.js';

export interface AuditPublisher {
  record(event: PlatformEvent): Promise<void>;
}
