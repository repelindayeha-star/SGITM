import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [correo] = useState(location.state?.correo || "");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await api.post("/auth/verify", { correo, codigo });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function reenviar() {
    setError(null);
    setInfo(null);
    try {
      await api.post(`/auth/verify/resend?correo=${encodeURIComponent(correo)}`);
      setInfo("Enviamos un nuevo código.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-box">
      <h2>Verificación de correo</h2>
      <p style={{ fontSize: 13, color: "var(--muted)" }}>
        Enviamos un código a <b style={{ color: "var(--text)" }}>{correo || "tu correo"}</b>
      </p>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Código de 6 dígitos</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength={6}
            style={{ letterSpacing: 6, fontSize: 18, textAlign: "center" }}
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        {info && <p style={{ color: "var(--ok)", fontSize: 12.5 }}>{info}</p>}
        <button className="btn primary" type="submit" disabled={cargando} style={{ width: "100%" }}>
          Verificar cuenta
        </button>
      </form>
      <button className="btn" onClick={reenviar} style={{ width: "100%", marginTop: 10 }}>
        Reenviar código
      </button>
    </div>
  );
}
