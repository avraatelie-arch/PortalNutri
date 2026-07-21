-- CreateEnum
CREATE TYPE "ClinicalObjectiveStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClinicalObjectiveType" AS ENUM (
    'WEIGHT_LOSS',
    'WEIGHT_GAIN',
    'MUSCLE_GAIN',
    'BODY_FAT_REDUCTION',
    'GLYCEMIC_CONTROL',
    'LIPID_CONTROL',
    'BLOOD_PRESSURE_CONTROL',
    'GASTROINTESTINAL_SYMPTOM_CONTROL',
    'SPORTS_PERFORMANCE',
    'PREGNANCY_SUPPORT',
    'POSTPARTUM_RECOVERY',
    'EATING_BEHAVIOR',
    'NUTRITION_EDUCATION',
    'CLINICAL_CONDITION_SUPPORT',
    'OTHER'
);

-- CreateEnum
CREATE TYPE "ClinicalObjectivePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "clinical_objectives" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "created_by_nutritionist_id" TEXT NOT NULL,
    "responsible_nutritionist_id" TEXT NOT NULL,
    "origin_clinical_encounter_id" TEXT,
    "origin_anamnesis_id" TEXT,
    "type" "ClinicalObjectiveType" NOT NULL,
    "status" "ClinicalObjectiveStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "ClinicalObjectivePriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL DEFAULT '',
    "clinical_rationale" TEXT,
    "success_criteria" TEXT,
    "target_date" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clinical_objectives_tenant_id_idx" ON "clinical_objectives"("tenant_id");

-- CreateIndex
CREATE INDEX "clinical_objectives_tenant_id_patient_id_idx" ON "clinical_objectives"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "clinical_objectives_tenant_id_patient_id_status_idx" ON "clinical_objectives"("tenant_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "clinical_objectives_tenant_id_status_idx" ON "clinical_objectives"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "clinical_objectives_tenant_id_responsible_nutritionist_id_idx" ON "clinical_objectives"("tenant_id", "responsible_nutritionist_id");

-- CreateIndex
CREATE INDEX "clinical_objectives_tenant_id_responsible_nutritionist_id_s_idx" ON "clinical_objectives"("tenant_id", "responsible_nutritionist_id", "status");

-- CreateIndex
CREATE INDEX "clinical_objectives_tenant_id_origin_clinical_encounter_id_idx" ON "clinical_objectives"("tenant_id", "origin_clinical_encounter_id");

-- AddForeignKey
ALTER TABLE "clinical_objectives" ADD CONSTRAINT "clinical_objectives_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_objectives" ADD CONSTRAINT "clinical_objectives_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_objectives" ADD CONSTRAINT "clinical_objectives_created_by_nutritionist_id_fkey" FOREIGN KEY ("created_by_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_objectives" ADD CONSTRAINT "clinical_objectives_responsible_nutritionist_id_fkey" FOREIGN KEY ("responsible_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_objectives" ADD CONSTRAINT "clinical_objectives_origin_clinical_encounter_id_fkey" FOREIGN KEY ("origin_clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_objectives" ADD CONSTRAINT "clinical_objectives_origin_anamnesis_id_fkey" FOREIGN KEY ("origin_anamnesis_id") REFERENCES "anamneses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
