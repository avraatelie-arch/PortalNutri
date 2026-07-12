import { ApplicationError } from './application-error.js';

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super('Invalid credentials.');
    this.name = 'InvalidCredentialsError';
  }
}
