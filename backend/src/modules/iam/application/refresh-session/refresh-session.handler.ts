import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import type { TokenService } from '../ports/token-service.port.js';
import { RefreshTokenHash } from '../../domain/value-objects/refresh-token-hash.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import { executeUseCase } from '../execute-use-case.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { InvalidRefreshTokenError } from '../errors/invalid-refresh-token.error.js';
import { SessionNotFoundError } from '../errors/session-not-found.error.js';
import {
  assertSessionCanRefresh,
} from '../session-guards.js';
import { RefreshSessionCommand } from './refresh-session.command.js';
import { RefreshSessionResponse } from './refresh-session.response.js';

export class RefreshSessionHandler {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(
    command: RefreshSessionCommand,
  ): Promise<RefreshSessionResponse> {
    return executeUseCase(async () => {
      const { refreshToken } = command.request;
      const parsed = this.tokenService.parseRefreshToken(refreshToken);
      const sessionId = SessionId.create(parsed.sessionId);
      const session = await this.sessionRepository.findById(sessionId);

      if (!session) {
        throw new SessionNotFoundError(parsed.sessionId);
      }

      try {
        assertSessionCanRefresh(session);
      }
      catch (error) {
        await this.sessionRepository.save(session);
        throw error;
      }

      const presentedHash = this.tokenService.hashRefreshToken(parsed.secret);

      if (session.getRefreshTokenHash().toString() !== presentedHash) {
        session.revoke();
        await this.sessionRepository.save(session);
        await this.eventDispatcher.dispatch(session.pullDomainEvents());
        throw new InvalidRefreshTokenError();
      }

      const nextRefreshSecret = this.tokenService.generateRefreshTokenSecret();
      const nextRefreshTokenHash = RefreshTokenHash.fromHash(
        this.tokenService.hashRefreshToken(nextRefreshSecret),
      );
      const nextRefreshTokenExpiresAt =
        this.tokenService.computeRefreshTokenExpiresAt(session.getExpiresAt());

      session.rotateRefreshToken(
        nextRefreshTokenHash,
        nextRefreshTokenExpiresAt,
      );

      await this.sessionRepository.save(session);

      const issuedAccessToken = await this.tokenService.issueAccessToken({
        personId: session.getPersonId().toString(),
        sessionId: session.getId().toString(),
        tenantId: session.getTenantId(),
      });

      const nextRefreshToken = this.tokenService.formatRefreshToken(
        session.getId().toString(),
        nextRefreshSecret,
      );

      await this.eventDispatcher.dispatch(session.pullDomainEvents());

      return RefreshSessionResponse.from(
        issuedAccessToken.accessToken,
        nextRefreshToken,
        issuedAccessToken.accessTokenExpiresAt,
        session.getId().toString(),
      );
    });
  }
}
