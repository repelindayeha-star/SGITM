import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

const ESTADO_CLASE = { ABIERTA: "abierta", EN_PROCESO: "proceso", CERRADA: "cerrada" };

/** Modulo "Órdenes de servicio / diagnóstico". */
export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [motos, setMotos] = useState([]);
  const [motoId, setMotoId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/ordenes").then(setOrdenes).catch((e) => setError(e.message));
    api.get("/motocicletas").then(setMotos).catch(() => {});
  }, []);

  async function crearOrden(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/ordenes", { motoId: Number(motoId) });
      const actualizadas = await api.get("/ordenes");
      setOrdenes(actualizadas);
      setMotoId("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Órdenes de servicio / diagnóstico</h1>
          <div className="sub">Una orden por moto, con mecánico, fecha, diagnóstico y estado</div>
        </div>
      </div>

      <div className="card">
        <h3>Nueva orden</h3>
        <form onSubmit={crearOrden} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label>Moto</label>
            <select value={motoId} onChange={(e) => setMotoId(e.target.value)} required>
              <option value="">Selecciona una moto</option>
              {motos.map((m) => (
                <option key={m.id} value={m.id}>{m.marca} {m.modelo} — {m.placa}</option>
              ))}
            </select>
          </div>
          <button className="btn primary" type="submit">Nueva orden</button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <h3>Órdenes</h3>
        <table>
          <thead>
            <tr><th>#</th><th>Moto</th><th>Fecha</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {ordenes.map((o) => (
              <tr key={o.id}>
                <td>OS-{String(o.id).padStart(4, "0")}</td>
                <td>{o.motoDescripcion} ({o.motoPlaca})</td>
                <td>{new Date(o.fecha).toLocaleDateString("es-CO")}</td>
                <td><span className={`pill ${ESTADO_CLASE[o.estado]}`}>{o.estado.replace("_", " ")}</span></td>
                <td><Link className="btn" to={`/ordenes/${o.id}`}>Ver detalle</Link></td>
              </tr>
            ))}
            {ordenes.length === 0 && (
              <tr><td colSpan={5} style={{ color: "var(--muted)" }}>Sin órdenes todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
