set -e
export FILTER_BRANCH_SQUELCH_WARNING=1

echo "=== Volviendo al respaldo (mensajes intactos) ==="
git checkout -q main
git reset --hard respaldo-antes-de-limpiar-coautores >/dev/null
echo "hecho"

echo ""
echo "=== Quitando SOLO las lineas de coautoria ==="
# Nada de awk esta vez: el filtro anterior colapsaba las lineas en blanco y
# se llevaba por delante la separacion entre el titulo y el cuerpo, que es
# justo lo que hace legible un mensaje de commit.
git filter-branch -f --msg-filter '
  sed -e "/^Co-Authored-By:.*[Cc]laude/d" \
      -e "/^Claude-Session:/d" \
      -e "/Generated with \[Claude Code\]/d" \
      -e "/^https:\/\/claude\.ai\/code\/session/d"
' -- main >/dev/null 2>&1
echo "hecho"

echo ""
echo "=== Queda alguna mencion? ==="
if git log --format="%H %s%n%b" | grep -iE "claude|co-authored|anthropic" ; then
  echo "TODAVIA HAY"
else
  echo "ninguna - limpio"
fi

echo ""
echo "=== Los mensajes conservan el formato? ==="
H=$(git log --reverse --format="%H" | sed -n "9p")
git log -1 --format="%B" "$H" | head -5 | cat -A | sed "s/\\$$//" | head -5

echo ""
echo "=== Autores ==="
git log --format="%an" | sort | uniq -c | sort -rn

echo ""
echo "=== El codigo cambio? (debe ser 0) ==="
git diff respaldo-antes-de-limpiar-coautores main --stat | wc -l