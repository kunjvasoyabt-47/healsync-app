/*
  Warnings:

  - The values [CANCELLED] on the enum `ApptStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActive` on the `Availability` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApptStatus_new" AS ENUM ('PENDING', 'APPROVED_UNPAID', 'PAID', 'REJECTED', 'COMPLETED');
ALTER TABLE "Appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "ApptStatus_new" USING ("status"::text::"ApptStatus_new");
ALTER TYPE "ApptStatus" RENAME TO "ApptStatus_old";
ALTER TYPE "ApptStatus_new" RENAME TO "ApptStatus";
DROP TYPE "ApptStatus_old";
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "isActive",
ADD COLUMN     "isBookable" BOOLEAN NOT NULL DEFAULT true;
