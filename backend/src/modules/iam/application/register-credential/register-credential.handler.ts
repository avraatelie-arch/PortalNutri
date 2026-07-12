import type { CredentialRepository } from '../../domain/repositories/credential-repository.js';
import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.port.js';
import { Credential } from '../../domain/aggregates/credential.aggregate.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { executeUseCase } from '../execute-use-case.js';
import { CredentialAlreadyExistsError } from '../errors/credential-already-exists.error.js';
import { PersonInactiveError } from '../errors/person-inactive.error.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { RegisterCredentialCommand } from './register-credential.command.js';
import { RegisterCredentialResponse } from './register-credential.response.js';

export class RegisterCredentialHandler {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly credentialRepository: CredentialRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    command: RegisterCredentialCommand,
  ): Promise<RegisterCredentialResponse> {
    return executeUseCase(async () => {
      const { personId, password } = command.request;
      const id = PersonId.create(personId);
      const person = await this.personRepository.findById(id);

      if (!person) {
        throw new PersonNotFoundError(personId);
      }

      if (!person.isActive()) {
        throw new PersonInactiveError(personId);
      }

      if (await this.credentialRepository.existsByPersonId(id)) {
        throw new CredentialAlreadyExistsError(personId);
      }

      const passwordHash = PasswordHash.fromHash(
        await this.passwordHasher.hash(password),
      );

      const credential = Credential.create({
        personId: id,
        passwordHash,
      });

      await this.credentialRepository.save(credential);
      credential.pullDomainEvents();

      return RegisterCredentialResponse.from(credential);
    });
  }
}
