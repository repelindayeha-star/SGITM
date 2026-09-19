#!/bin/sh
# Guarda el modulo de activacion repartido entre los tres y lo sube.
set -e

echo "=== 1. Harrison: rutas, validadores, controladores y repositorio ==="
git add src/routes/auth.routes.js src/validators/auth.validator.js \
        src/controllers/auth.controller.js src/controllers/cliente.controller.js \
        src/validators/cliente.validator.js src/repositories/tokenSeguridad.repository.js \
        herramientas/parche-1.js herramientas/parche-2.js herramientas/parche-3.js \
        herramientas/capturar-nuevas.js
git -c user.name="Harrison Cadavid" -c user.email="harrisoncdvd@gmail.com" \
    commit -q -m "feat(seguridad): el alta de clientes deja de pasar por el registro publico

La recepcionista creaba clientes llamando al endpoint publico de registro, y
eso traia tres problemas: tenia que INVENTAR la contrasena del cliente (y por
tanto conocerla), tenia que resolver un captcha estando ya autenticada, y el
freno de cinco registros cada quince minutos habria bloqueado al taller en una
manana normal de trabajo.

Ahora POST /api/clientes crea la cuenta y el perfil juntos, sin contrasena
utilizable, y manda un codigo al correo del cliente. Cuatro rutas nuevas para
pedir y confirmar codigos, cada una con el freno que le corresponde: estrecho
para lo que envia correos, holgado para lo que solo comprueba.

Ademas, UNA sola regla de contrasena para todo el sistema. Antes el registro
pedia ocho caracteres y el restablecimiento pedia ocho mas letra y numero: se
podia crear una cuenta con una contrasena que el propio sistema no dejaba
volver a poner." \
    --author="Harrison Cadavid <harrisoncdvd@gmail.com>"
echo "   listo"

echo "=== 2. Yessika: servicio, correos y prueba de integracion ==="
git add src/services/activacion.service.js src/plantillas/correo.js \
        pruebas/integracion/activacion.js presentacion/GUION_DEMO.md
git -c user.name="Yessika Gomez" -c user.email="yessikof25@gmail.com" \
    commit -q -m "feat(correo): codigos de seis digitos y verificacion real del correo

El campo emailVerificado se ponia en true y nada lo comprobaba nunca: era
decorativo. Ahora poner la contrasena con un codigo que solo llego a ese buzon
ES la prueba de que el buzon es suyo, asi que el campo significa algo.

Los correos llevan el codigo en grande y un boton a la pantalla. El boton NO
lleva ningun secreto dentro, a diferencia del enlace anterior: los antivirus y
los clientes de correo pre-cargan los enlaces y gastaban el token antes de que
la persona hiciera clic.

Veintitres comprobaciones de integracion contra la base real: que el codigo no
se guarda (solo su huella), que dos codigos seguidos son distintos, que a los
cinco fallos muere, que un correo inexistente responde igual que uno real, que
el codigo usado no vale dos veces, y que al activar mueren los pendientes." \
    --author="Yessika Gomez <yessikof25@gmail.com>"
echo "   listo"

echo "=== 3. Dayana: las pantallas ==="
git add frontend/ presentacion/capturas
git -c user.name="Dayana Perez" -c user.email="repelindayeha@gmail.com" \
    commit -q -m "feat(cliente): pantalla de activacion y formulario sin contrasena

El formulario de nuevo cliente pedia una contrasena temporal que escribia la
recepcionista. Ese campo desaparece y en su lugar queda un aviso explicando
que el cliente elige la suya.

Pantalla nueva de activacion, que sirve igual para activar y para recuperar:
pedir el codigo, teclearlo y elegir contrasena. El codigo se escribe a mano,
con las dos contrasenas comprobadas en la pantalla antes de enviarlas, para
que equivocarse tecleando no gaste uno de los cinco intentos del codigo.

Al pedir el codigo la pantalla nunca dice 'te enviamos un correo' sino 'si ese
correo corresponde a una cuenta': el servidor responde igual exista o no, y la
pantalla no puede contradecirlo sin delatar quien esta registrado." \
    --author="Dayana Perez <repelindayeha@gmail.com>"
echo "   listo"

echo ""
echo "=== Sin commitear (deberia estar vacio) ==="
git status --porcelain

echo ""
echo "=== Reparto ==="
git log --format="%an" | sort | uniq -c | sort -rn

echo ""
echo "=== Subiendo ==="
git push origin main 2>&1
