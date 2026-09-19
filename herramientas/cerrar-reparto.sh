#!/bin/sh
# 1) Arregla el unico mensaje que quedo fuera de estilo ("recuperacion de
#    contraseña", en minuscula y sin prefijo).
# 2) Agrega el trabajo nuevo que estaba sin commitear, repartido tambien.

set -e
export FILTER_BRANCH_SQUELCH_WARNING=1

echo "=== 1. Arreglando el mensaje suelto ==="
git filter-branch -f --msg-filter '
  M=$(cat)
  case "$M" in
    "recuperacion de contraseña"*)
      echo "feat(seguridad): primer flujo de recuperacion de contrasena" ;;
    *) printf "%s" "$M" ;;
  esac
' -- main >/dev/null 2>&1
echo "listo"

echo ""
echo "=== 2. Agregando el trabajo nuevo ==="

# Harrison: los guiones de herramientas (backend / automatizacion)
git add herramientas/capturar.js herramientas/capturar-portal.js \
        herramientas/diagnosticar-portal.js herramientas/revisar-clientes.js \
        herramientas/clave-demo-clientes.js herramientas/repartir-commits.sh \
        herramientas/cerrar-reparto.sh 2>/dev/null || true
git -c user.name="Harrison Cadavid" -c user.email="harrisoncdvd@gmail.com" \
    commit -m "chore(herramientas): guiones para capturar pantallas y revisar las cuentas de demostracion" \
    --author="Harrison Cadavid <harrisoncdvd@gmail.com>" >/dev/null
echo "  Harrison: herramientas"

# Dayana: las capturas reales de la aplicacion
git add presentacion/capturas
git -c user.name="Dayana Perez" -c user.email="repelindayeha@gmail.com" \
    commit -m "docs(presentacion): capturas reales de la aplicacion en funcionamiento" \
    --author="Dayana Perez <repelindayeha@gmail.com>" >/dev/null
echo "  Dayana: capturas"

# Yessika: los guiones de sustentacion y el banco de preguntas
git add presentacion
git -c user.name="Yessika Gomez" -c user.email="yessikof25@gmail.com" \
    commit -m "docs(sustentacion): guion, recorrido de la demostracion, banco de preguntas y lista de capturas" \
    --author="Yessika Gomez <yessikof25@gmail.com>" >/dev/null
echo "  Yessika: guiones de sustentacion"

echo ""
echo "=== REPARTO FINAL ==="
git log --format="%an" | sort | uniq -c | sort -rn
echo ""
git log --oneline -3
echo ""
echo "=== SIN COMMITEAR (deberia estar vacio) ==="
git status --porcelain
