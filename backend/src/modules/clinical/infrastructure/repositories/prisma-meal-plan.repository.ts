import type { PrismaClient } from '@prisma/client';
import type { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import type { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import {
  MealPlanStatusValue,
  type MealPlanStatus,
} from '../../domain/value-objects/meal-plan-status.js';
import {
  toDomain,
  toMealsPersistence,
  toPersistence,
} from '../prisma/prisma-meal-plan.mapper.js';
import {
  getLatestMealPlanByEffectiveDate,
  sortMealPlansByEffectiveDate,
} from './meal-plan-sort.js';

export class PrismaMealPlanRepository implements MealPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(mealPlan: MealPlan): Promise<void> {
    const data = toPersistence(mealPlan);
    const meals = toMealsPersistence(mealPlan);

    await this.prisma.$transaction(async (tx) => {
      await tx.mealPlan.upsert({
        where: { id: data.id },
        create: data,
        update: {
          responsibleNutritionistId: data.responsibleNutritionistId,
          planType: data.planType,
          status: data.status,
          title: data.title,
          therapeuticStrategy: data.therapeuticStrategy,
          generalGuidelines: data.generalGuidelines,
          clinicalNotes: data.clinicalNotes,
          validFrom: data.validFrom,
          validUntil: data.validUntil,
          cancellationReason: data.cancellationReason,
          activatedAt: data.activatedAt,
          cancelledAt: data.cancelledAt,
          version: data.version,
          updatedAt: data.updatedAt,
        },
      });

      await tx.mealPlanMeal.deleteMany({
        where: { mealPlanId: data.id },
      });

      if (meals.length > 0) {
        await tx.mealPlanMeal.createMany({ data: meals });
      }
    });
  }

  async findByTenantAndId(
    tenantId: string,
    id: MealPlanId,
  ): Promise<MealPlan | null> {
    const record = await this.prisma.mealPlan.findFirst({
      where: {
        id: id.toString(),
        tenantId,
      },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return record ? toDomain(record) : null;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: MealPlanStatus[],
  ): Promise<MealPlan[]> {
    const records = await this.prisma.mealPlan.findMany({
      where: {
        tenantId,
        patientId,
        ...(statuses && statuses.length > 0 ? { status: { in: statuses } } : {}),
      },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sortMealPlansByEffectiveDate(records.map(toDomain));
  }

  async findActiveByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<MealPlan[]> {
    return this.findByPatient(tenantId, patientId, [
      MealPlanStatusValue.Active,
    ]);
  }

  async findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<MealPlan[]> {
    const records = await this.prisma.mealPlan.findMany({
      where: { tenantId, responsibleNutritionistId: nutritionistId },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sortMealPlansByEffectiveDate(records.map(toDomain));
  }

  async findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<MealPlan[]> {
    const records = await this.prisma.mealPlan.findMany({
      where: { tenantId, originClinicalEncounterId: clinicalEncounterId },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sortMealPlansByEffectiveDate(records.map(toDomain));
  }

  async findByStatus(
    tenantId: string,
    status: MealPlanStatus,
  ): Promise<MealPlan[]> {
    const records = await this.prisma.mealPlan.findMany({
      where: { tenantId, status },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sortMealPlansByEffectiveDate(records.map(toDomain));
  }

  async findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<MealPlan | null> {
    const records = await this.prisma.mealPlan.findMany({
      where: { tenantId, patientId },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return getLatestMealPlanByEffectiveDate(records.map(toDomain));
  }
}
