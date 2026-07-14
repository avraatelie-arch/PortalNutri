import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import type { TokenService } from '../ports/token-service.port.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import { executeUseCase } from '../execute-use-case.js';
import { SessionNotFoundError } from '../errors/session-not-found.error.js';
import {
  assertSessionCanValidateAccess,
} from '../session-guards.js';
import type { SecurityContext } from '../security-context.js';
import { ValidateAccessTokenQuery } from './validate-access-token.query.js';
import { ValidateAccessTokenResult } from './validate-access-token.result.js';

export class ValidateAccessTokenHandler {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    query: ValidateAccessTokenQuery,
  ): Promise<ValidateAccessTokenResult> {
    return executeUseCase(async () => {
      const claims = await this.tokenService.verifyAccessToken(
        query.request.accessToken,
      );

      const session = await this.sessionRepository.findById(
        SessionId.create(claims.sessionId),
      );

      if (!session) {
        throw new SessionNotFoundError(claims.sessionId);
      }

      try {
        assertSessionCanValidateAccess(session);
      }
      catch (error) {
        await this.sessionRepository.save(session);
        throw error;
      }

      if (session.getPersonId().toString() !== claims.personId) {
        throw new SessionNotFoundError(claims.sessionId);
      }

      const securityContext: SecurityContext = {
        personId: claims.personId,
        sessionId: claims.sessionId,
        tenantId: session.getTenantId(),
      };

      return ValidateAccessTokenResult.from(securityContext);
    });
  }
}
