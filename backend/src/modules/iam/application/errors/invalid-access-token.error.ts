import { ApplicationError } from './application-error.js';

export class InvalidAccessTokenError extends ApplicationError {
  constructor() {
    super('Access token is invalid.');
    this.name = 'InvalidAccessTokenError';
  }
}
