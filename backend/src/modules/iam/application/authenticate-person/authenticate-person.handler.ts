import type { CredentialRepository } from '../../domain/repositories/credential-repository.js';
import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.port.js';
import type { TokenService } from '../services/token-service.port.js';
import { Session } from '../../domain/aggregates/session.aggregate.js';
import { Email } from '../../domain/value-objects/email.js';
import { RefreshTokenFamilyId } from '../../domain/value-objects/refresh-token-family-id.js';
import { RefreshTokenHash } from '../../domain/value-objects/refresh-token-hash.js';
import { executeUseCase } from '../execute-use-case.js';
import { AuthenticationSucceeded } from '../events/authentication-succeeded.event.js';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
import { AuthenticatePersonCommand } from './authenticate-person.command.js';
import { AuthenticatePersonResponse } from './authenticate-person.response.js';

export class AuthenticatePersonHandler {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly credentialRepository: CredentialRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    command: AuthenticatePersonCommand,
  ): Promise<AuthenticatePersonResponse> {
    return executeUseCase(async () => {
      const { email, password } = command.request;
      const emailVo = Email.create(email);
      const person = await this.personRepository.findByEmail(emailVo);

      if (!person || !person.isActive()) {
        throw new InvalidCredentialsError();
      }

      const credential = await this.credentialRepository.findByPersonId(
        person.getId(),
      );

      if (!credential || !credential.isActive()) {
        throw new InvalidCredentialsError();
      }

      const passwordMatches = await this.passwordHasher.verify(
        credential.getPasswordHash().toString(),
        password,
      );

      if (!passwordMatches) {
        throw new InvalidCredentialsError();
      }

      const sessionExpiresAt = this.tokenService.computeSessionExpiresAt();
      const refreshSecret = this.tokenService.generateRefreshTokenSecret();
      const refreshTokenHash = RefreshTokenHash.fromHash(
        this.tokenService.hashRefreshToken(refreshSecret),
      );

      const session = Session.open({
        personId: person.getId(),
        refreshTokenHash,
        refreshTokenFamilyId: RefreshTokenFamilyId.generate(),
        refreshTokenExpiresAt: this.tokenService.computeRefreshTokenExpiresAt(
          sessionExpiresAt,
        ),
        expiresAt: sessionExpiresAt,
      });

      await this.sessionRepository.save(session);

      const issuedAccessToken = await this.tokenService.issueAccessToken({
        personId: person.getId().toString(),
        sessionId: session.getId().toString(),
        tenantId: null,
      });

      const refreshToken = this.tokenService.formatRefreshToken(
        session.getId().toString(),
        refreshSecret,
      );

      new AuthenticationSucceeded(
        person.getId().toString(),
        session.getId().toString(),
      );

      session.pullDomainEvents();

      return AuthenticatePersonResponse.from(
        issuedAccessToken.accessToken,
        refreshToken,
        issuedAccessToken.accessTokenExpiresAt,
        session.getId().toString(),
      );
    });
  }
}
