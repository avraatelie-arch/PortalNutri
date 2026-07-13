import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PlatformEvent } from '../events/platform-event.js';
import {
  REDACTED_VALUE,
  createAuditEntryFromPlatformEvent,
  deepFreeze,
  isSensitiveFieldName,
  redactSensitiveFields,
} from './audit-entry.js';

class PersonLikeEvent implements PlatformEvent {
  readonly eventName = 'PersonCreated';
  readonly occurredAt = new Date('2026-01-01T10:00:00.000Z');
  readonly aggregateId = 'person-aggregate-id';

  constructor(
    readonly fullName: string,
    readonly email: string,
    readonly documentValue: string,
    readonly phone: string,
    readonly nested: { token: string; safe: string },
  ) {}
}

class AuthenticationLikeEvent implements PlatformEvent {
  readonly eventName = 'AuthenticationSucceeded';
  readonly occurredAt = new Date('2026-01-02T12:00:00.000Z');
  readonly personId: string;
  readonly sessionId: string;
  readonly tenantId: string | null;
  readonly correlationId: string | null;

  constructor(
    personId: string,
    sessionId: string,
    tenantId: string | null = null,
    correlationId: string | null = null,
  ) {
    this.personId = personId;
    this.sessionId = sessionId;
    this.tenantId = tenantId;
    this.correlationId = correlationId;
  }
}

describe('createAuditEntryFromPlatformEvent', () => {
  it('promotes only explicit identity fields', () => {
    const entry = createAuditEntryFromPlatformEvent(
      new AuthenticationLikeEvent('person-1', 'session-1', 'tenant-1', 'corr-1'),
    );

    assert.equal(entry.personId, 'person-1');
    assert.equal(entry.sessionId, 'session-1');
    assert.equal(entry.tenantId, 'tenant-1');
    assert.equal(entry.correlationId, 'corr-1');
  });

  it('keeps missing identity fields as null without aggregate inference', () => {
    const entry = createAuditEntryFromPlatformEvent(
      new PersonLikeEvent(
        'Maria Silva',
        'maria@example.com',
        'AB123456',
        '+5511999999999',
        { token: 'secret-token', safe: 'visible' },
      ),
    );

    assert.equal(entry.personId, null);
    assert.equal(entry.sessionId, null);
    assert.equal(entry.tenantId, null);
    assert.equal(entry.correlationId, null);
    assert.equal(entry.metadata.aggregateId, 'person-aggregate-id');
  });

  it('deep-clones and deep-freezes metadata', () => {
    const event = new PersonLikeEvent(
      'Maria Silva',
      'maria@example.com',
      'AB123456',
      '+5511999999999',
      { token: 'secret-token', safe: 'visible' },
    );
    const entry = createAuditEntryFromPlatformEvent(event);

    assert.equal(Object.isFrozen(entry.metadata), true);
    assert.equal(Object.isFrozen(entry.metadata.nested), true);

    const metadataBefore = entry.metadata.aggregateId;
    try {
      (entry.metadata as Record<string, unknown>).aggregateId = 'mutated';
    }
    catch {
      // strict-mode assignment to frozen object throws
    }
    assert.equal(entry.metadata.aggregateId, metadataBefore);

    const nestedBefore = (entry.metadata.nested as Record<string, unknown>).safe;
    try {
      (entry.metadata.nested as Record<string, unknown>).safe = 'mutated';
    }
    catch {
      // strict-mode assignment to frozen object throws
    }
    assert.equal((entry.metadata.nested as Record<string, unknown>).safe, nestedBefore);
  });

  it('does not mutate the original platform event', () => {
    const event = new PersonLikeEvent(
      'Maria Silva',
      'maria@example.com',
      'AB123456',
      '+5511999999999',
      { token: 'secret-token', safe: 'visible' },
    );

    createAuditEntryFromPlatformEvent(event);

    assert.equal(event.fullName, 'Maria Silva');
    assert.equal(event.email, 'maria@example.com');
    assert.equal(event.documentValue, 'AB123456');
    assert.equal(event.phone, '+5511999999999');
    assert.equal(event.nested.token, 'secret-token');
    assert.equal(event.nested.safe, 'visible');
  });

  it('recursively redacts sensitive metadata fields', () => {
    const entry = createAuditEntryFromPlatformEvent(
      new PersonLikeEvent(
        'Maria Silva',
        'maria@example.com',
        'AB123456',
        '+5511999999999',
        { token: 'secret-token', safe: 'visible' },
      ),
    );

    assert.equal(entry.metadata.email, REDACTED_VALUE);
    assert.equal(entry.metadata.documentValue, REDACTED_VALUE);
    assert.equal(entry.metadata.phone, REDACTED_VALUE);
    assert.deepEqual(entry.metadata.nested, {
      token: REDACTED_VALUE,
      safe: 'visible',
    });
    assert.equal(entry.metadata.fullName, 'Maria Silva');
    assert.equal(entry.metadata.aggregateId, 'person-aggregate-id');
  });

  it('uses occurredAt from the event and generates recordedAt', () => {
    const occurredAt = new Date('2026-03-15T08:30:00.000Z');
    const recordedAt = new Date('2026-03-15T08:30:01.000Z');
    const event: PlatformEvent = {
      eventName: 'TestEvent',
      occurredAt,
    };

    const entry = createAuditEntryFromPlatformEvent(event, recordedAt);

    assert.equal(entry.occurredAt, occurredAt);
    assert.equal(entry.recordedAt, recordedAt);
    assert.match(entry.id, /^[0-9a-f-]{36}$/i);
  });
});

describe('redactSensitiveFields', () => {
  it('redacts nested sensitive keys recursively', () => {
    const input = {
      profile: {
        email: 'user@example.com',
        settings: {
          refreshToken: 'token-value',
          theme: 'dark',
        },
      },
      passwordHash: 'hash',
    };

    const redacted = redactSensitiveFields(input);

    assert.deepEqual(redacted, {
      profile: {
        email: REDACTED_VALUE,
        settings: {
          refreshToken: REDACTED_VALUE,
          theme: 'dark',
        },
      },
      passwordHash: REDACTED_VALUE,
    });
  });
});

describe('isSensitiveFieldName', () => {
  it('matches sensitive field names case-insensitively', () => {
    assert.equal(isSensitiveFieldName('Email'), true);
    assert.equal(isSensitiveFieldName('documentValue'), true);
    assert.equal(isSensitiveFieldName('aggregateId'), false);
    assert.equal(isSensitiveFieldName('fullName'), false);
  });
});

describe('deepFreeze', () => {
  it('freezes nested object graphs', () => {
    const value = deepFreeze({ nested: { value: 1 } });

    assert.equal(Object.isFrozen(value), true);
    assert.equal(Object.isFrozen(value.nested), true);
  });
});
