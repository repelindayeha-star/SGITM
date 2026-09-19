import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './routes/RutaProtegida';

import Login from './pages/Login';
import RecuperarPassword from './pages/RecuperarPassword';
import RestablecerPassword from './pages/RestablecerPassword';
import VerificarCorreo from './pages/VerificarCorreo';
import NoAutorizado from './pages/NoAutorizado';
import Dashboard from './pages/Dashboard';
import PortalCliente from './pages/PortalCliente';
import SeguimientoPublico from './pages/SeguimientoPublico';
import ActivarCuenta from './pages/ActivarCuenta';

import Clientes from './pages/Clientes';
import ClienteFormulario from './pages/ClienteFormulario';

import Motocicletas from './pages/Motocicletas';
import MotocicletaFormulario from './pages/MotocicletaFormulario';

import Citas from './pages/Citas';
import CitaFormulario from './pages/CitaFormulario';

import Ordenes from './pages/Ordenes';
import OrdenFormulario from './pages/OrdenFormulario';
import OrdenDetalle from './pages/OrdenDetalle';

import Inventario from './pages/Inventario';
import Facturas from './pages/Facturas';
import Usuarios from './pages/Usuarios';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Publicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          {/* Recuperacion de contrasena y confirmacion de correo.
              Son publicas por necesidad: quien llega aqui no puede entrar. */}
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="/restablecer-password" element={<RestablecerPassword />} />
          <Route path="/verificar-correo" element={<VerificarCorreo />} />

          {/* Seguimiento por codigo/QR: sin sesion, cualquiera con el codigo.
              Dos rutas para que funcione escrito a mano o escaneado. */}
          <Route path="/seguimiento" element={<SeguimientoPublico />} />
          <Route path="/activar" element={<ActivarCuenta modo="activar" />} />
          <Route path="/recuperar-codigo" element={<ActivarCuenta modo="recuperar" />} />
          <Route path="/seguimiento/:codigo" element={<SeguimientoPublico />} />

          {/* Panel administrativo: Administrador y Recepcionista */}
          <Route
            path="/dashboard"
            element={
              <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'RECEPCIONISTA']}>
                <Dashboard />
              </RutaProtegida>
            }
          />

          {/* Clientes: ver = Admin/Recepcionista/Mecanico, crear/editar = Admin/Recepcionista */}
          <Route
            path="/clientes"
            element={
              <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO']}>
                <Clientes />
              </RutaProtegida>
            }
          />
          <Route
            path="/clientes/nuevo"
            element={
              <RutaProtegida rolesPermitidos={['RECEPCIONISTA']}>
                <ClienteFormulario />
              </RutaProtegida>
            }
          />

          {/* Motocicletas: mismas reglas que Clientes */}
          <Route
            path="/motocicletas"
            element={
              <RutaProtegida rolesPermitidos={['RECEPCIONISTA', 'MECANICO']}>
                <Motocicletas />
              </RutaProtegida>
            }
          />
          <Route
            path="/motocicletas/nueva"
            element={
              <RutaProtegida rolesPermitidos={['RECEPCIONISTA']}>
                <MotocicletaFormulario />
              </RutaProtegida>
            }
          />

          {/* Citas: listar Admin/Recepcionista/Mecanico, crear Admin/Recepcionista */}
          <Route
            path="/citas"
            element={
              <RutaProtegida rolesPermitidos={['RECEPCIONISTA', 'MECANICO']}>
                <Citas />
              </RutaProtegida>
            }
          />
          <Route
            path="/citas/nueva"
            element={
              <RutaProtegida rolesPermitidos={['RECEPCIONISTA']}>
                <CitaFormulario />
              </RutaProtegida>
            }
          />

          {/* Ordenes de trabajo: el modulo mas grande, incluye al Mecanico */}
          <Route
            path="/ordenes"
            element={
              <RutaProtegida rolesPermitidos={['RECEPCIONISTA', 'MECANICO']}>
                <Ordenes />
              </RutaProtegida>
            }
          />
          <Route
            path="/ordenes/nueva"
            element={
              <RutaProtegida rolesPermitidos={['RECEPCIONISTA']}>
                <OrdenFormulario />
              </RutaProtegida>
            }
          />
          <Route
            path="/ordenes/:id"
            element={
              <RutaProtegida rolesPermitidos={['RECEPCIONISTA', 'MECANICO']}>
                <OrdenDetalle />
              </RutaProtegida>
            }
          />

          {/* Inventario: ver incluye Mecanico (para saber disponibilidad de repuestos) */}
          <Route
            path="/inventario"
            element={
              <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO']}>
                <Inventario />
              </RutaProtegida>
            }
          />

          {/* Facturacion: exclusivo de Administrador y Recepcionista */}
          <Route
            path="/facturas"
            element={
              <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'RECEPCIONISTA']}>
                <Facturas />
              </RutaProtegida>
            }
          />

          {/* Usuarios: gobierno del sistema, exclusivo del Administrador */}
          <Route
            path="/usuarios"
            element={
              <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
                <Usuarios />
              </RutaProtegida>
            }
          />

          {/* Portal simplificado para el rol Cliente */}
          <Route
            path="/mis-ordenes"
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <PortalCliente />
              </RutaProtegida>
            }
          />

          {/* Cualquier ruta desconocida cae al login (debe ir siempre al final) */}
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
