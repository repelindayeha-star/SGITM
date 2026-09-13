-- CreateEnum
CREATE TYPE "TipoTokenSeguridad" AS ENUM ('RECUPERACION_PASSWORD', 'VERIFICACION_EMAIL');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordCambiadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "tokens_seguridad" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tipo" "TipoTokenSeguridad" NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_seguridad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_seguridad_tokenHash_key" ON "tokens_seguridad"("tokenHash");

-- CreateIndex
CREATE INDEX "tokens_seguridad_usuarioId_tipo_idx" ON "tokens_seguridad"("usuarioId", "tipo");

-- AddForeignKey
ALTER TABLE "tokens_seguridad" ADD CONSTRAINT "tokens_seguridad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

