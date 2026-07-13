import { isPlatformEvent } from './platform-event.js';
import type { EventPublisher } from './event-publisher.js';

export class EventDispatcher {
  constructor(private readonly eventPublisher: EventPublisher) {}

  async dispatch(events: readonly unknown[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const platformEvents = events.filter(isPlatformEvent);

    if (platformEvents.length === 0) {
      return;
    }

    await this.eventPublisher.publishAll(platformEvents);
  }
}
