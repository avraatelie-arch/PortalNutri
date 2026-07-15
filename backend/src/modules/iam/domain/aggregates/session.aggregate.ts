import { AggregateRoot } from './aggregate-root.js';
import { DomainError } from '../errors/domain-error.js';
import { SessionCreated, SessionRevoked, TenantCleared, TenantSelected } from '../events/session-events.js';
import { PersonId } from '../value-objects/person-id.js';
import { RefreshTokenFamilyId } from '../value-objects/refresh-token-family-id.js';
import { RefreshTokenHash } from '../value-objects/refresh-token-hash.js';
import { SessionId } from '../value-objects/session-id.js';
import { SessionStatus } from '../value-objects/session-status.js';

export interface OpenSessionProps {
  id?: SessionId;
  personId: PersonId;
  refreshTokenHash: RefreshTokenHash;
  refreshTokenFamilyId: RefreshTokenFamilyId;
  refreshTokenExpiresAt: Date;
  expiresAt: Date;
}

export interface ReconstituteSessionProps {
  id: SessionId;
  personId: PersonId;
  tenantId: string | null;
  status: SessionStatus;
  refreshTokenHash: RefreshTokenHash;
  refreshTokenFamilyId: RefreshTokenFamilyId;
  refreshTokenExpiresAt: Date;
  expiresAt: Date;
  lastAccessAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export class Session extends AggregateRoot {
  private constructor(
    private readonly id: SessionId,
    private readonly personId: PersonId,
    private tenantId: string | null,
    private status: SessionStatus,
    private refreshTokenHash: RefreshTokenHash,
    private readonly refreshTokenFamilyId: RefreshTokenFamilyId,
    private refreshTokenExpiresAt: Date,
    private readonly expiresAt: Date,
    private lastAccessAt: Date,
    private readonly createdAt: Date,
    private revokedAt: Date | null,
  ) {
    super();
  }

  static open(props: OpenSessionProps): Session {
    const now = new Date();

    const session = new Session(
      props.id ?? SessionId.generate(),
      props.personId,
      null,
      SessionStatus.Active,
      props.refreshTokenHash,
      props.refreshTokenFamilyId,
      props.refreshTokenExpiresAt,
      props.expiresAt,
      now,
      now,
      null,
    );

    session.addDomainEvent(new SessionCreated(session.id.toString()));

    return session;
  }

  static reconstitute(props: ReconstituteSessionProps): Session {
    return new Session(
      props.id,
      props.personId,
      props.tenantId,
      props.status,
      props.refreshTokenHash,
      props.refreshTokenFamilyId,
      props.refreshTokenExpiresAt,
      props.expiresAt,
      props.lastAccessAt,
      props.createdAt,
      props.revokedAt,
    );
  }

  getId(): SessionId {
    return this.id;
  }

  getPersonId(): PersonId {
    return this.personId;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }

  getStatus(): SessionStatus {
    return this.status;
  }

  getRefreshTokenHash(): RefreshTokenHash {
    return this.refreshTokenHash;
  }

  getRefreshTokenFamilyId(): RefreshTokenFamilyId {
    return this.refreshTokenFamilyId;
  }

  getRefreshTokenExpiresAt(): Date {
    return this.refreshTokenExpiresAt;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getLastAccessAt(): Date {
    return this.lastAccessAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getRevokedAt(): Date | null {
    return this.revokedAt;
  }

  isActive(): boolean {
    return this.status === SessionStatus.Active;
  }

  isRevoked(): boolean {
    return this.status === SessionStatus.Revoked;
  }

  isExpired(): boolean {
    return this.status === SessionStatus.Expired;
  }

  isAbsoluteLifetimeExpired(now: Date = new Date()): boolean {
    return now >= this.expiresAt;
  }

  isRefreshTokenExpired(now: Date = new Date()): boolean {
    return now >= this.refreshTokenExpiresAt;
  }

  canRefresh(now: Date = new Date()): boolean {
    return (
      this.isActive() &&
      !this.isAbsoluteLifetimeExpired(now) &&
      !this.isRefreshTokenExpired(now)
    );
  }

  canValidateAccess(now: Date = new Date()): boolean {
    return this.isActive() && !this.isAbsoluteLifetimeExpired(now);
  }

  rotateRefreshToken(
    refreshTokenHash: RefreshTokenHash,
    refreshTokenExpiresAt: Date,
  ): void {
    if (!this.canRefresh()) {
      throw new DomainError('Session cannot refresh its token.');
    }

    if (refreshTokenExpiresAt > this.expiresAt) {
      throw new DomainError(
        'Refresh token expiry cannot extend the absolute session lifetime.',
      );
    }

    this.refreshTokenHash = refreshTokenHash;
    this.refreshTokenExpiresAt = refreshTokenExpiresAt;
    this.lastAccessAt = new Date();
  }

  revoke(): void {
    if (this.isRevoked() || this.isExpired()) {
      return;
    }

    this.status = SessionStatus.Revoked;
    this.revokedAt = new Date();
    this.addDomainEvent(new SessionRevoked(this.id.toString()));
  }

  markExpired(): void {
    if (this.isRevoked() || this.isExpired()) {
      return;
    }

    this.status = SessionStatus.Expired;
  }

  bindTenant(tenantId: string): void {
    if (!this.canValidateAccess()) {
      throw new DomainError('Session cannot bind a tenant.');
    }

    const normalizedTenantId = tenantId?.trim();

    if (!normalizedTenantId) {
      throw new DomainError('Tenant id is required.');
    }

    if (this.tenantId === normalizedTenantId) {
      return;
    }

    if (this.tenantId !== null) {
      this.addDomainEvent(
        new TenantCleared(this.id.toString(), this.tenantId),
      );
    }

    this.tenantId = normalizedTenantId;
    this.lastAccessAt = new Date();
    this.addDomainEvent(
      new TenantSelected(
        this.id.toString(),
        normalizedTenantId,
        this.personId.toString(),
      ),
    );
  }

  clearTenant(): void {
    if (!this.canValidateAccess()) {
      throw new DomainError('Session cannot clear tenant.');
    }

    if (this.tenantId === null) {
      return;
    }

    const previousTenantId = this.tenantId;

    this.tenantId = null;
    this.lastAccessAt = new Date();
    this.addDomainEvent(
      new TenantCleared(this.id.toString(), previousTenantId),
    );
  }
}
