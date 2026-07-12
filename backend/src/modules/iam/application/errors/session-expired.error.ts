import { ApplicationError } from './application-error.js';

export class SessionExpiredError extends ApplicationError {
  constructor(sessionId: string) {
    super(`Session ${sessionId} has expired.`);
    this.name = 'SessionExpiredError';
  }
}
