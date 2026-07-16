import type { NutritionistRepository } from '../../domain/repositories/nutritionist-repository.js';
import type { Nutritionist } from '../../domain/aggregates/nutritionist.aggregate.js';
import type { Crn } from '../../domain/value-objects/crn.js';
import type { NutritionistId } from '../../domain/value-objects/nutritionist-id.js';
import type { PersonId } from '../../../iam/domain/value-objects/person-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export class InMemoryNutritionistRepository implements NutritionistRepository {
  private readonly nutritionists = new Map<string, Nutritionist>();

  async save(nutritionist: Nutritionist): Promise<void> {
    this.nutritionists.set(nutritionist.getId().toString(), nutritionist);
  }

  async findById(id: NutritionistId): Promise<Nutritionist | null> {
    return this.nutritionists.get(id.toString()) ?? null;
  }

  async findByPersonAndTenant(
    personId: PersonId,
    tenantId: TenantId,
  ): Promise<Nutritionist | null> {
    for (const nutritionist of this.nutritionists.values()) {
      if (
        nutritionist.getPersonId().equals(personId) &&
        nutritionist.getTenantId().equals(tenantId)
      ) {
        return nutritionist;
      }
    }

    return null;
  }

  async existsByCrn(tenantId: TenantId, crn: Crn): Promise<boolean> {
    for (const nutritionist of this.nutritionists.values()) {
      if (
        nutritionist.getTenantId().equals(tenantId) &&
        nutritionist.getCrn().equals(crn)
      ) {
        return true;
      }
    }

    return false;
  }
}
