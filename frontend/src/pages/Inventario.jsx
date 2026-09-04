import { useEffect, useState } from 'react';
import { Plus, Package, ArrowDownCircle, ArrowUpCircle, LoaderCircle, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import Modal from '../components/Modal';
import { Input } from '../components/Campo';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { puede } from '../utils/permisos';
import { formatearMoneda } from '../utils/formato';
import * as inventarioService from '../services/inventario.service';

export default function Inventario() {
  const { usuario } = useAuth();
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalCrear, setModalCrear] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState(null); // repuesto seleccionado

  const puedeCrear = puede(usuario, 'inventario', 'crear');
  const puedeMovimiento = puede(usuario, 'inventario', 'registrarMovimiento');

  function cargar() {
    setCargando(true);
    inventarioService
      .listarRepuestos()
      .then(setRepuestos)
      .catch(() => setError('No se pudo cargar el inventario.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <Layout>
      <PageHeader
        titulo="Inventario"
        descripcion="Repuestos disponibles y su nivel de stock."
        accion={
          puedeCrear && (
            <button
              onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo repuesto
            </button>
          )
        }
      />

      {cargando && <CargandoInline>Cargando inventario...</CargandoInline>}
      <ErrorBanner>{error}</ErrorBanner>

      {!cargando && !error && repuestos.length === 0 && (
        <EmptyState icono={Package} titulo="Aun no hay repuestos registrados" descripcion="Registra el primer repuesto del inventario." />
      )}

      {!cargando && repuestos.length > 0 && (
        <div className="relative bg-taller-850 border border-taller-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taller-700 text-left">
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Repuesto</th>
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Codigo</th>
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Precio</th>
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Stock</th>
                {puedeMovimiento && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody>
              {repuestos.map((r) => {
                const stockBajo = r.stock <= r.stockMinimo;
                return (
                  <tr key={r.id} className="border-b border-taller-800 last:border-0 hover:bg-taller-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-taller-100 font-medium">{r.nombre}</td>
                    <td className="px-5 py-3.5 text-taller-200 font-mono text-xs">{r.codigo}</td>
                    <td className="px-5 py-3.5 text-taller-200 font-mono text-xs">{formatearMoneda(r.precio)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variante={stockBajo ? 'rojo' : 'verde'}>
                        {stockBajo && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                        {r.stock} / min. {r.stockMinimo}
                      </Badge>
                    </td>
                    {puedeMovimiento && (
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setModalMovimiento(r)}
                          className="text-taller-600 hover:text-ambar-400 text-xs font-medium transition-colors"
                        >
                          Registrar movimiento
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ModalCrearRepuesto
        abierto={modalCrear}
        onCerrar={() => setModalCrear(false)}
        onCreado={() => {
          setModalCrear(false);
          cargar();
        }}
      />

      <ModalMovimiento
        repuesto={modalMovimiento}
        onCerrar={() => setModalMovimiento(null)}
        onRegistrado={() => {
          setModalMovimiento(null);
          cargar();
        }}
      />
    </Layout>
  );
}

function ModalCrearRepuesto({ abierto, onCerrar, onCreado }) {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [stock, setStock] = useState('0');
  const [stockMinimo, setStockMinimo] = useState('5');
  const [precio, setPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function manejarSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await inventarioService.crearRepuesto({
        nombre,
        codigo,
        stock: Number(stock),
        stockMinimo: Number(stockMinimo),
        precio: Number(precio),
      });
      setNombre('');
      setCodigo('');
      setStock('0');
      setStockMinimo('5');
      setPrecio('');
      onCreado();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear el repuesto.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Nuevo repuesto">
      <form onSubmit={manejarSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <Input etiqueta="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Pastillas de freno delanteras" />
        <Input etiqueta="Codigo" required value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="REP-001" />
        <div className="grid grid-cols-2 gap-3">
          <Input etiqueta="Stock inicial" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
          <Input etiqueta="Stock minimo" type="number" min={0} value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
        </div>
        <Input etiqueta="Precio (COP)" type="number" min={0} required value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="45000" />
        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          {guardando && <LoaderCircle className="w-4 h-4 animate-spin" />}
          Crear repuesto
        </button>
      </form>
    </Modal>
  );
}

function ModalMovimiento({ repuesto, onCerrar, onRegistrado }) {
  const [tipo, setTipo] = useState('ENTRADA');
  const [cantidad, setCantidad] = useState('1');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function manejarSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await inventarioService.registrarMovimiento({
        repuestoId: repuesto.id,
        tipo,
        cantidad: Number(cantidad),
        motivo,
      });
      setCantidad('1');
      setMotivo('');
      onRegistrado();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo registrar el movimiento.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto={!!repuesto} onCerrar={onCerrar} titulo={`Movimiento - ${repuesto?.nombre ?? ''}`} ancho="max-w-sm">
      <form onSubmit={manejarSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <p className="text-taller-600 text-xs">
          Stock actual: <span className="text-taller-200 font-mono">{repuesto?.stock}</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTipo('ENTRADA')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold border transition-colors ${
              tipo === 'ENTRADA'
                ? 'bg-green-900/30 border-green-700 text-green-400'
                : 'border-taller-700 text-taller-600 hover:bg-taller-800'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setTipo('SALIDA')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold border transition-colors ${
              tipo === 'SALIDA'
                ? 'bg-red-900/30 border-red-700 text-red-400'
                : 'border-taller-700 text-taller-600 hover:bg-taller-800'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            Salida
          </button>
        </div>
        <Input etiqueta="Cantidad" type="number" min={1} required value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
        <Input etiqueta="Motivo" required value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Usado en orden OT-2026-..." />
        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          {guardando && <LoaderCircle className="w-4 h-4 animate-spin" />}
          Registrar
        </button>
      </form>
    </Modal>
  );
}
