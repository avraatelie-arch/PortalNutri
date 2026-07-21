-- CreateEnum
CREATE TYPE "NutritionDiagnosisStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NutritionProblemCategory" AS ENUM (
    'ENERGY_BALANCE',
    'MACRONUTRIENT_INADEQUACY',
    'MICRONUTRIENT_DEFICIENCY',
    'GLYCEMIC_DYSREGULATION',
    'DYSPHAGIA',
    'SARCOPENIA_RISK',
    'DISORDERED_EATING_PATTERN',
    'GASTROINTESTINAL',
    'RENAL_NUTRITION',
    'CLINICAL_CONDITION_SUPPORT',
    'OTHER'
);

-- CreateTable
CREATE TABLE "nutrition_diagnoses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "created_by_nutritionist_id" TEXT NOT NULL,
    "responsible_nutritionist_id" TEXT NOT NULL,
    "origin_clinical_encounter_id" TEXT,
    "origin_anamnesis_id" TEXT,
    "problem_category" "NutritionProblemCategory" NOT NULL DEFAULT 'OTHER',
    "status" "NutritionDiagnosisStatus" NOT NULL DEFAULT 'DRAFT',
    "professional_interpretation" TEXT,
    "cancellation_reason" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutrition_diagnoses_tenant_id_idx" ON "nutrition_diagnoses"("tenant_id");

-- CreateIndex
CREATE INDEX "nutrition_diagnoses_tenant_id_patient_id_idx" ON "nutrition_diagnoses"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "nutrition_diagnoses_tenant_id_patient_id_status_idx" ON "nutrition_diagnoses"("tenant_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "nutrition_diagnoses_tenant_id_status_idx" ON "nutrition_diagnoses"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "nutrition_diagnoses_tenant_id_responsible_nutritionist_id_idx" ON "nutrition_diagnoses"("tenant_id", "responsible_nutritionist_id");

-- CreateIndex
CREATE INDEX "nutrition_diagnoses_tenant_id_responsible_nutritionist_id_s_idx" ON "nutrition_diagnoses"("tenant_id", "responsible_nutritionist_id", "status");

-- CreateIndex
CREATE INDEX "nutrition_diagnoses_tenant_id_origin_clinical_encounter_id_idx" ON "nutrition_diagnoses"("tenant_id", "origin_clinical_encounter_id");

-- AddForeignKey
ALTER TABLE "nutrition_diagnoses" ADD CONSTRAINT "nutrition_diagnoses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_diagnoses" ADD CONSTRAINT "nutrition_diagnoses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_diagnoses" ADD CONSTRAINT "nutrition_diagnoses_created_by_nutritionist_id_fkey" FOREIGN KEY ("created_by_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_diagnoses" ADD CONSTRAINT "nutrition_diagnoses_responsible_nutritionist_id_fkey" FOREIGN KEY ("responsible_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_diagnoses" ADD CONSTRAINT "nutrition_diagnoses_origin_clinical_encounter_id_fkey" FOREIGN KEY ("origin_clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_diagnoses" ADD CONSTRAINT "nutrition_diagnoses_origin_anamnesis_id_fkey" FOREIGN KEY ("origin_anamnesis_id") REFERENCES "anamneses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
