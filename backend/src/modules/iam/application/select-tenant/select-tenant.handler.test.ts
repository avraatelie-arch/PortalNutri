import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import type { PasswordHasher } from '../ports/password-hasher.port.js';
import { AuthenticatePersonCommand } from '../authenticate-person/authenticate-person.command.js';
import { AuthenticatePersonHandler } from '../authenticate-person/authenticate-person.handler.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { DeactivateTenantCommand } from '../deactivate-tenant/deactivate-tenant.command.js';
import { DeactivateTenantHandler } from '../deactivate-tenant/deactivate-tenant.handler.js';
import { MembershipInactiveError } from '../errors/membership-inactive.error.js';
import { MembershipNotFoundError } from '../errors/membership-not-found.error.js';
import { SessionNotFoundError } from '../errors/session-not-found.error.js';
import { TenantInactiveError } from '../errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { RegisterCredentialCommand } from '../register-credential/register-credential.command.js';
import { RegisterCredentialHandler } from '../register-credential/register-credential.handler.js';
import { InMemoryCredentialRepository } from '../../infrastructure/repositories/in-memory-credential.repository.js';
import { InMemoryMembershipRepository } from '../../infrastructure/repositories/in-memory-membership.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemorySessionRepository } from '../../infrastructure/repositories/in-memory-session.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { JoseTokenService } from '../../infrastructure/tokens/jose-token.service.js';
import { createTestJwtConfig } from '../../../../test-support/jwt-test.config.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AddPersonToTenantCommand } from '../add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../add-person-to-tenant/add-person-to-tenant.handler.js';
import { RemovePersonFromTenantCommand } from '../remove-person-from-tenant/remove-person-from-tenant.command.js';
import { RemovePersonFromTenantHandler } from '../remove-person-from-tenant/remove-person-from-tenant.handler.js';
import { SelectTenantCommand } from './select-tenant.command.js';
import { SelectTenantHandler } from './select-tenant.handler.js';

const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440098';
const UNKNOWN_SESSION_ID = '550e8400-e29b-41d4-a716-446655440099';

class FakePasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return `$argon2id$fake$${plainPassword}`;
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    return hash === `$argon2id$fake$${plainPassword}`;
  }
}

async function seedAuthenticatedSession() {
  const personRepository = new InMemoryPersonRepository();
  const credentialRepository = new InMemoryCredentialRepository();
  const sessionRepository = new InMemorySessionRepository();
  const tenantRepository = new InMemoryTenantRepository();
  const membershipRepository = new InMemoryMembershipRepository();
  const tokenService = new JoseTokenService(createTestJwtConfig());
  const password = 'SecureP@ssw0rd';

  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.silva@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'AB123456',
      birthDate: '1990-06-15',
    }),
  );

  await new RegisterCredentialHandler(
    personRepository,
    credentialRepository,
    new FakePasswordHasher(),
  ).execute(
    new RegisterCredentialCommand({
      personId: person.id,
      password,
    }),
  );

  const authenticated = await new AuthenticatePersonHandler(
    personRepository,
    credentialRepository,
    sessionRepository,
    new FakePasswordHasher(),
    tokenService,
    noopEventDispatcher,
  ).execute(
    new AuthenticatePersonCommand({
      email: 'maria.silva@example.com',
      password,
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
    }),
  );

  await new AddPersonToTenantHandler(
    membershipRepository,
    personRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new AddPersonToTenantCommand({
      personId: person.id,
      tenantId: tenant.id,
    }),
  );

  const selectTenantHandler = new SelectTenantHandler(
    sessionRepository,
    tenantRepository,
    membershipRepository,
    noopEventDispatcher,
  );

  return {
    personId: person.id,
    sessionId: authenticated.sessionId,
    tenantId: tenant.id,
    personRepository,
    sessionRepository,
    tenantRepository,
    membershipRepository,
    selectTenantHandler,
  };
}

