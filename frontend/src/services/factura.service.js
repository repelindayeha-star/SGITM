import api from './api';

export async function listarFacturas() {
  const { data } = await api.get('/facturas');
  return data.data;
}

export async function obtenerFactura(id) {
  const { data } = await api.get(`/facturas/${id}`);
  return data.data;
}

export async function obtenerPorOrden(ordenId) {
  const { data } = await api.get(`/facturas/orden/${ordenId}`);
  return data.data;
}

export async function crearFactura({ ordenId, metodoPago }) {
  const { data } = await api.post('/facturas', { ordenId, metodoPago });
  return data.data;
}

/**
 * Descarga el PDF de una factura.
 *
 * No se puede abrir la URL en una pestana nueva: el backend exige la cabecera
 * Authorization y el navegador no la manda sola. Por eso se pide el archivo
 * con axios (que si lleva el token), se recibe como blob y se dispara la
 * descarga con un enlace temporal que se destruye enseguida.
 */
export async function descargarFacturaPdf(id, numero) {
  const { data } = await api.get(`/reportes/facturas/${id}.pdf`, {
    responseType: 'blob',
  });

  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `factura-${numero || id}.pdf`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
