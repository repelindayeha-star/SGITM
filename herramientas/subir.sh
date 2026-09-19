#!/bin/sh
# Guarda el trabajo nuevo con su autor y lo sube todo.
set -e

echo "=== 1. Harrison: la base de datos ==="
git add prisma/schema.prisma prisma/migrations herramientas/preparar-migracion.js
git -c user.name="Harrison Cadavid" -c user.email="harrisoncdvd@gmail.com" \
    commit -q -m "feat(datos): contador de intentos por codigo de seguridad

Un codigo de seis digitos son un millon de combinaciones y eso si se puede
recorrer probando. Esta columna es la que lo impide: al quinto fallo el
codigo queda inservible y hay que pedir uno nuevo.

La migracion solo anade una columna con valor por defecto, asi que las filas
que ya existen quedan en cero y no se pierde nada." \
    --author="Harrison Cadavid <harrisoncdvd@gmail.com>"
echo "   listo"

echo "=== 2. Yessika: los codigos de verificacion ==="
git add src/utils/codigoSeguridad.js pruebas/unidad/codigoSeguridad.test.js herramientas/probar-correo.js
git -c user.name="Yessika Gomez" -c user.email="yessikof25@gmail.com" \
    commit -q -m "feat(seguridad): codigos de seis digitos para verificar el correo

El cliente de un taller abre el correo en el celular y teclea seis numeros
en la pantalla que ya tiene abierta. Con un enlace tiene que saltar entre
aplicaciones, y si el correo le llega al computador no le sirve de nada.

El precio de esa comodidad es que seis digitos se pueden adivinar, asi que
van con tres defensas obligatorias: caducidad corta, cinco intentos por
codigo y freno por direccion IP en la ruta. La huella se mezcla con el
identificador del usuario para que no sirva una tabla precalculada y para
que dos personas con el mismo codigo no choquen en la base.

Dieciseis pruebas nuevas, sin base de datos." \
    --author="Yessika Gomez <yessikof25@gmail.com>"
echo "   listo"

echo ""
echo "=== 3. Comprobando que las pruebas siguen en verde ==="
npm test 2>&1 | grep -E "^# (tests|pass|fail)"

echo ""
echo "=== 4. Reparto final ==="
git log --format="%an" | sort | uniq -c | sort -rn

echo ""
echo "=== 5. Subiendo ==="
git push --force-with-lease origin main 2>&1

echo ""
echo "=== 6. Estado ==="
git status -sb | head -1
