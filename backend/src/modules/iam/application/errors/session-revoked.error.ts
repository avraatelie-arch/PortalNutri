import { ApplicationError } from './application-error.js';

export class SessionRevokedError extends ApplicationError {
  constructor(sessionId: string) {
    super(`Session ${sessionId} has been revoked.`);
    this.name = 'SessionRevokedError';
  }
}
