import type { AuthenticatePersonRequest } from './authenticate-person.request.js';

export class AuthenticatePersonCommand {
  constructor(readonly request: AuthenticatePersonRequest) {}
}
