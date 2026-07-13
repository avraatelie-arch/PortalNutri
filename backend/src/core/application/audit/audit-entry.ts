import { randomUUID } from 'node:crypto';
import type { PlatformEvent } from '../events/platform-event.js';

export const REDACTED_VALUE = '[REDACTED]';

const METADATA_EXCLUDED_FIELDS = new Set([
  'eventName',
  'occurredAt',
  'personId',
  'sessionId',
  'tenantId',
  'correlationId',
]);

const SENSITIVE_FIELD_NAMES = [
  'password',
  'passwordhash',
  'accesstoken',
  'refreshtoken',
  'token',
  'tokenhash',
  'secret',
  'document',
  'email',
  'phone',
] as const;

export interface AuditEntry {
  readonly id: string;
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly recordedAt: Date;
  readonly correlationId: string | null;
  readonly personId: string | null;
  readonly sessionId: string | null;
  readonly tenantId: string | null;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createAuditEntryFromPlatformEvent(
  event: PlatformEvent,
  recordedAt: Date = new Date(),
): AuditEntry {
  const metadata = buildMetadata(event);

  return {
    id: randomUUID(),
    eventName: event.eventName,
    occurredAt: event.occurredAt,
    recordedAt,
    correlationId: extractExplicitString(event, 'correlationId'),
    personId: extractExplicitString(event, 'personId'),
    sessionId: extractExplicitString(event, 'sessionId'),
    tenantId: extractExplicitString(event, 'tenantId'),
    metadata,
  };
}

function extractExplicitString(
  event: PlatformEvent,
  field: 'personId' | 'sessionId' | 'tenantId' | 'correlationId',
): string | null {
  const value = (event as unknown as Record<string, unknown>)[field];

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return null;
}

function buildMetadata(event: PlatformEvent): Readonly<Record<string, unknown>> {
  const raw: Record<string, unknown> = {};

  for (const key of Object.keys(event)) {
    if (METADATA_EXCLUDED_FIELDS.has(key)) {
      continue;
    }

    raw[key] = (event as unknown as Record<string, unknown>)[key];
  }

  const redacted = redactSensitiveFields(raw);
  const cloned = structuredClone(redacted);

  return deepFreeze(cloned);
}

export function isSensitiveFieldName(fieldName: string): boolean {
  const normalized = fieldName.toLowerCase();

  if (SENSITIVE_FIELD_NAMES.includes(normalized as typeof SENSITIVE_FIELD_NAMES[number])) {
    return true;
  }

  return SENSITIVE_FIELD_NAMES.some((sensitiveName) =>
    normalized.includes(sensitiveName),
  );
}

export function redactSensitiveFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveFields(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (isSensitiveFieldName(key)) {
        result[key] = REDACTED_VALUE;
        continue;
      }

      result[key] = redactSensitiveFields(nestedValue);
    }

    return result as T;
  }

  return value;
}

export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  Object.freeze(value);

  for (const nestedValue of Object.values(value)) {
    if (nestedValue !== null && typeof nestedValue === 'object') {
      deepFreeze(nestedValue);
    }
  }

  return value;
}
