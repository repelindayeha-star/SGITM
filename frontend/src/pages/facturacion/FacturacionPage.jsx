import { useEffect, useState } from "react";
import { api } from "../../api/client";

const ESTADO_CLASE = { PENDIENTE: "pendiente", PAGADA: "pagada", ANULADA: "cerrada" };

/** Modulo "Facturación": generada a partir de los ítems de órdenes ya cerradas. */
export default function FacturacionPage() {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ordenesCerradas, setOrdenesCerradas] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [ordenIds, setOrdenIds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/facturas").then(setFacturas).catch((e) => setError(e.message));
    api.get("/clientes").then(setClientes).catch(() => {});
  }, []);

  useEffect(() => {
    if (!clienteId) { setOrdenesCerradas([]); return; }
    api.get("/ordenes").then((todas) => {
      setOrdenesCerradas(todas.filter((o) => o.estado === "CERRADA"));
    });
  }, [clienteId]);

  function toggleOrden(id) {
    setOrdenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function generarFactura(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/facturas", { clienteId: Number(clienteId), ordenIds });
      setFacturas(await api.get("/facturas"));
      setOrdenIds([]);
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Facturación</h1>
          <div className="sub">Generada automáticamente a partir de los ítems de la orden</div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Generar factura</h3>
          <form onSubmit={generarFactura}>
            <div className="field">
              <label>Cliente</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            {ordenesCerradas.length > 0 && (
              <div className="field">
                <label>Órdenes cerradas a facturar</label>
                {ordenesCerradas.map((o) => (
                  <label key={o.id} style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
                    <input type="checkbox" checked={ordenIds.includes(o.id)} onChange={() => toggleOrden(o.id)} />
                    {" "}OS-{String(o.id).padStart(4, "0")} — {o.motoDescripcion} ({o.motoPlaca})
                  </label>
                ))}
              </div>
            )}
            {error && <p className="error-text">{error}</p>}
            <button className="btn primary" type="submit" disabled={ordenIds.length === 0}>Generar factura</button>
          </form>
        </div>

        <div className="card">
          <h3>Historial de facturas</h3>
          <table>
            <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id}>
                  <td>FAC-{String(f.id).padStart(4, "0")}</td>
                  <td>{f.clienteNombre}</td>
                  <td>${Number(f.total).toLocaleString("es-CO")}</td>
                  <td><span className={`pill ${ESTADO_CLASE[f.estado]}`}>{f.estado}</span></td>
                </tr>
              ))}
              {facturas.length === 0 && <tr><td colSpan={4} style={{ color: "var(--muted)" }}>Sin facturas todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
