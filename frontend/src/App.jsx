import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

import ClientesPage from "./pages/clientes/ClientesPage";
import MotosPage from "./pages/motos/MotosPage";
import OrdenesPage from "./pages/ordenes/OrdenesPage";
import OrdenDetallePage from "./pages/ordenes/OrdenDetallePage";
import FacturacionPage from "./pages/facturacion/FacturacionPage";
import PortalPage from "./pages/portal/PortalPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/verificar" element={<VerifyEmailPage />} />

          {/* Portal del cliente: layout propio, no comparte el AppShell del taller */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute rolRequerido="CLIENTE">
                <PortalPage />
              </ProtectedRoute>
            }
          />

          {/* Rol TALLER */}
          <Route
            element={
              <ProtectedRoute rolRequerido="TALLER">
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/clientes" replace />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/motos" element={<MotosPage />} />
            <Route path="/ordenes" element={<OrdenesPage />} />
            <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
            <Route path="/facturacion" element={<FacturacionPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
