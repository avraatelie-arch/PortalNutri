-- CreateEnum
CREATE TYPE "AnamnesisStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- CreateTable
CREATE TABLE "anamneses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "clinical_encounter_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "nutritionist_id" TEXT NOT NULL,
    "status" "AnamnesisStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "chief_complaint" TEXT,
    "current_history" TEXT,
    "medical_history" TEXT,
    "family_history" TEXT,
    "gastrointestinal_history" TEXT,
    "dietary_history" TEXT,
    "lifestyle_history" TEXT,
    "medication_history" TEXT,
    "supplement_history" TEXT,
    "allergies_and_intolerances" TEXT,
    "observations" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anamneses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anamneses_clinical_encounter_id_key" ON "anamneses"("clinical_encounter_id");

-- CreateIndex
CREATE INDEX "anamneses_tenant_id_idx" ON "anamneses"("tenant_id");

-- CreateIndex
CREATE INDEX "anamneses_patient_id_idx" ON "anamneses"("patient_id");

-- CreateIndex
CREATE INDEX "anamneses_nutritionist_id_idx" ON "anamneses"("nutritionist_id");

-- CreateIndex
CREATE INDEX "anamneses_tenant_id_patient_id_idx" ON "anamneses"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "anamneses_tenant_id_nutritionist_id_idx" ON "anamneses"("tenant_id", "nutritionist_id");

-- CreateIndex
CREATE INDEX "anamneses_tenant_id_clinical_encounter_id_idx" ON "anamneses"("tenant_id", "clinical_encounter_id");

-- CreateIndex
CREATE INDEX "anamneses_status_idx" ON "anamneses"("status");

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_clinical_encounter_id_fkey" FOREIGN KEY ("clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_nutritionist_id_fkey" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
