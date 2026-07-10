-- CreateEnum
CREATE TYPE "PersonStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'RG', 'CNH', 'PASSPORT', 'OTHER');

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_person_id_fkey";

-- DropForeignKey
ALTER TABLE "associations" DROP CONSTRAINT "associations_person_id_fkey";

-- AlterTable
ALTER TABLE "persons" DROP COLUMN "password_hash";

ALTER TABLE "persons" RENAME COLUMN "name" TO "full_name";

ALTER TABLE "persons" ADD COLUMN "preferred_name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "document" TEXT NOT NULL,
ADD COLUMN "document_type" "DocumentType" NOT NULL,
ADD COLUMN "birth_date" DATE NOT NULL,
ADD COLUMN "status" "PersonStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "persons_document_type_document_key" ON "persons"("document_type", "document");
