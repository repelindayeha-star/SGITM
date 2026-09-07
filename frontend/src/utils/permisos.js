// Tabla central de permisos del frontend.
// Modelo de negocio: separacion de funciones real.
// - ADMINISTRADOR: supervision pura (dashboard + solo lectura de clientes,
//   inventario y facturacion). Nunca crea, edita, cambia estados ni elimina
//   nada operativo -- esa es tarea de Recepcionista/Mecanico.
// - RECEPCIONISTA: motor operativo del taller (clientes, motos, citas,
//   ordenes, inventario, facturacion).
// - MECANICO: taller fisico (sus ordenes asignadas, diagnostico/cotizacion,
//   lectura de contexto).
// - CLIENTE: portal externo, solo su propia informacion.
// Nada se elimina en este sistema: los registros se cancelan (cambio de
// estado) para conservar trazabilidad completa.
const PERMISOS = {
  clientes: {
    ver: ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'],
    crear: ['RECEPCIONISTA'],
    editar: ['RECEPCIONISTA'],
  },
  motocicletas: {
    ver: ['RECEPCIONISTA', 'MECANICO'],
    crear: ['RECEPCIONISTA'],
    editar: ['RECEPCIONISTA'],
  },
  citas: {
    ver: ['RECEPCIONISTA', 'MECANICO'],
    crear: ['RECEPCIONISTA'],
    cambiarEstado: ['RECEPCIONISTA'],
  },
  ordenes: {
    ver: ['RECEPCIONISTA', 'MECANICO'],
    crear: ['RECEPCIONISTA'],
    asignarMecanico: ['RECEPCIONISTA'],
    cambiarEstado: ['RECEPCIONISTA', 'MECANICO'],
  },
  diagnostico: {
    gestionar: ['MECANICO'],
  },
  inventario: {
    ver: ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'],
    crear: ['RECEPCIONISTA'],
    editar: ['RECEPCIONISTA'],
    registrarMovimiento: ['RECEPCIONISTA'],
  },
  facturas: {
    ver: ['ADMINISTRADOR', 'RECEPCIONISTA'],
    crear: ['RECEPCIONISTA'],
  },
  dashboard: {
    ver: ['ADMINISTRADOR', 'RECEPCIONISTA'],
  },
  // Gobierno del sistema, no operacion diaria: crear personal y mover roles
  // es del Administrador. La Recepcionista solo lista, porque necesita ver
  // los mecanicos para asignarlos a una orden.
  usuarios: {
    ver: ['ADMINISTRADOR'],
    listar: ['ADMINISTRADOR', 'RECEPCIONISTA'],
    crear: ['ADMINISTRADOR'],
    editar: ['ADMINISTRADOR'],
    activar: ['ADMINISTRADOR'],
  },
};

/**
 * Verifica si el rol del usuario autenticado puede realizar `accion` sobre `recurso`.
 */
export function puede(usuario, recurso, accion) {
  const rolesPermitidos = PERMISOS[recurso]?.[accion];
  if (!rolesPermitidos) return false;
  return rolesPermitidos.includes(usuario?.rol);
}

/**
 * Ruta de aterrizaje segun el rol tras el login.
 */
export function rutaInicioPorRol(rol) {
  if (rol === 'ADMINISTRADOR') return '/dashboard';
  if (rol === 'RECEPCIONISTA') return '/dashboard';
  if (rol === 'MECANICO') return '/ordenes';
  if (rol === 'CLIENTE') return '/mis-ordenes';
  return '/login';
}

export default PERMISOS;
