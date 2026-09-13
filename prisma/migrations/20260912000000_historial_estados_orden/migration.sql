-- CreateTable
CREATE TABLE "historial_estados_orden" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "estadoAnterior" "EstadoOrden",
    "estadoNuevo" "EstadoOrden" NOT NULL,
    "usuarioId" TEXT,
    "nota" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_orden_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_estados_orden_ordenId_createdAt_idx" ON "historial_estados_orden"("ordenId", "createdAt");

-- AddForeignKey
ALTER TABLE "historial_estados_orden" ADD CONSTRAINT "historial_estados_orden_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenes_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_orden" ADD CONSTRAINT "historial_estados_orden_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

