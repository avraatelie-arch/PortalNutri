import type { EventBusLogger } from '../../application/events/event-bus-logger.js';
import type { EventPublisher } from '../../application/events/event-publisher.js';
import type { PlatformEvent } from '../../application/events/platform-event.js';
import type { EventHandlerRegistry } from './event-handler-registry.js';

export class InProcessEventBus implements EventPublisher {
  constructor(
    private readonly registry: EventHandlerRegistry,
    private readonly logger: EventBusLogger,
  ) {}

  async publish(event: PlatformEvent): Promise<void> {
    const handlers = this.registry.getHandlers(event.eventName);

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      }
      catch (error) {
        this.logger.logHandlerFailure({
          eventName: event.eventName,
          handlerName: handler.handlerName,
          error,
        });
      }
    }
  }

  async publishAll(events: readonly PlatformEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
