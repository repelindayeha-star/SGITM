-- Observaciones del mecanico sobre el trabajo.
--
-- Columna OPCIONAL a proposito: es aditiva, no toca ninguna fila existente
-- y no rompe a quien ya este corriendo la version anterior del codigo. Es la
-- unica forma segura de migrar una base compartida por el equipo.
ALTER TABLE "diagnosticos" ADD COLUMN "observaciones" TEXT;
