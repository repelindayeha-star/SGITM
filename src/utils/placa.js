// Placas de motocicleta en Colombia.
//
// El formato vigente es TRES LETRAS + DOS NUMEROS, con una letra final
// opcional: ABC12  o  ABC12D. Las placas de carro (tres letras y tres
// numeros) NO se aceptan a proposito: este sistema modela motocicletas, y
// admitir un formato de carro seria incoherente con el dominio.
//
// Antes la unica comprobacion era la longitud, entre 5 y 8 caracteres, asi
// que entraban valores como "AAAAA", "12345" o "XX-99-X".

const FORMATO_PLACA_MOTO = /^[A-Z]{3}\d{2}[A-Z]?$/;

/**
 * Deja la placa como se guarda: sin espacios ni guiones y en mayusculas.
 * La gente escribe "abc 12 d" o "ABC-12D" y las dos son la misma placa.
 */
function normalizarPlaca(valor) {
  return String(valor || '')
    .toUpperCase()
    .replace(/[\s-]/g, '');
}

function esPlacaMotoValida(valor) {
  return FORMATO_PLACA_MOTO.test(normalizarPlaca(valor));
}

const MENSAJE_PLACA =
  'La placa de una motocicleta debe ser tres letras y dos numeros, con una letra final opcional. Ejemplos: ABC12 o ABC12D.';

module.exports = { FORMATO_PLACA_MOTO, normalizarPlaca, esPlacaMotoValida, MENSAJE_PLACA };
