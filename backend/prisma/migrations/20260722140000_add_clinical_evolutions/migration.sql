-- CreateEnum
CREATE TYPE "ClinicalEvolutionStatus" AS ENUM ('DRAFT', 'FINALIZED', 'CANCELLED');

-- CreateTable
CREATE TABLE "clinical_evolutions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "clinical_encounter_id" TEXT NOT NULL,
    "created_by_nutritionist_id" TEXT NOT NULL,
    "responsible_nutritionist_id" TEXT NOT NULL,
    "status" "ClinicalEvolutionStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "clinical_moment_at" TIMESTAMP(3) NOT NULL,
    "subjective_evolution" TEXT,
    "professional_observations" TEXT,
    "treatment_response" TEXT,
    "adherence_and_barriers" TEXT,
    "adverse_events_notes" TEXT,
    "next_clinical_considerations" TEXT,
    "finalized_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_evolutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinical_evolutions_clinical_encounter_id_key" ON "clinical_evolutions"("clinical_encounter_id");

-- CreateIndex
CREATE INDEX "clinical_evolutions_tenant_id_idx" ON "clinical_evolutions"("tenant_id");

-- CreateIndex
CREATE INDEX "clinical_evolutions_tenant_id_patient_id_idx" ON "clinical_evolutions"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "clinical_evolutions_tenant_id_patient_id_status_idx" ON "clinical_evolutions"("tenant_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "clinical_evolutions_tenant_id_patient_id_clinical_moment_at_idx" ON "clinical_evolutions"("tenant_id", "patient_id", "clinical_moment_at");

-- AddForeignKey
ALTER TABLE "clinical_evolutions" ADD CONSTRAINT "clinical_evolutions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_evolutions" ADD CONSTRAINT "clinical_evolutions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_evolutions" ADD CONSTRAINT "clinical_evolutions_clinical_encounter_id_fkey" FOREIGN KEY ("clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_evolutions" ADD CONSTRAINT "clinical_evolutions_created_by_nutritionist_id_fkey" FOREIGN KEY ("created_by_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_evolutions" ADD CONSTRAINT "clinical_evolutions_responsible_nutritionist_id_fkey" FOREIGN KEY ("responsible_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
