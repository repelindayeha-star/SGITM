import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { cargarSesion } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      // TODO: reemplazar por el token real del widget de reCAPTCHA cuando este integrado
      const recaptchaToken = "pendiente-integracion-recaptcha";
      await api.post("/auth/login", { correo, password, recaptchaToken });
      await cargarSesion();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function onGoogleLogin() {
    // TODO: integrar Google Identity Services y enviar el idToken real aqui
    setError("Login con Google: pendiente de integrar el botón oficial de Google.");
  }

  return (
    <div className="auth-box">
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Correo electrónico</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn primary" type="submit" disabled={cargando} style={{ width: "100%" }}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <button className="btn" onClick={onGoogleLogin} style={{ width: "100%", marginTop: 12 }}>
        Continuar con Google
      </button>
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 14 }}>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </div>
  );
}
