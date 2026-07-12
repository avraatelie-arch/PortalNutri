import type { Session } from '../aggregates/session.aggregate.js';
import type { RefreshTokenHash } from '../value-objects/refresh-token-hash.js';
import type { SessionId } from '../value-objects/session-id.js';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findById(id: SessionId): Promise<Session | null>;
  findByRefreshTokenHash(hash: RefreshTokenHash): Promise<Session | null>;
}
