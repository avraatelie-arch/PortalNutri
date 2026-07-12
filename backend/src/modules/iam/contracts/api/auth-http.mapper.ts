import { RegisterCredentialCommand } from '../../application/register-credential/register-credential.command.js';
import type { RegisterCredentialBody } from './schemas/auth.schemas.js';

export function toRegisterCredentialCommand(
  body: RegisterCredentialBody,
): RegisterCredentialCommand {
  return new RegisterCredentialCommand({
    personId: body.personId,
    password: body.password,
  });
}
