import { ApplicationError } from './application-error.js';

export class SessionNotFoundError extends ApplicationError {
  constructor(sessionId: string) {
    super(`Session ${sessionId} was not found.`);
    this.name = 'SessionNotFoundError';
  }
}
