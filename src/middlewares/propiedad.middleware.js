const clienteRepository = require('../repositories/cliente.repository');
const ordenRepository = require('../repositories/ordenTrabajo.repository');
const motocicletaRepository = require('../repositories/motocicleta.repository');
const citaRepository = require('../repositories/cita.repository');
const AppError = require('../utils/AppError');

// Personal del taller: accede a la informacion operativa completa.
//
// (Afinar el alcance del MECANICO a "solo las ordenes que tiene asignadas"
//  queda para la fase de coherencia de permisos. Hoy la interfaz le muestra
//  todas las ordenes, asi que restringirlo aqui romperia la pantalla.)
const ROLES_STAFF = ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'];

// Valor imposible de igualar por accidente: un CLIENTE sin perfil creado
// no debe coincidir con el dueno de ningun recurso.
const SIN_PERFIL = Symbol('sin-perfil');

async function clienteIdDeUsuario(usuario) {
  const perfil = await clienteRepository.buscarPorUsuarioId(usuario.id);
  return perfil ? perfil.id : SIN_PERFIL;
}

/**
 * Autorizacion horizontal.
 *
 * Deja pasar al personal del taller; si quien pide es un CLIENTE, exige que
 * el recurso sea suyo.
 *
 * Antes estas rutas solo comprobaban que existiera una sesion valida: con
 * cambiar el UUID de la URL, cualquier cliente autenticado podia leer las
 * ordenes, el telefono, la direccion o la factura de otro cliente.
 *
 * Se usa DESPUES de `autenticar`:
 *    router.get('/:id', soloPropioSiCliente(duenoDeOrden), controlador)
 */
function soloPropioSiCliente(resolverDuenoId) {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return next(new AppError('No autenticado.', 401));
      }

      if (ROLES_STAFF.includes(req.usuario.rol)) {
        return next();
      }

      const miClienteId = await clienteIdDeUsuario(req.usuario);
      const duenoId = await resolverDuenoId(req);

      if (miClienteId === SIN_PERFIL || !duenoId || duenoId !== miClienteId) {
        // Mismo mensaje exista o no el recurso: responder "no encontrado"
        // frente a "sin permiso" le confirmaria al atacante que ese UUID
        // corresponde a un registro real.
        return next(new AppError('No tienes acceso a este recurso.', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ── Resolutores ────────────────────────────────────────────────────────
// Cada uno responde una sola pregunta: ¿de que cliente es este recurso?

// Para rutas del tipo /cliente/:clienteId, donde el dueno es el parametro.
const duenoDesdeParametro = (nombre) => (req) => req.params[nombre];

const duenoDeOrden = async (req) => {
  const orden = await ordenRepository.buscarPorId(req.params.id);
  return orden?.clienteId;
};

const duenoDeMotocicleta = async (req) => {
  const moto = await motocicletaRepository.buscarPorId(req.params.id);
  return moto?.clienteId;
};

const duenoDeCita = async (req) => {
  const cita = await citaRepository.buscarPorId(req.params.id);
  return cita?.clienteId;
};

module.exports = {
  soloPropioSiCliente,
  clienteIdDeUsuario,
  duenoDesdeParametro,
  duenoDeOrden,
  duenoDeMotocicleta,
  duenoDeCita,
};
