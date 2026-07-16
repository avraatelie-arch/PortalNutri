import type { Nutritionist } from '../aggregates/nutritionist.aggregate.js';
import type { Crn } from '../value-objects/crn.js';
import type { NutritionistId } from '../value-objects/nutritionist-id.js';
import type { PersonId } from '../../../iam/domain/value-objects/person-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export interface NutritionistRepository {
  save(nutritionist: Nutritionist): Promise<void>;
  findById(id: NutritionistId): Promise<Nutritionist | null>;
  findByPersonAndTenant(
    personId: PersonId,
    tenantId: TenantId,
  ): Promise<Nutritionist | null>;
  existsByCrn(tenantId: TenantId, crn: Crn): Promise<boolean>;
}
