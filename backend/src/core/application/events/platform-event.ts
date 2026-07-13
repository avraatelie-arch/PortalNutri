export interface PlatformEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
}

export function isPlatformEvent(value: unknown): value is PlatformEvent {
  return (
    typeof value === 'object'
    && value !== null
    && 'eventName' in value
    && typeof (value as PlatformEvent).eventName === 'string'
    && 'occurredAt' in value
    && (value as PlatformEvent).occurredAt instanceof Date
  );
}
