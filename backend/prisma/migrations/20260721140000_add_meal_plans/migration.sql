-- CreateEnum
CREATE TYPE "MealPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MealPlanType" AS ENUM (
    'INITIAL',
    'MAINTENANCE',
    'WEEKDAY',
    'WEEKEND',
    'TRAVEL',
    'PHASE',
    'OTHER'
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "created_by_nutritionist_id" TEXT NOT NULL,
    "responsible_nutritionist_id" TEXT NOT NULL,
    "origin_clinical_encounter_id" TEXT,
    "origin_anamnesis_id" TEXT,
    "plan_type" "MealPlanType",
    "status" "MealPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL DEFAULT '',
    "therapeutic_strategy" TEXT,
    "general_guidelines" TEXT,
    "clinical_notes" TEXT,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "activated_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan_meals" (
    "id" TEXT NOT NULL,
    "meal_plan_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "scheduled_time" TEXT,
    "content" TEXT,
    "substitution_notes" TEXT,

    CONSTRAINT "meal_plan_meals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_plans_tenant_id_idx" ON "meal_plans"("tenant_id");

-- CreateIndex
CREATE INDEX "meal_plans_tenant_id_patient_id_idx" ON "meal_plans"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "meal_plans_tenant_id_patient_id_status_idx" ON "meal_plans"("tenant_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "meal_plans_tenant_id_status_idx" ON "meal_plans"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "meal_plans_tenant_id_responsible_nutritionist_id_idx" ON "meal_plans"("tenant_id", "responsible_nutritionist_id");

-- CreateIndex
CREATE INDEX "meal_plans_tenant_id_responsible_nutritionist_id_s_idx" ON "meal_plans"("tenant_id", "responsible_nutritionist_id", "status");

-- CreateIndex
CREATE INDEX "meal_plans_tenant_id_origin_clinical_encounter_id_idx" ON "meal_plans"("tenant_id", "origin_clinical_encounter_id");

-- CreateIndex
CREATE INDEX "meal_plan_meals_meal_plan_id_idx" ON "meal_plan_meals"("meal_plan_id");

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_created_by_nutritionist_id_fkey" FOREIGN KEY ("created_by_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_responsible_nutritionist_id_fkey" FOREIGN KEY ("responsible_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_origin_clinical_encounter_id_fkey" FOREIGN KEY ("origin_clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_origin_anamnesis_id_fkey" FOREIGN KEY ("origin_anamnesis_id") REFERENCES "anamneses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_meals" ADD CONSTRAINT "meal_plan_meals_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
