import { useEffect, useState, useCallback } from 'react';
import { Plus, UserCog, LoaderCircle, Power } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { Input, Select } from '../components/Campo';
import { useAuth } from '../context/AuthContext';
import { formatearFecha } from '../utils/formato';
import * as usuarioService from '../services/usuario.service';

const ROLES_STAFF = ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'];

const VARIANTE_ROL = {
  ADMINISTRADOR: 'ambar',
  RECEPCIONISTA: 'neutro',
  MECANICO: 'neutro',
  CLIENTE: 'neutro',
};

export default function Usuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cambiando, setCambiando] = useState(null);

  const cargar = useCallback(async () => {
    setError('');
    try {
      setUsuarios(await usuarioService.listarUsuarios());
    } catch {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function alternarActivo(u) {
    setCambiando(u.id);
    setError('');
    try {
      await usuarioService.cambiarActivo(u.id, !u.activo);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo cambiar el estado del usuario.');
    } finally {
      setCambiando(null);
    }
  }

  return (
    <Layout>
      <PageHeader
        titulo="Usuarios"
        descripcion="Cuentas del personal del taller y su rol en el sistema."
        accion={
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
        }
      />

      {cargando && <CargandoInline>Cargando usuarios...</CargandoInline>}
      <ErrorBanner>{error}</ErrorBanner>

      {!cargando && usuarios.length === 0 && !error && (
        <EmptyState icono={UserCog} titulo="No hay usuarios registrados" />
      )}

      {!cargando && usuarios.length > 0 && (
        <div className="relative bg-taller-850 border border-taller-700 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-taller-700 text-left">
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Nombre</th>
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Correo</th>
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Rol</th>
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3 text-taller-600 font-medium text-xs uppercase tracking-wide">Alta</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const esYo = u.id === usuarioActual?.id;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-taller-800 last:border-0 hover:bg-taller-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-taller-100 font-medium">
                      {u.nombre}
                      {esYo && <span className="text-taller-600 text-xs font-normal ml-2">(tú)</span>}
                    </td>
                    <td className="px-5 py-3.5 text-taller-200 font-mono text-xs">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variante={VARIANTE_ROL[u.rol] ?? 'neutro'}>{u.rol}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variante={u.activo ? 'verde' : 'rojo'}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-taller-600 text-xs font-mono">
                      {formatearFecha(u.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {/* Desactivarse a uno mismo dejaria la sesion sin cuenta:
                          el backend tambien lo rechaza, aqui solo se oculta. */}
                      {!esYo && (
                        <button
                          onClick={() => alternarActivo(u)}
                          disabled={cambiando === u.id}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 border transition-colors disabled:opacity-50 ${
                            u.activo
                              ? 'border-taller-700 text-taller-200 hover:border-red-800 hover:text-red-400'
                              : 'border-taller-700 text-taller-200 hover:border-ambar-400 hover:text-ambar-400'
                          }`}
                        >
                          {cambiando === u.id ? (
                            <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Power className="w-3.5 h-3.5" />
                          )}
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ModalNuevoUsuario
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCreado={() => {
          setModalAbierto(false);
          cargar();
        }}
      />
    </Layout>
  );
}

function ModalNuevoUsuario({ abierto, onCerrar, onCreado }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('MECANICO');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function manejarSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await usuarioService.crearUsuario({ nombre, email, password, rol });
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('MECANICO');
      onCreado();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear el usuario.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Nuevo usuario">
      <form onSubmit={manejarSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-xs">{error}</p>}

        <Input
          etiqueta="Nombre"
          required
          minLength={3}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Andrés Gómez"
        />
        <Input
          etiqueta="Correo"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mecanico@sigtm.com"
        />
        <Input
          etiqueta="Contraseña"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />
        <Select etiqueta="Rol" required value={rol} onChange={(e) => setRol(e.target.value)}>
          {ROLES_STAFF.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>

        <p className="text-taller-600 text-xs">
          Solo cuentas de personal. Los clientes se registran desde el módulo de clientes,
          junto con su perfil y sus motocicletas.
        </p>

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          {guardando && <LoaderCircle className="w-4 h-4 animate-spin" />}
          Crear usuario
        </button>
      </form>
    </Modal>
  );
}
