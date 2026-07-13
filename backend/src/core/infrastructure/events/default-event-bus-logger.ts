import type { EventBusLogger } from '../../application/events/event-bus-logger.js';

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export class DefaultEventBusLogger implements EventBusLogger {
  logHandlerFailure(params: {
    eventName: string;
    handlerName: string;
    error: unknown;
  }): void {
    console.error(
      {
        eventName: params.eventName,
        handlerName: params.handlerName,
        err: serializeError(params.error),
      },
      'Event handler failed',
    );
  }
}
