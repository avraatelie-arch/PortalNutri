-- CreateEnum
CREATE TYPE "BodyMassIndexClassification" AS ENUM (
    'UNDERWEIGHT',
    'NORMAL',
    'OVERWEIGHT',
    'OBESITY_CLASS_I',
    'OBESITY_CLASS_II',
    'OBESITY_CLASS_III',
    'PEDIATRIC_NOT_SUPPORTED',
    'UNCLASSIFIED'
);

-- CreateTable
CREATE TABLE "anthropometric_assessments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "anamnesis_id" TEXT NOT NULL,
    "clinical_encounter_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "nutritionist_id" TEXT NOT NULL,
    "source_request_id" TEXT,
    "weight_kg" DECIMAL(6,2) NOT NULL,
    "height_cm" DECIMAL(5,2) NOT NULL,
    "body_mass_index" DECIMAL(5,2) NOT NULL,
    "body_mass_index_classification" "BodyMassIndexClassification" NOT NULL,
    "waist_circumference_cm" DECIMAL(6,2),
    "hip_circumference_cm" DECIMAL(6,2),
    "abdominal_circumference_cm" DECIMAL(6,2),
    "neck_circumference_cm" DECIMAL(6,2),
    "arm_circumference_cm" DECIMAL(6,2),
    "calf_circumference_cm" DECIMAL(6,2),
    "waist_to_hip_ratio" DECIMAL(5,3),
    "notes" TEXT,
    "measured_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anthropometric_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anthropometric_assessments_tenant_id_source_request_id_key" ON "anthropometric_assessments"("tenant_id", "source_request_id");

-- CreateIndex
CREATE INDEX "anthropometric_assessments_tenant_id_idx" ON "anthropometric_assessments"("tenant_id");

-- CreateIndex
CREATE INDEX "anthropometric_assessments_anamnesis_id_idx" ON "anthropometric_assessments"("anamnesis_id");

-- CreateIndex
CREATE INDEX "anthropometric_assessments_patient_id_idx" ON "anthropometric_assessments"("patient_id");

-- CreateIndex
CREATE INDEX "anthropometric_assessments_clinical_encounter_id_idx" ON "anthropometric_assessments"("clinical_encounter_id");

-- CreateIndex
CREATE INDEX "anthropometric_assessments_nutritionist_id_idx" ON "anthropometric_assessments"("nutritionist_id");

-- CreateIndex
CREATE INDEX "anthropometric_assessments_tenant_id_anamnesis_id_idx" ON "anthropometric_assessments"("tenant_id", "anamnesis_id");

-- CreateIndex
CREATE INDEX "anthropometric_assessments_tenant_id_patient_id_measured_at_idx" ON "anthropometric_assessments"("tenant_id", "patient_id", "measured_at");

-- CreateIndex
CREATE INDEX "anthropometric_assessments_tenant_id_clinical_encounter_id_idx" ON "anthropometric_assessments"("tenant_id", "clinical_encounter_id");

-- AddForeignKey
ALTER TABLE "anthropometric_assessments" ADD CONSTRAINT "anthropometric_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthropometric_assessments" ADD CONSTRAINT "anthropometric_assessments_anamnesis_id_fkey" FOREIGN KEY ("anamnesis_id") REFERENCES "anamneses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthropometric_assessments" ADD CONSTRAINT "anthropometric_assessments_clinical_encounter_id_fkey" FOREIGN KEY ("clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthropometric_assessments" ADD CONSTRAINT "anthropometric_assessments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthropometric_assessments" ADD CONSTRAINT "anthropometric_assessments_nutritionist_id_fkey" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
