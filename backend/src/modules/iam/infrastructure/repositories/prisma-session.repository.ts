import type { PrismaClient } from '@prisma/client';
import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import type { RefreshTokenHash } from '../../domain/value-objects/refresh-token-hash.js';
import type { SessionId } from '../../domain/value-objects/session-id.js';
import type { Session } from '../../domain/aggregates/session.aggregate.js';
import { toDomain, toPersistence } from '../prisma/prisma-session.mapper.js';

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(session: Session): Promise<void> {
    const data = toPersistence(session);

    await this.prisma.session.upsert({
      where: { id: data.id },
      create: data,
      update: {
        tenantId: data.tenantId,
        status: data.status,
        refreshTokenHash: data.refreshTokenHash,
        refreshTokenFamilyId: data.refreshTokenFamilyId,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        expiresAt: data.expiresAt,
        lastAccessAt: data.lastAccessAt,
        revokedAt: data.revokedAt,
      },
    });
  }

  async findById(id: SessionId): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByRefreshTokenHash(
    hash: RefreshTokenHash,
  ): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { refreshTokenHash: hash.toString() },
    });

    return record ? toDomain(record) : null;
  }
}
