import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import * as facturaService from '../services/factura.service';

/**
 * Boton de descarga del PDF de una factura.
 *
 * Vive en un componente propio porque el mismo boton aparece en tres sitios:
 * la lista de Facturacion, el detalle de la orden y el portal del cliente.
 * Quien puede pulsarlo lo decide cada pantalla; el backend lo vuelve a
 * comprobar por su cuenta.
 */
export default function BotonFacturaPdf({ facturaId, numero, compacto = false }) {
  const [bajando, setBajando] = useState(false);
  const [error, setError] = useState('');

  async function manejarDescarga() {
    setBajando(true);
    setError('');
    try {
      await facturaService.descargarFacturaPdf(facturaId, numero);
    } catch {
      setError('No se pudo generar el PDF.');
    } finally {
      setBajando(false);
    }
  }

  const Icono = bajando ? LoaderCircle : Download;
  const clases = compacto
    ? 'inline-flex items-center gap-1.5 text-ambar-400 hover:text-ambar-300 disabled:opacity-50 text-xs font-medium transition-colors'
    : 'inline-flex items-center gap-2 border border-taller-600 hover:border-ambar-400 hover:text-ambar-400 disabled:opacity-50 text-taller-200 text-sm font-medium rounded-md px-3.5 py-2 transition-colors';

  return (
    <div className={compacto ? 'inline-block' : ''}>
      <button
        type="button"
        onClick={manejarDescarga}
        disabled={bajando}
        title={`Descargar la factura ${numero || ''} en PDF`}
        className={clases}
      >
        <Icono className={`w-4 h-4 ${bajando ? 'animate-spin' : ''}`} />
        {compacto ? 'PDF' : bajando ? 'Generando...' : 'Descargar PDF'}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
