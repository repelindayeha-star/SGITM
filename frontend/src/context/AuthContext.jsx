import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Al cargar la app, revisamos si ya había una sesión guardada EN ESTA
    // PESTAÑA.
    //
    // Se usa sessionStorage y no localStorage a proposito. localStorage es
    // uno solo por navegador: con dos pestañas abiertas, entrar en una como
    // cliente sobrescribia el token de la otra, y la pestaña del mecanico
    // seguia mostrando su pantalla mientras sus peticiones ya viajaban con
    // la credencial del cliente. En un taller con un computador compartido
    // eso es justo lo que no puede pasar.
    //
    // sessionStorage es por pestaña: cada una lleva su propia sesion y al
    // cerrarla se cierra sola.
    const usuarioGuardado = sessionStorage.getItem('usuario');
    const token = sessionStorage.getItem('token');

    if (usuarioGuardado && token) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  async function iniciarSesion({ email, password, captchaToken }) {
    const { usuario, token } = await authService.login({ email, password, captchaToken });
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    setUsuario(usuario);
    return usuario;
  }

  function cerrarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    // Se limpia tambien la ubicacion anterior: si quedo una sesion guardada
    // por la version anterior de la aplicacion, seguiria viva en el
    // navegador y volveria a aparecer sola.
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  const valor = {
    usuario,
    cargando,
    estaAutenticado: !!usuario,
    iniciarSesion,
    cerrarSesion,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }
  return contexto;
}