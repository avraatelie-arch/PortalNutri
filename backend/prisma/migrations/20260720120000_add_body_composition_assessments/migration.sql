-- CreateEnum
CREATE TYPE "BodyCompositionMeasurementSource" AS ENUM (
    'MANUAL',
    'BIOIMPEDANCE',
    'DEXA',
    'SKINFOLD',
    'OTHER'
);

-- CreateTable
CREATE TABLE "body_composition_assessments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "anamnesis_id" TEXT NOT NULL,
    "clinical_encounter_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "nutritionist_id" TEXT NOT NULL,
    "anthropometric_assessment_id" TEXT,
    "source_request_id" TEXT,
    "body_fat_percentage" DECIMAL(5,2) NOT NULL,
    "lean_mass_kg" DECIMAL(6,2),
    "fat_mass_kg" DECIMAL(6,2),
    "muscle_mass_kg" DECIMAL(6,2),
    "bone_mass_kg" DECIMAL(6,2),
    "body_water_percentage" DECIMAL(5,2),
    "visceral_fat_level" DECIMAL(6,2),
    "basal_metabolic_rate" INTEGER,
    "metabolic_age" INTEGER,
    "notes" TEXT,
    "measurement_source" "BodyCompositionMeasurementSource" NOT NULL,
    "measured_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "body_composition_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "body_composition_assessments_tenant_id_source_request_id_key" ON "body_composition_assessments"("tenant_id", "source_request_id");

-- CreateIndex
CREATE INDEX "body_composition_assessments_tenant_id_idx" ON "body_composition_assessments"("tenant_id");

-- CreateIndex
CREATE INDEX "body_composition_assessments_anamnesis_id_idx" ON "body_composition_assessments"("anamnesis_id");

-- CreateIndex
CREATE INDEX "body_composition_assessments_patient_id_idx" ON "body_composition_assessments"("patient_id");

-- CreateIndex
CREATE INDEX "body_composition_assessments_clinical_encounter_id_idx" ON "body_composition_assessments"("clinical_encounter_id");

-- CreateIndex
CREATE INDEX "body_composition_assessments_nutritionist_id_idx" ON "body_composition_assessments"("nutritionist_id");

-- CreateIndex
CREATE INDEX "body_composition_assessments_anthropometric_assessment_id_idx" ON "body_composition_assessments"("anthropometric_assessment_id");

-- CreateIndex
CREATE INDEX "body_composition_assessments_tenant_id_anamnesis_id_idx" ON "body_composition_assessments"("tenant_id", "anamnesis_id");

-- CreateIndex
CREATE INDEX "body_composition_assessments_tenant_id_patient_id_measured_at_idx" ON "body_composition_assessments"("tenant_id", "patient_id", "measured_at");

-- CreateIndex
CREATE INDEX "body_composition_assessments_tenant_id_clinical_encounter_id_idx" ON "body_composition_assessments"("tenant_id", "clinical_encounter_id");

-- AddForeignKey
ALTER TABLE "body_composition_assessments" ADD CONSTRAINT "body_composition_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_composition_assessments" ADD CONSTRAINT "body_composition_assessments_anamnesis_id_fkey" FOREIGN KEY ("anamnesis_id") REFERENCES "anamneses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_composition_assessments" ADD CONSTRAINT "body_composition_assessments_clinical_encounter_id_fkey" FOREIGN KEY ("clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_composition_assessments" ADD CONSTRAINT "body_composition_assessments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_composition_assessments" ADD CONSTRAINT "body_composition_assessments_nutritionist_id_fkey" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_composition_assessments" ADD CONSTRAINT "body_composition_assessments_anthropometric_assessment_id_fkey" FOREIGN KEY ("anthropometric_assessment_id") REFERENCES "anthropometric_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
