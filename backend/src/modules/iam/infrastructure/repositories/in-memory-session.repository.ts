import type { Session } from '../../domain/aggregates/session.aggregate.js';
import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import type { RefreshTokenHash } from '../../domain/value-objects/refresh-token-hash.js';
import type { SessionId } from '../../domain/value-objects/session-id.js';

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, Session>();

  async save(session: Session): Promise<void> {
    this.sessions.set(session.getId().toString(), session);
  }

  async findById(id: SessionId): Promise<Session | null> {
    return this.sessions.get(id.toString()) ?? null;
  }

  async findByRefreshTokenHash(
    hash: RefreshTokenHash,
  ): Promise<Session | null> {
    for (const session of this.sessions.values()) {
      if (session.getRefreshTokenHash().equals(hash)) {
        return session;
      }
    }

    return null;
  }
}
