# Corre TODAS las pruebas del proyecto.
#
# Reinicia el servidor antes de empezar a proposito: la prueba de recuperacion
# termina agotando el freno de intentos (comprueba que el sistema corta con
# 429), asi que si se corre dos veces seguidas la segunda se encuentra el cupo
# gastado y falla sin que nada este roto. Reiniciar limpia esos contadores,
# que viven en la memoria del proceso.

$raiz = "C:\Users\Yessica Gomez\OneDrive\Desktop\PROYECTO_FINAL\SGITM-main"
Set-Location $raiz

Write-Output "Reiniciando el servidor para limpiar los frenos..."
Get-NetTCPConnection -State Listen -LocalPort 3001 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 3
Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run dev" -WorkingDirectory $raiz
Start-Sleep -Seconds 25

Write-Output ""
Write-Output "=== PRUEBAS DE UNIDAD (sin base de datos) ==="
npm test 2>&1 | Select-String -Pattern "^# (tests|pass|fail)"

Write-Output ""
Write-Output "=== PRUEBAS DE INTEGRACION (contra la base real) ==="
$total = 0
$fallos = 0
foreach ($s in @("recuperacion","avisoCambioEstado","reportes","evidencias","activacion","cloudinary")) {
  $o = node "pruebas\integracion\$s.js" 2>&1
  $v = ($o | Select-String -Pattern "^\s*OK").Count
  $f = ($o | Select-String -Pattern "FALLA|^ERROR|Error:").Count
  $total += $v
  $fallos += $f
  "{0,-20} verde={1,-4} rojo={2}" -f $s, $v, $f
  if ($f -gt 0) { $o | Select-String -Pattern "FALLA|^ERROR|Error:" | Select-Object -First 3 | ForEach-Object { "      $_" } }
}
Write-Output ""
Write-Output "TOTAL INTEGRACION: $total en verde, $fallos en rojo"