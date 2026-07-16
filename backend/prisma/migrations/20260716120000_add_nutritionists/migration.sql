-- CreateEnum
CREATE TYPE "NutritionistStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "nutritionists" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "crn" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL,
    "specialty" TEXT NOT NULL,
    "bio" TEXT,
    "status" "NutritionistStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutritionists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutritionists_person_id_idx" ON "nutritionists"("person_id");

-- CreateIndex
CREATE INDEX "nutritionists_tenant_id_idx" ON "nutritionists"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutritionists_tenant_id_crn_key" ON "nutritionists"("tenant_id", "crn");

-- AddForeignKey
ALTER TABLE "nutritionists" ADD CONSTRAINT "nutritionists_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutritionists" ADD CONSTRAINT "nutritionists_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
