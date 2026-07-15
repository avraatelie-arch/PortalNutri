import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeUseCase } from '../execute-use-case.js';
import { MembershipInactiveError } from '../errors/membership-inactive.error.js';
import { MembershipNotFoundError } from '../errors/membership-not-found.error.js';
import { SessionNotFoundError } from '../errors/session-not-found.error.js';
import { TenantInactiveError } from '../errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { assertSessionCanValidateAccess } from '../session-guards.js';
import { SelectTenantCommand } from './select-tenant.command.js';
import { SelectTenantResponse } from './select-tenant.response.js';

export class SelectTenantHandler {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: SelectTenantCommand): Promise<SelectTenantResponse> {
    return executeUseCase(async () => {
      const sessionId = SessionId.create(command.request.sessionId);
      const personId = PersonId.create(command.request.personId);
      const tenantId = TenantId.create(command.request.tenantId);

      const session = await this.sessionRepository.findById(sessionId);

      if (!session) {
        throw new SessionNotFoundError(command.request.sessionId);
      }

      if (!session.getPersonId().equals(personId)) {
        throw new SessionNotFoundError(command.request.sessionId);
      }

      try {
        assertSessionCanValidateAccess(session);
      }
      catch (error) {
        await this.sessionRepository.save(session);
        throw error;
      }

      const tenant = await this.tenantRepository.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundError(command.request.tenantId);
      }

      if (!tenant.isActive()) {
        throw new TenantInactiveError(command.request.tenantId);
      }

      const membership = await this.membershipRepository.findByPersonAndTenant(
        personId,
        tenantId,
      );

      if (!membership) {
        throw new MembershipNotFoundError(
          undefined,
          command.request.personId,
          command.request.tenantId,
        );
      }

      if (!membership.isActive()) {
        throw new MembershipInactiveError(membership.getId().toString());
      }

      session.bindTenant(tenantId.toString());
      await this.sessionRepository.save(session);
      await this.eventDispatcher.dispatch(session.pullDomainEvents());

      return SelectTenantResponse.from(
        command.request.sessionId,
        command.request.tenantId,
      );
    });
  }
}
