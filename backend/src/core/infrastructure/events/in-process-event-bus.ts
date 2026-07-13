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
    const eventSpecificHandlers = this.registry.getHandlers(event.eventName);
    const globalHandlers = this.registry.getGlobalHandlers();

    for (const handler of eventSpecificHandlers) {
      await this.invokeHandler(event, handler);
    }

    for (const handler of globalHandlers) {
      await this.invokeHandler(event, handler);
    }
  }

  async publishAll(events: readonly PlatformEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  private async invokeHandler(
    event: PlatformEvent,
    handler: { readonly handlerName: string; handle(event: PlatformEvent): Promise<void> },
  ): Promise<void> {
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
