import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client";

export default function RegisterPage() {
  const [form, setForm] = useState({ correo: "", password: "", nombre: "", telefono: "", documento: "" });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const recaptchaToken = "pendiente-integracion-recaptcha";
      await api.post("/auth/register", { ...form, recaptchaToken });
      navigate("/verificar", { state: { correo: form.correo } });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-box">
      <h2>Crear cuenta</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Nombre completo</label>
          <input value={form.nombre} onChange={(e) => actualizar("nombre", e.target.value)} required />
        </div>
        <div className="field">
          <label>Correo electrónico</label>
          <input type="email" value={form.correo} onChange={(e) => actualizar("correo", e.target.value)} required />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" minLength={8} value={form.password} onChange={(e) => actualizar("password", e.target.value)} required />
        </div>
        <div className="field">
          <label>Teléfono (opcional)</label>
          <input value={form.telefono} onChange={(e) => actualizar("telefono", e.target.value)} />
        </div>
        <div className="field">
          <label>Documento (opcional)</label>
          <input value={form.documento} onChange={(e) => actualizar("documento", e.target.value)} />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn primary" type="submit" disabled={cargando} style={{ width: "100%" }}>
          {cargando ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 14 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
