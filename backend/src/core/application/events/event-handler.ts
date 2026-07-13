import type { PlatformEvent } from './platform-event.js';

export interface EventHandler<T extends PlatformEvent = PlatformEvent> {
  readonly handlerName: string;
  handle(event: T): Promise<void>;
}
