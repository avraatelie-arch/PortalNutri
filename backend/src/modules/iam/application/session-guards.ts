import type { Session } from '../domain/aggregates/session.aggregate.js';
import { SessionExpiredError } from './errors/session-expired.error.js';
import { SessionRevokedError } from './errors/session-revoked.error.js';

export function assertSessionCanRefresh(
  session: Session,
  now: Date = new Date(),
): void {
  if (session.isRevoked()) {
    throw new SessionRevokedError(session.getId().toString());
  }

  if (session.isExpired() || session.isAbsoluteLifetimeExpired(now)) {
    if (session.isActive()) {
      session.markExpired();
    }

    throw new SessionExpiredError(session.getId().toString());
  }

  if (session.isRefreshTokenExpired(now)) {
    if (session.isActive()) {
      session.markExpired();
    }

    throw new SessionExpiredError(session.getId().toString());
  }
}

export function assertSessionCanValidateAccess(
  session: Session,
  now: Date = new Date(),
): void {
  if (session.isRevoked()) {
    throw new SessionRevokedError(session.getId().toString());
  }

  if (session.isExpired() || session.isAbsoluteLifetimeExpired(now)) {
    if (session.isActive()) {
      session.markExpired();
    }

    throw new SessionExpiredError(session.getId().toString());
  }
}
