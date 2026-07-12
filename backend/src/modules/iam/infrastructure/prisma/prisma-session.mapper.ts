import type { Session as SessionRecord } from '@prisma/client';
import { SessionStatus as PrismaSessionStatus } from '@prisma/client';
import { Session } from '../../domain/aggregates/session.aggregate.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { RefreshTokenFamilyId } from '../../domain/value-objects/refresh-token-family-id.js';
import { RefreshTokenHash } from '../../domain/value-objects/refresh-token-hash.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import { SessionStatus } from '../../domain/value-objects/session-status.js';

export type SessionPersistenceInput = {
  id: string;
  personId: string;
  tenantId: string | null;
  status: PrismaSessionStatus;
  refreshTokenHash: string;
  refreshTokenFamilyId: string;
  refreshTokenExpiresAt: Date;
  expiresAt: Date;
  lastAccessAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
};

export function toPersistence(session: Session): SessionPersistenceInput {
  return {
    id: session.getId().toString(),
    personId: session.getPersonId().toString(),
    tenantId: session.getTenantId(),
    status: toPrismaSessionStatus(session.getStatus()),
    refreshTokenHash: session.getRefreshTokenHash().toString(),
    refreshTokenFamilyId: session.getRefreshTokenFamilyId().toString(),
    refreshTokenExpiresAt: session.getRefreshTokenExpiresAt(),
    expiresAt: session.getExpiresAt(),
    lastAccessAt: session.getLastAccessAt(),
    createdAt: session.getCreatedAt(),
    revokedAt: session.getRevokedAt(),
  };
}

export function toDomain(record: SessionRecord): Session {
  return Session.reconstitute({
    id: SessionId.create(record.id),
    personId: PersonId.create(record.personId),
    tenantId: record.tenantId,
    status: toDomainSessionStatus(record.status),
    refreshTokenHash: RefreshTokenHash.fromHash(record.refreshTokenHash),
    refreshTokenFamilyId: RefreshTokenFamilyId.create(
      record.refreshTokenFamilyId,
    ),
    refreshTokenExpiresAt: record.refreshTokenExpiresAt,
    expiresAt: record.expiresAt,
    lastAccessAt: record.lastAccessAt,
    createdAt: record.createdAt,
    revokedAt: record.revokedAt,
  });
}

function toPrismaSessionStatus(status: SessionStatus): PrismaSessionStatus {
  return status as PrismaSessionStatus;
}

function toDomainSessionStatus(status: PrismaSessionStatus): SessionStatus {
  return status as SessionStatus;
}
