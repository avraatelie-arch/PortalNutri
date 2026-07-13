import type { PlatformEvent } from '../core/application/events/platform-event.js';
import { EventDispatcher } from '../core/application/events/event-dispatcher.js';
import type { EventPublisher } from '../core/application/events/event-publisher.js';

export class CapturingEventDispatcher extends EventDispatcher {
  readonly dispatched: unknown[][] = [];

  constructor() {
    const publisher: EventPublisher = {
      async publish(event: PlatformEvent) {
        // CapturingEventDispatcher overrides dispatch; publisher unused.
        void event;
      },
      async publishAll(events: readonly PlatformEvent[]) {
        void events;
      },
    };

    super(publisher);
  }

  override async dispatch(events: readonly unknown[]): Promise<void> {
    this.dispatched.push([...events]);
    await super.dispatch(events);
  }
}
