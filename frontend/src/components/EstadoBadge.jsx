import Badge from './Badge';

// Mapeo de estado -> (etiqueta legible, color semantico) reutilizado
// en Ordenes de trabajo y Citas para que el color siempre comunique lo mismo.
const CONFIG_ESTADO = {
  RECIBIDA: { etiqueta: 'Recibida', variante: 'neutro' },
  EN_DIAGNOSTICO: { etiqueta: 'En diagnostico', variante: 'ambar' },
  EN_COTIZACION: { etiqueta: 'En cotizacion', variante: 'ambar' },
  APROBADA: { etiqueta: 'Aprobada', variante: 'ambar' },
  EN_REPARACION: { etiqueta: 'En reparacion', variante: 'ambar' },
  LISTA: { etiqueta: 'Lista', variante: 'verde' },
  ENTREGADA: { etiqueta: 'Entregada', variante: 'verde' },
  CANCELADA: { etiqueta: 'Cancelada', variante: 'rojo' },
  PROGRAMADA: { etiqueta: 'Programada', variante: 'neutro' },
  CONFIRMADA: { etiqueta: 'Confirmada', variante: 'ambar' },
  COMPLETADA: { etiqueta: 'Completada', variante: 'verde' },
};

export default function EstadoBadge({ estado }) {
  const config = CONFIG_ESTADO[estado] || { etiqueta: estado, variante: 'neutro' };
  return <Badge variante={config.variante}>{config.etiqueta}</Badge>;
}
