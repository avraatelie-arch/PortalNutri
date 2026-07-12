import type { RegisterCredentialRequest } from './register-credential.request.js';

export class RegisterCredentialCommand {
  constructor(readonly request: RegisterCredentialRequest) {}
}
