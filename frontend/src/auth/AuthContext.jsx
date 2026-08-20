import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

/**
 * Unica fuente de verdad de "quien esta logueado y con que rol" en el frontend.
 * Todas las paginas (Taller y Portal del cliente) leen de aqui -- nadie vuelve
 * a pedir /auth/me por su cuenta.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarSesion = useCallback(async () => {
    try {
      const data = await api.get("/auth/me");
      setUsuario(data);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarSesion();
  }, [cargarSesion]);

  const cerrarSesion = async () => {
    await api.post("/auth/logout");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, cargarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
