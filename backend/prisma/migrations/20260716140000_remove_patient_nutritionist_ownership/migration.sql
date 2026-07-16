-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_nutritionist_id_fkey";

-- DropIndex
DROP INDEX "patients_nutritionist_id_idx";

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "nutritionist_id";
