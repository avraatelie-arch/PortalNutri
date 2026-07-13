import { EventDispatcher } from '../core/application/events/event-dispatcher.js';
import type { EventPublisher } from '../core/application/events/event-publisher.js';

const noopEventPublisher: EventPublisher = {
  async publish() {},
  async publishAll() {},
};

export const noopEventDispatcher = new EventDispatcher(noopEventPublisher);
