-- CreateEnum
CREATE TYPE "OutcomeTrackingStatus" AS ENUM ('DRAFT', 'RECORDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OutcomeAssessment" AS ENUM ('ON_TRACK', 'PARTIAL', 'STABLE', 'STALLED', 'REGRESSED', 'GOAL_ACHIEVED', 'NOT_EVALUABLE');

-- CreateEnum
CREATE TYPE "AdherenceFactor" AS ENUM ('FULL', 'PARTIAL', 'LOW', 'UNKNOWN');

-- CreateTable
CREATE TABLE "outcome_trackings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "clinical_objective_id" TEXT NOT NULL,
    "created_by_nutritionist_id" TEXT NOT NULL,
    "responsible_nutritionist_id" TEXT NOT NULL,
    "origin_clinical_encounter_id" TEXT,
    "origin_anamnesis_id" TEXT,
    "status" "OutcomeTrackingStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "clinical_moment_at" TIMESTAMP(3),
    "outcome_assessment" "OutcomeAssessment",
    "adherence_factor" "AdherenceFactor",
    "professional_rationale" TEXT,
    "clinical_notes" TEXT,
    "evaluated_at" TIMESTAMP(3),
    "recorded_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outcome_trackings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outcome_trackings_tenant_id_idx" ON "outcome_trackings"("tenant_id");

-- CreateIndex
CREATE INDEX "outcome_trackings_tenant_id_patient_id_idx" ON "outcome_trackings"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "outcome_trackings_tenant_id_patient_id_status_idx" ON "outcome_trackings"("tenant_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "outcome_trackings_tenant_id_clinical_objective_id_idx" ON "outcome_trackings"("tenant_id", "clinical_objective_id");

-- CreateIndex
CREATE INDEX "outcome_trackings_tenant_id_clinical_objective_id_status_idx" ON "outcome_trackings"("tenant_id", "clinical_objective_id", "status");

-- CreateIndex
CREATE INDEX "outcome_trackings_tenant_id_clinical_objective_id_evaluated_at_idx" ON "outcome_trackings"("tenant_id", "clinical_objective_id", "evaluated_at");

-- AddForeignKey
ALTER TABLE "outcome_trackings" ADD CONSTRAINT "outcome_trackings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_trackings" ADD CONSTRAINT "outcome_trackings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_trackings" ADD CONSTRAINT "outcome_trackings_clinical_objective_id_fkey" FOREIGN KEY ("clinical_objective_id") REFERENCES "clinical_objectives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_trackings" ADD CONSTRAINT "outcome_trackings_created_by_nutritionist_id_fkey" FOREIGN KEY ("created_by_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_trackings" ADD CONSTRAINT "outcome_trackings_responsible_nutritionist_id_fkey" FOREIGN KEY ("responsible_nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_trackings" ADD CONSTRAINT "outcome_trackings_origin_clinical_encounter_id_fkey" FOREIGN KEY ("origin_clinical_encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_trackings" ADD CONSTRAINT "outcome_trackings_origin_anamnesis_id_fkey" FOREIGN KEY ("origin_anamnesis_id") REFERENCES "anamneses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
