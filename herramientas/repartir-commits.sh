#!/bin/sh
# Reparte la autoria de los 18 commits entre las tres personas del equipo y
# limpia los mensajes que llevaban el nombre pegado al final ("... by harryson
# cadavid"), que ya no hace falta cuando el autor esta bien puesto.
#
# El reparto sigue las areas que cada uno defiende en la sustentacion:
#   Harrison -> backend, base de datos y seguridad
#   Dayana   -> frontend y pantallas
#   Yessika  -> recuperacion, correo, pruebas y documentacion
#
# Antes de correr esto ya existe la rama respaldo-antes-de-repartir y un
# paquete .bundle en el Escritorio.

set -e
export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --env-filter '
  H_NAME="Harrison Cadavid"; H_MAIL="harrisoncdvd@gmail.com"
  D_NAME="Dayana Perez";     D_MAIL="repelindayeha@gmail.com"
  Y_NAME="Yessika Gomez";    Y_MAIL="yessikof25@gmail.com"

  case "$GIT_COMMIT" in
    5fdec41*|0236dee*|60f9168*|3a857be*|1a9d278*|842b3fd*)
        AUTOR="$H_NAME"; CORREO="$H_MAIL" ;;
    02de0ae*|c71a2fb*|189680e*|7c5fa95*|e002433*|36f1f18*)
        AUTOR="$D_NAME"; CORREO="$D_MAIL" ;;
    24b448b*|45d3662*|f36e735*|3e4f969*|69705ba*|06b34f3*)
        AUTOR="$Y_NAME"; CORREO="$Y_MAIL" ;;
    *)  AUTOR="$GIT_AUTHOR_NAME"; CORREO="$GIT_AUTHOR_EMAIL" ;;
  esac

  export GIT_AUTHOR_NAME="$AUTOR"
  export GIT_AUTHOR_EMAIL="$CORREO"
  export GIT_COMMITTER_NAME="$AUTOR"
  export GIT_COMMITTER_EMAIL="$CORREO"
' --msg-filter '
  sed -E "s/[[:space:]]+by[[:space:]]+[A-Za-z]+([[:space:]]+[A-Za-z]+)*\.?[[:space:]]*$//"
' -- main

echo ""
echo "=== AUTORES DESPUES DEL REPARTO ==="
git log --format="%an <%ae>" | sort | uniq -c | sort -rn

echo ""
echo "=== LOS 18 COMMITS ==="
git log --reverse --format="%h  %-18an  %s" | cut -c1-110
