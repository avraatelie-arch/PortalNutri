import type { EventHandler } from '../../application/events/event-handler.js';

export class EventHandlerRegistry {
  private readonly handlers = new Map<string, EventHandler[]>();

  register(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  getHandlers(eventName: string): readonly EventHandler[] {
    return this.handlers.get(eventName) ?? [];
  }
}
