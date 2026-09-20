set -e
echo "=== Harrison: el freno de los codigos ==="
git add src/routes/auth.routes.js herramientas/subir.sh herramientas/subir-2.sh
git -c user.name="Harrison Cadavid" -c user.email="harrisoncdvd@gmail.com" \
    commit -q -m "fix(seguridad): cada ruta de codigos con su propio contador

Las rutas nuevas reutilizaban el freno de los envios de correo, asi que pedir
un codigo de activacion gastaba el cupo de pedir un enlace de recuperacion y
dejaba a una persona bloqueada en mitad de su recorrido por culpa de otra. Es
exactamente lo que advierte el comentario que ya estaba en este archivo, y se
repitio. Ahora cada una lleva el suyo.

Lo encontro la prueba de integracion de recuperacion al quedarse sin token." \
    --author="Harrison Cadavid <harrisoncdvd@gmail.com>"
echo "   listo"

echo "=== Dayana: prueba de las fotos en la nube ==="
git add pruebas/integracion/cloudinary.js
git -c user.name="Dayana Perez" -c user.email="repelindayeha@gmail.com" \
    commit -q -m "test(evidencias): comprobar que las fotos llegan de verdad a la nube

Sin Cloudinary configurado el servicio guarda las fotos en el disco del
servidor, y en un alojamiento en la nube ese disco se borra en cada reinicio:
las fotos de las reparaciones desapareceriajn solas sin que nadie se entere.

La prueba sube una imagen real, comprueba que la direccion devuelta es de
Cloudinary y no del disco, que la imagen se puede descargar, que genera
miniatura, y despues la borra para no dejar basura en la cuenta." \
    --author="Dayana Perez <repelindayeha@gmail.com>"
echo "   listo"

echo "=== Yessika: lanzador de todas las pruebas ==="
git add herramientas/probar-todo.ps1
git -c user.name="Yessika Gomez" -c user.email="yessikof25@gmail.com" \
    commit -q -m "test: un solo lanzador para todas las pruebas

Reinicia el servidor antes de empezar, a proposito: la prueba de recuperacion
termina agotando el freno de intentos (comprueba que el sistema corta con 429),
asi que corrida dos veces seguidas la segunda falla sin que nada este roto.
Reiniciar limpia esos contadores, que viven en la memoria del proceso.

Deja 57 pruebas de unidad y 89 comprobaciones de integracion en una sola
orden." \
    --author="Yessika Gomez <yessikof25@gmail.com>"
echo "   listo"

echo ""
echo "=== Sin commitear ==="
git status --porcelain
echo ""
echo "=== Reparto ==="
git log --format="%an" | sort | uniq -c | sort -rn
echo ""
git push origin main 2>&1