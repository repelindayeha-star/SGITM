-- Consumo de inventario por orden de trabajo.
-- Aditiva: dos columnas opcionales, nada se borra ni se reescribe.

-- Marca de que esta linea de cotizacion ya salio del almacen.
ALTER TABLE "items_cotizacion" ADD COLUMN "descontadoEn" TIMESTAMP(3);

-- Orden que consumio el repuesto (null en compras y salidas sueltas).
ALTER TABLE "movimientos_inventario" ADD COLUMN "ordenId" TEXT;

CREATE INDEX "movimientos_inventario_ordenId_idx" ON "movimientos_inventario"("ordenId");

ALTER TABLE "movimientos_inventario"
  ADD CONSTRAINT "movimientos_inventario_ordenId_fkey"
  FOREIGN KEY ("ordenId") REFERENCES "ordenes_trabajo"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
