import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import Badge from '../components/Badge';
import { formatearMoneda, formatearFecha } from '../utils/formato';
import * as facturaService from '../services/factura.service';

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    facturaService
      .listarFacturas()
      .then(setFacturas)
      .catch(() => setError('No se pudo cargar la lista de facturas.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        titulo="Facturacion"
        descripcion="Facturas generadas a partir de ordenes de trabajo completadas."
      />

      {cargando && <CargandoInline>Cargando facturas...</CargandoInline>}
      <ErrorBanner>{error}</ErrorBanner>

      {!cargando && !error && facturas.length === 0 && (
        <EmptyState
          icono={Receipt}
          titulo="Aun no hay facturas emitidas"
          descripcion="Las facturas se generan desde el detalle de una orden de trabajo en estado Lista o Entregada."
        />
      )}

      {!cargando && facturas.length > 0 && (
        <div className="relative bg-taller-850 border border-taller-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taller-700 text-left">
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Numero</th>
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Orden</th>
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Cliente</th>
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Metodo de pago</th>
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Fecha</th>
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-b border-taller-800 last:border-0 hover:bg-taller-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-taller-100 font-mono text-xs">{f.numero}</td>
                  <td className="px-5 py-3.5">
                    <Link to={`/ordenes/${f.orden?.id}`} className="text-ambar-400 hover:underline font-mono text-xs">
                      {f.orden?.codigo}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-taller-200">{f.orden?.cliente?.usuario?.nombre ?? '-'}</td>
                  <td className="px-5 py-3.5">
                    <Badge variante="neutro">{f.metodoPago}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-taller-400 text-xs">{formatearFecha(f.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right text-taller-100 font-semibold font-mono">
                    {formatearMoneda(f.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
