-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DoseUnit" AS ENUM (
    'MG',
    'G',
    'MCG',
    'ML',
    'L',
    'IU',
    'UI',
    'CAPSULE',
    'TABLET',
    'SACHET',
    'SCOOP',
    'DROP',
    'APPLICATION',
    'UNIT',
    'OTHER'
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "created_by_nutritionist_id" TEXT NOT NULL,
    "responsible_nutritionist_id" TEXT NOT NULL,
    "origin_clinical_encounter_id" TEXT,
    "origin_anamnesis_id" TEXT,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL DEFAULT '',
    "clinical_notes" TEXT,
    "patient_instructions" TEXT,
    "cancellation_reason" TEXT,
    "issued_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_lines" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "dose_quantity" DECIMAL(18,4),
    "dose_unit" "DoseUnit",
    "dose_unit_custom_display" TEXT,
    "frequency_display_text" TEXT,
    "frequency_times_per_day" INTEGER,
    "frequency_interval_hours" INTEGER,
    "dosage_form" TEXT,
    "administration_route" TEXT,
    "active_ingredients" TEXT,
    "concentration" TEXT,
    "duration" TEXT,
    "administration_instructions" TEXT,
    "line_clinical_notes" TEXT,
    "patient_instructions" TEXT,

    CONSTRAINT "prescription_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_idx" ON "prescriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_patient_id_idx" ON "prescriptions"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_patient_id_status_idx" ON "prescriptions"("tenant_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_status_idx" ON "prescriptions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_responsible_nutritionist_id_idx" ON "prescriptions"("tenant_id", "responsible_nutritionist_id");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_responsible_nutritionist_id_s_idx" ON "prescriptions"("tenant_id", "responsible_nutritionist_id", "status");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_origin_clinical_encounter_id_idx" ON "prescriptions"("tenant_id", "origin_clinical_encounter_id");

-- CreateIndex
CREATE INDEX "prescription_lines_prescription_id_idx" ON "prescription_lines"("prescription_id");

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_created_by_nutritionist_id_fkey" FOREIGN KEY ("created_by_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_responsible_nutritionist_id_fkey" FOREIGN KEY ("responsible_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_origin_clinical_encounter_id_fkey" FOREIGN KEY ("origin_clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_origin_anamnesis_id_fkey" FOREIGN KEY ("origin_anamnesis_id") REFERENCES "anamneses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_lines" ADD CONSTRAINT "prescription_lines_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
