const clienteRepository = require('../repositories/cliente.repository');
const ordenRepository = require('../repositories/ordenTrabajo.repository');
const motocicletaRepository = require('../repositories/motocicleta.repository');
const citaRepository = require('../repositories/cita.repository');
const facturaRepository = require('../repositories/factura.repository');
const diagnosticoRepository = require('../repositories/diagnostico.repository');
const itemRepository = require('../repositories/itemCotizacion.repository');
const AppError = require('../utils/AppError');

// Personal del taller: accede a la informacion operativa completa.
//
// El MECANICO sigue aqui para lo que es propiedad DEL CLIENTE: ver una moto
// o una cita no depende de a quien se le asigno. Lo que si depende, las
// ordenes de trabajo, lo restringe `soloOrdenAsignadaSiMecanico`.
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

/**
 * Autorizacion horizontal entre mecanicos.
 *
 * Un mecanico solo trabaja las ordenes que le asignaron. Antes bastaba con
 * tener sesion de mecanico: cambiando el UUID de la URL se podia abrir la
 * orden de un companero, cambiarle el estado o subirle fotos, y el historial
 * quedaba firmado con el nombre equivocado.
 *
 * Administrador y recepcionista no se restringen: ellos coordinan el taller
 * y necesitan ver todo.
 *
 * `obtenerOrdenId` permite usarlo tanto donde la orden viene en la URL como
 * donde viene en el cuerpo de la peticion.
 */
function soloOrdenAsignadaSiMecanico(obtenerOrdenId = (req) => req.params.id) {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return next(new AppError('No autenticado.', 401));
      }

      if (req.usuario.rol !== 'MECANICO') {
        return next();
      }

      const ordenId = await obtenerOrdenId(req);
      const orden = ordenId ? await ordenRepository.buscarPorId(ordenId) : null;

      // Misma respuesta exista o no la orden: distinguir "no encontrada" de
      // "no es tuya" le confirmaria a quien prueba UUIDs cuales son reales.
      if (!orden || orden.mecanicoId !== req.usuario.id) {
        return next(new AppError('No tienes acceso a esta orden de trabajo.', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Para /ordenes/mecanico/:mecanicoId: un mecanico solo puede consultar SU
 * propia lista. Sin esto, cambiar el id en la URL mostraba la carga de
 * trabajo de un companero.
 */
function soloMiListaSiMecanico(req, res, next) {
  if (!req.usuario) {
    return next(new AppError('No autenticado.', 401));
  }
  if (req.usuario.rol === 'MECANICO' && req.params.mecanicoId !== req.usuario.id) {
    return next(new AppError('No tienes acceso a las ordenes de otro mecanico.', 403));
  }
  next();
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

// La factura no tiene cliente propio: hereda el de la orden que cobra.
const duenoDeFactura = async (req) => {
  const factura = await facturaRepository.buscarPorId(req.params.id);
  return factura?.orden?.clienteId;
};

// Para /facturas/orden/:ordenId, donde lo que llega es la orden, no la factura.
const duenoDeOrdenEnParametro = (nombre) => async (req) => {
  const orden = await ordenRepository.buscarPorId(req.params[nombre]);
  return orden?.clienteId;
};

// ── De un diagnostico o una linea de cotizacion a su orden ─────────────
// `soloOrdenAsignadaSiMecanico` pregunta por la orden. El diagnostico y sus
// items no la llevan en la URL, asi que hay que buscarla.

const ordenDeDiagnostico = (nombre) => async (req) => {
  const diagnostico = await diagnosticoRepository.buscarPorId(req.params[nombre]);
  return diagnostico?.ordenId;
};

const ordenDeDiagnosticoEnCuerpo = (campo) => async (req) => {
  const diagnostico = await diagnosticoRepository.buscarPorId(req.body[campo]);
  return diagnostico?.ordenId;
};

const ordenDeItemCotizacion = (nombre) => async (req) => {
  const item = await itemRepository.buscarPorId(req.params[nombre]);
  return item?.diagnostico?.ordenId;
};

module.exports = {
  soloPropioSiCliente,
  soloOrdenAsignadaSiMecanico,
  soloMiListaSiMecanico,
  clienteIdDeUsuario,
  duenoDesdeParametro,
  duenoDeOrden,
  duenoDeMotocicleta,
  duenoDeCita,
  duenoDeFactura,
  duenoDeOrdenEnParametro,
  ordenDeDiagnostico,
  ordenDeDiagnosticoEnCuerpo,
  ordenDeItemCotizacion,
};
