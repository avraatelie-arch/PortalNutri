import type { PlatformEvent } from './platform-event.js';

export interface EventPublisher {
  publish(event: PlatformEvent): Promise<void>;
  publishAll(events: readonly PlatformEvent[]): Promise<void>;
}
