import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { Membership } from '../../domain/aggregates/membership.aggregate.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { InMemoryMembershipRepository } from '../repositories/in-memory-membership.repository.js';
import { RepositoryMembershipScopeResolver } from './repository-membership-scope-resolver.js';

function createContext(
  overrides: Partial<AuthorizationContext> = {},
): AuthorizationContext {
  return {
    personId: 'person-a',
    sessionId: 'session-a',
    tenantId: 'tenant-a',
    resource: AuthorizationResource.MEMBERSHIP,
    action: AuthorizationAction.READ,
    resourceId: 'membership-a',
    scopeTenantId: null,
    resourceTenantId: null,
    ...overrides,
  };
}

describe('RepositoryMembershipScopeResolver', () => {
  it('enriches resourceTenantId when membership exists', async () => {
    const repository = new InMemoryMembershipRepository();
    const membership = Membership.create({
      personId: PersonId.create('550e8400-e29b-41d4-a716-446655440001'),
      tenantId: TenantId.create('550e8400-e29b-41d4-a716-446655440002'),
    });

    await repository.save(membership);

    const resolver = new RepositoryMembershipScopeResolver(repository);
    const enriched = await resolver.enrich(
      createContext({
        resourceId: membership.getId().toString(),
      }),
    );

    assert.equal(
      enriched.resourceTenantId,
      '550e8400-e29b-41d4-a716-446655440002',
    );
  });

  it('sets resourceTenantId to null when membership is unknown', async () => {
    const resolver = new RepositoryMembershipScopeResolver(
      new InMemoryMembershipRepository(),
    );

    const enriched = await resolver.enrich(
      createContext({
        resourceId: '550e8400-e29b-41d4-a716-446655440099',
      }),
    );

    assert.equal(enriched.resourceTenantId, null);
  });

  it('returns context unchanged for non-membership resources', async () => {
    const resolver = new RepositoryMembershipScopeResolver(
      new InMemoryMembershipRepository(),
    );
    const context = createContext({
      resource: AuthorizationResource.PERSON,
      action: AuthorizationAction.READ,
    });

    const enriched = await resolver.enrich(context);

    assert.deepEqual(enriched, context);
  });

  it('returns context unchanged for non-read actions', async () => {
    const resolver = new RepositoryMembershipScopeResolver(
      new InMemoryMembershipRepository(),
    );
    const context = createContext({
      action: AuthorizationAction.DELETE,
      resourceId: null,
      scopeTenantId: 'tenant-a',
    });

    const enriched = await resolver.enrich(context);

    assert.deepEqual(enriched, context);
  });
});
