import api from './api';

export async function listarRepuestos() {
  const { data } = await api.get('/inventario/repuestos');
  return data.data;
}

export async function obtenerRepuesto(id) {
  const { data } = await api.get(`/inventario/repuestos/${id}`);
  return data.data;
}

export async function listarStockBajo() {
  const { data } = await api.get('/inventario/repuestos/stock-bajo');
  return data.data;
}

export async function crearRepuesto({ nombre, codigo, stock, stockMinimo, precio }) {
  const { data } = await api.post('/inventario/repuestos', { nombre, codigo, stock, stockMinimo, precio });
  return data.data;
}

export async function actualizarRepuesto(id, datos) {
  const { data } = await api.put(`/inventario/repuestos/${id}`, datos);
  return data.data;
}

export async function eliminarRepuesto(id) {
  const { data } = await api.delete(`/inventario/repuestos/${id}`);
  return data;
}

export async function listarMovimientosPorRepuesto(id) {
  const { data } = await api.get(`/inventario/repuestos/${id}/movimientos`);
  return data.data;
}

export async function registrarMovimiento({ repuestoId, tipo, cantidad, motivo }) {
  const { data } = await api.post('/inventario/movimientos', { repuestoId, tipo, cantidad, motivo });
  return data.data;
}

export async function listarMovimientos() {
  const { data } = await api.get('/inventario/movimientos');
  return data.data;
}