describe('SelectTenantHandler', () => {
  it('binds tenant to an authenticated session', async () => {
    const {
      personId,
      sessionId,
      tenantId,
      sessionRepository,
      selectTenantHandler,
    } = await seedAuthenticatedSession();

    const response = await selectTenantHandler.execute(
      new SelectTenantCommand({
        sessionId,
        personId,
        tenantId,
      }),
    );

    assert.equal(response.sessionId, sessionId);
    assert.equal(response.tenantId, tenantId);

    const session = await sessionRepository.findById(SessionId.create(sessionId));

    assert.equal(session?.getTenantId(), tenantId);
  });

  it('replaces a previously selected tenant', async () => {
    const {
      personId,
      sessionId,
      tenantId,
      personRepository,
      sessionRepository,
      tenantRepository,
      membershipRepository,
      selectTenantHandler,
    } = await seedAuthenticatedSession();

    const secondTenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Second Clinic',
        slug: 'second-clinic',
      }),
    );

    await new AddPersonToTenantHandler(
      membershipRepository,
      personRepository,
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new AddPersonToTenantCommand({
        personId,
        tenantId: secondTenant.id,
      }),
    );

    await selectTenantHandler.execute(
      new SelectTenantCommand({
        sessionId,
        personId,
        tenantId,
      }),
    );

    const response = await selectTenantHandler.execute(
      new SelectTenantCommand({
        sessionId,
        personId,
        tenantId: secondTenant.id,
      }),
    );

    assert.equal(response.tenantId, secondTenant.id);

    const session = await sessionRepository.findById(SessionId.create(sessionId));

    assert.equal(session?.getTenantId(), secondTenant.id);
  });

  it('throws TenantNotFoundError when tenant does not exist', async () => {
    const { personId, sessionId, selectTenantHandler } =
      await seedAuthenticatedSession();

    await assert.rejects(
      selectTenantHandler.execute(
        new SelectTenantCommand({
          sessionId,
          personId,
          tenantId: UNKNOWN_TENANT_ID,
        }),
      ),
      TenantNotFoundError,
    );
  });

  it('throws TenantInactiveError when tenant is inactive', async () => {
    const {
      personId,
      sessionId,
      tenantId,
      tenantRepository,
      selectTenantHandler,
    } = await seedAuthenticatedSession();

    await new DeactivateTenantHandler(tenantRepository, noopEventDispatcher).execute(
      new DeactivateTenantCommand(tenantId),
    );

    await assert.rejects(
      selectTenantHandler.execute(
        new SelectTenantCommand({
          sessionId,
          personId,
          tenantId,
        }),
      ),
      TenantInactiveError,
    );
  });

  it('throws MembershipNotFoundError when membership does not exist', async () => {
    const {
      personId,
      sessionId,
      tenantRepository,
      selectTenantHandler,
    } = await seedAuthenticatedSession();

    const otherTenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Other Clinic',
        slug: 'other-clinic',
      }),
    );

    await assert.rejects(
      selectTenantHandler.execute(
        new SelectTenantCommand({
          sessionId,
          personId,
          tenantId: otherTenant.id,
        }),
      ),
      MembershipNotFoundError,
    );
  });

  it('throws MembershipInactiveError when membership is removed', async () => {
    const {
      personId,
      sessionId,
      tenantId,
      membershipRepository,
      selectTenantHandler,
    } = await seedAuthenticatedSession();

    await new RemovePersonFromTenantHandler(
      membershipRepository,
      noopEventDispatcher,
    ).execute(
      new RemovePersonFromTenantCommand({
        personId,
        tenantId,
      }),
    );

    await assert.rejects(
      selectTenantHandler.execute(
        new SelectTenantCommand({
          sessionId,
          personId,
          tenantId,
        }),
      ),
      MembershipInactiveError,
    );
  });

  it('throws SessionNotFoundError when session does not exist', async () => {
    const { personId, tenantId } = await seedAuthenticatedSession();
    const handler = new SelectTenantHandler(
      new InMemorySessionRepository(),
      new InMemoryTenantRepository(),
      new InMemoryMembershipRepository(),
      noopEventDispatcher,
    );

    await assert.rejects(
      handler.execute(
        new SelectTenantCommand({
          sessionId: UNKNOWN_SESSION_ID,
          personId,
          tenantId,
        }),
      ),
      SessionNotFoundError,
    );
  });
});
