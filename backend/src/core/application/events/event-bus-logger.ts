export interface EventBusLogger {
  logHandlerFailure(params: {
    eventName: string;
    handlerName: string;
    error: unknown;
  }): void;
}
