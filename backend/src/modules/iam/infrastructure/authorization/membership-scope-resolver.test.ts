import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { Membership } from '../../domain/aggregates/membership.aggregate.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { createEmptyAuthorizationContext } from '../../application/authorization/authorization-context.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { InMemoryMembershipRepository } from '../repositories/in-memory-membership.repository.js';
import { MembershipScopeResolver } from './membership-scope-resolver.js';

describe('MembershipScopeResolver', () => {
  it('enriches resolved tenant ids when membership exists', async () => {
    const repository = new InMemoryMembershipRepository();
    const membership = Membership.create({
      personId: PersonId.create('550e8400-e29b-41d4-a716-446655440001'),
      tenantId: TenantId.create('550e8400-e29b-41d4-a716-446655440002'),
    });

    await repository.save(membership);

    const resolver = new MembershipScopeResolver(repository);
    const enriched = await resolver.enrich(
      createEmptyAuthorizationContext({
        personId: 'person-a',
        sessionId: 'session-a',
        tenantId: 'tenant-a',
        resource: AuthorizationResource.MEMBERSHIP,
        action: AuthorizationAction.READ,
        resourceId: membership.getId().toString(),
      }),
    );

    assert.deepEqual(
      [...enriched.resolvedTenantIds],
      ['550e8400-e29b-41d4-a716-446655440002'],
    );
    assert.equal(enriched.resolvedScopeRefCount, 1);
  });

  it('leaves resolved tenant ids empty when membership is unknown', async () => {
    const resolver = new MembershipScopeResolver(
      new InMemoryMembershipRepository(),
    );

    const enriched = await resolver.enrich(
      createEmptyAuthorizationContext({
        personId: 'person-a',
        sessionId: 'session-a',
        tenantId: 'tenant-a',
        resource: AuthorizationResource.MEMBERSHIP,
        action: AuthorizationAction.READ,
        resourceId: '550e8400-e29b-41d4-a716-446655440099',
      }),
    );

    assert.equal(enriched.resolvedTenantIds.size, 0);
    assert.equal(enriched.resolvedScopeRefCount, 0);
  });
});
