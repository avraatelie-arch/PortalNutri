import { ApplicationError } from './application-error.js';

export class InvalidRefreshTokenError extends ApplicationError {
  constructor() {
    super('Refresh token is invalid.');
    this.name = 'InvalidRefreshTokenError';
  }
}
