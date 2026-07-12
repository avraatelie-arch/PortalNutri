import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../errors/domain-error.js';
import { PersonId } from '../value-objects/person-id.js';
import { RefreshTokenFamilyId } from '../value-objects/refresh-token-family-id.js';
import { RefreshTokenHash } from '../value-objects/refresh-token-hash.js';
import { SessionStatus } from '../value-objects/session-status.js';
import { Session } from './session.aggregate.js';

const PERSON_ID = PersonId.create('550e8400-e29b-41d4-a716-446655440000');

function createSession(overrides: {
  refreshTokenExpiresAt?: Date;
  expiresAt?: Date;
} = {}) {
  const now = new Date('2026-07-12T12:00:00.000Z');

  return Session.open({
    personId: PERSON_ID,
    refreshTokenHash: RefreshTokenHash.fromHash('hash-1'),
    refreshTokenFamilyId: RefreshTokenFamilyId.generate(),
    refreshTokenExpiresAt:
      overrides.refreshTokenExpiresAt ?? new Date('2026-07-19T12:00:00.000Z'),
    expiresAt: overrides.expiresAt ?? new Date('2026-08-11T12:00:00.000Z'),
  });
}

describe('Session aggregate', () => {
  it('opens a session', () => {
    const session = createSession();

    assert.equal(session.getPersonId().toString(), PERSON_ID.toString());
    assert.equal(session.getTenantId(), null);
    assert.equal(session.getStatus(), SessionStatus.Active);
    assert.equal(session.getRefreshTokenHash().toString(), 'hash-1');
    assert.equal(session.isActive(), true);
    assert.equal(session.domainEvents.length, 1);
    assert.equal(session.domainEvents[0]?.eventName, 'SessionCreated');
  });

  it('rotates refresh token', () => {
    const session = createSession();
    session.pullDomainEvents();

    const nextRefreshExpiry = new Date('2026-07-20T12:00:00.000Z');
    session.rotateRefreshToken(
      RefreshTokenHash.fromHash('hash-2'),
      nextRefreshExpiry,
    );

    assert.equal(session.getRefreshTokenHash().toString(), 'hash-2');
    assert.equal(
      session.getRefreshTokenExpiresAt().toISOString(),
      nextRefreshExpiry.toISOString(),
    );
    assert.equal(
      session.getExpiresAt().toISOString(),
      '2026-08-11T12:00:00.000Z',
    );
  });

  it('revokes an active session', () => {
    const session = createSession();
    session.pullDomainEvents();

    session.revoke();

    assert.equal(session.getStatus(), SessionStatus.Revoked);
    assert.ok(session.getRevokedAt());
    assert.equal(session.domainEvents.length, 1);
    assert.equal(session.domainEvents[0]?.eventName, 'SessionRevoked');
  });

  it('revokes idempotently', () => {
    const session = createSession();
    session.revoke();
    session.pullDomainEvents();

    session.revoke();

    assert.equal(session.getStatus(), SessionStatus.Revoked);
    assert.equal(session.domainEvents.length, 0);
  });

  it('expires a session', () => {
    const session = createSession();

    session.markExpired();

    assert.equal(session.getStatus(), SessionStatus.Expired);
  });

  it('rejects refresh after expiration', () => {
    const session = createSession({
      refreshTokenExpiresAt: new Date('2026-07-10T12:00:00.000Z'),
    });

    assert.throws(
      () =>
        session.rotateRefreshToken(
          RefreshTokenHash.fromHash('hash-2'),
          new Date('2026-07-11T12:00:00.000Z'),
        ),
      DomainError,
    );
  });

  it('does not extend absolute session expiry on rotation', () => {
    const session = createSession({
      expiresAt: new Date('2026-08-11T12:00:00.000Z'),
    });

    assert.throws(
      () =>
        session.rotateRefreshToken(
          RefreshTokenHash.fromHash('hash-2'),
          new Date('2026-08-12T12:00:00.000Z'),
        ),
      /cannot extend the absolute session lifetime/,
    );
  });
});
