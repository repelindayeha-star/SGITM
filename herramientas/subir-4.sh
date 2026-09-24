set -e
git add src/config/env.js src/app.js package.json render.yaml herramientas/parche-despliegue.js herramientas/subir-3.sh
git -c user.name="Harrison Cadavid" -c user.email="harrisoncdvd@gmail.com" \
    commit -q -m "chore(despliegue): preparar el proyecto para la nube

El CORS aceptaba un solo origen. En produccion hay al menos dos, la direccion
que da Vercel y el dominio propio, asi que uno de los dos habria quedado fuera
y el navegador habria bloqueado todas las peticiones: la aplicacion pareceria
caida sin estarlo. Ahora FRONTEND_URL admite varios separados por coma y el
primero sigue siendo el que se usa para los enlaces de los correos.

Las peticiones sin origen (curl, las pruebas, los chequeos de salud del
alojamiento) pasan: no vienen de un navegador, asi que el CORS no las protege
de nada y bloquearlas solo romperia el monitoreo.

Ademas se fija la version de Node y prisma generate corre al instalar, que es
el fallo tipico de compila-en-local-revienta-en-produccion.

render.yaml no declara base de datos a proposito: seguimos con Neon, porque la
base gratuita de Render caduca a los 30 dias y borra los datos." \
    --author="Harrison Cadavid <harrisoncdvd@gmail.com>"
git push origin main 2>&1
echo ""
git log --format="%an" | sort | uniq -c | sort -rn