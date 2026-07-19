-- CreateEnum
CREATE TYPE "ClinicalEncounterType" AS ENUM ('INITIAL', 'FOLLOW_UP', 'RETURN', 'EMERGENCY');
CREATE TYPE "ClinicalEncounterStatus" AS ENUM ('OPEN', 'FINISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "clinical_encounters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "nutritionist_id" TEXT NOT NULL,
    "type" "ClinicalEncounterType" NOT NULL,
    "status" "ClinicalEncounterStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_encounters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinical_encounters_appointment_id_key" ON "clinical_encounters"("appointment_id");

-- CreateIndex
CREATE INDEX "clinical_encounters_tenant_id_idx" ON "clinical_encounters"("tenant_id");

-- CreateIndex
CREATE INDEX "clinical_encounters_patient_id_idx" ON "clinical_encounters"("patient_id");

-- CreateIndex
CREATE INDEX "clinical_encounters_nutritionist_id_idx" ON "clinical_encounters"("nutritionist_id");

-- CreateIndex
CREATE INDEX "clinical_encounters_tenant_id_patient_id_idx" ON "clinical_encounters"("tenant_id", "patient_id");

-- AddForeignKey
ALTER TABLE "clinical_encounters" ADD CONSTRAINT "clinical_encounters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_encounters" ADD CONSTRAINT "clinical_encounters_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_encounters" ADD CONSTRAINT "clinical_encounters_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_encounters" ADD CONSTRAINT "clinical_encounters_nutritionist_id_fkey" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
