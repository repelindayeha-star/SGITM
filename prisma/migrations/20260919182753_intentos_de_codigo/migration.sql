-- Contador de intentos fallidos por codigo de seguridad.
--
-- Un codigo de seis digitos se puede adivinar probando. Este contador es
-- lo que hace que no se pueda: al quinto fallo el codigo queda inservible
-- y hay que pedir uno nuevo.
--
-- Solo anade una columna con valor por defecto, asi que las filas que ya
-- existen quedan en 0 y nada se pierde.
ALTER TABLE "tokens_seguridad" ADD COLUMN "intentos" INTEGER NOT NULL DEFAULT 0;
