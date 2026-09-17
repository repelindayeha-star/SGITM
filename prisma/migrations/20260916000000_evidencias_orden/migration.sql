-- CreateEnum
CREATE TYPE "MomentoEvidencia" AS ENUM ('ANTES', 'DURANTE', 'DESPUES');

-- CreateTable
CREATE TABLE "evidencias_orden" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "urlMiniatura" TEXT,
    "identificadorPublico" TEXT,
    "momento" "MomentoEvidencia" NOT NULL DEFAULT 'DURANTE',
    "descripcion" TEXT,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_orden_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evidencias_orden_ordenId_createdAt_idx" ON "evidencias_orden"("ordenId", "createdAt");

-- AddForeignKey
ALTER TABLE "evidencias_orden" ADD CONSTRAINT "evidencias_orden_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenes_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_orden" ADD CONSTRAINT "evidencias_orden_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

