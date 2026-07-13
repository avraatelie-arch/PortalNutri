import type { EventHandler } from '../../application/events/event-handler.js';

export class EventHandlerRegistry {
  private readonly handlers = new Map<string, EventHandler[]>();
  private readonly globalHandlers: EventHandler[] = [];

  register(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  registerGlobal(handler: EventHandler): void {
    this.globalHandlers.push(handler);
  }

  getHandlers(eventName: string): readonly EventHandler[] {
    return this.handlers.get(eventName) ?? [];
  }

  getGlobalHandlers(): readonly EventHandler[] {
    return this.globalHandlers;
  }
}
