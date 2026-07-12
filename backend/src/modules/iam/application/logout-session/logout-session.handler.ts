import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import { executeUseCase } from '../execute-use-case.js';
import { SessionNotFoundError } from '../errors/session-not-found.error.js';
import { LogoutSessionCommand } from './logout-session.command.js';
import { LogoutSessionResponse } from './logout-session.response.js';

export class LogoutSessionHandler {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: LogoutSessionCommand): Promise<LogoutSessionResponse> {
    return executeUseCase(async () => {
      const { sessionId } = command.request;
      const id = SessionId.create(sessionId);
      const session = await this.sessionRepository.findById(id);

      if (!session) {
        throw new SessionNotFoundError(sessionId);
      }

      session.revoke();
      await this.sessionRepository.save(session);
      session.pullDomainEvents();

      return LogoutSessionResponse.from(sessionId);
    });
  }
}
