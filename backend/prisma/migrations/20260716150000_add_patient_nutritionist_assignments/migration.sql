-- CreateEnum
CREATE TYPE "PatientNutritionistAssignmentStatus" AS ENUM ('ACTIVE', 'REMOVED');
CREATE TYPE "PatientNutritionistAssignmentRole" AS ENUM ('PRIMARY', 'SUPPORTING');

-- CreateTable
CREATE TABLE "patient_nutritionist_assignments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "nutritionist_id" TEXT NOT NULL,
    "role" "PatientNutritionistAssignmentRole" NOT NULL,
    "status" "PatientNutritionistAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reactivated_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),

    CONSTRAINT "patient_nutritionist_assignments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_nutritionist_assignments" ADD CONSTRAINT "patient_nutritionist_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_nutritionist_assignments" ADD CONSTRAINT "patient_nutritionist_assignments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_nutritionist_assignments" ADD CONSTRAINT "patient_nutritionist_assignments_nutritionist_id_fkey" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "patient_nutritionist_assignments_patient_id_nutritionist_id_key" ON "patient_nutritionist_assignments"("patient_id", "nutritionist_id");

-- CreateIndex
CREATE INDEX "patient_nutritionist_assignments_tenant_id_idx" ON "patient_nutritionist_assignments"("tenant_id");

-- CreateIndex
CREATE INDEX "patient_nutritionist_assignments_patient_id_idx" ON "patient_nutritionist_assignments"("patient_id");

-- CreateIndex
CREATE INDEX "patient_nutritionist_assignments_nutritionist_id_idx" ON "patient_nutritionist_assignments"("nutritionist_id");

-- CreateIndex
CREATE INDEX "patient_nutritionist_assignments_patient_id_status_role_idx" ON "patient_nutritionist_assignments"("patient_id", "status", "role");

-- Partial unique index: one ACTIVE PRIMARY nutritionist per patient.
-- Intentionally maintained through raw SQL; Prisma schema syntax does not represent partial unique indexes.
CREATE UNIQUE INDEX "patient_one_active_primary_nutritionist_key"
ON "patient_nutritionist_assignments" ("patient_id")
WHERE "status" = 'ACTIVE' AND "role" = 'PRIMARY';
