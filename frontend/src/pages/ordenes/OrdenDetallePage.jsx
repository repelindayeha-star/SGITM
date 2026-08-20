import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import ItemsTable from "../../components/ItemsTable";

const TIPOS = ["REPUESTO", "MANO_DE_OBRA", "PRUEBA"];

/** Detalle de una orden: diagnóstico + ítems (el mismo <ItemsTable> que usa el Portal del cliente, en modo editable). */
export default function OrdenDetallePage() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [items, setItems] = useState([]);
  const [diagnostico, setDiagnostico] = useState("");
  const [nuevoItem, setNuevoItem] = useState({ tipo: "REPUESTO", descripcion: "", cantidad: "1", valorUnitario: "" });
  const [error, setError] = useState(null);

  function cargar() {
    api.get(`/ordenes/${id}`).then((o) => { setOrden(o); setDiagnostico(o.diagnostico || ""); });
    api.get("/items-orden", { ordenId: id }).then(setItems);
  }

  useEffect(() => { cargar(); }, [id]);

  async function guardarDiagnostico() {
    setError(null);
    try {
      await api.put(`/ordenes/${id}`, { motoId: orden.motoId, diagnostico });
      cargar();
    } catch (err) { setError(err.message); }
  }

  async function cambiarEstado(estado) {
    setError(null);
    try {
      await api.patch(`/ordenes/${id}/estado`, { estado });
      cargar();
    } catch (err) { setError(err.message); }
  }

  async function agregarItem(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/items-orden", { ordenId: Number(id), ...nuevoItem, cantidad: Number(nuevoItem.cantidad), valorUnitario: Number(nuevoItem.valorUnitario) });
      setNuevoItem({ tipo: "REPUESTO", descripcion: "", cantidad: "1", valorUnitario: "" });
      cargar();
    } catch (err) { setError(err.message); }
  }

  async function eliminarItem(itemId) {
    await api.del(`/items-orden/${itemId}`);
    cargar();
  }

  if (!orden) return <p>Cargando...</p>;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Orden OS-{String(orden.id).padStart(4, "0")}</h1>
          <div className="sub">{orden.motoDescripcion} — {orden.motoPlaca}</div>
        </div>
      </div>

      <div className="card">
        <h3>Diagnóstico</h3>
        <div className="field">
          <textarea rows={3} value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
        </div>
        <button className="btn primary" onClick={guardarDiagnostico}>Guardar diagnóstico</button>
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          {["ABIERTA", "EN_PROCESO", "CERRADA"].map((e) => (
            <button key={e} className="btn" disabled={orden.estado === e} onClick={() => cambiarEstado(e)}>
              Marcar {e.replace("_", " ").toLowerCase()}
            </button>
          ))}
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <h3>Ítems de la orden</h3>
        <ItemsTable items={items} onEliminar={eliminarItem} />
      </div>

      <div className="card">
        <h3>Agregar ítem</h3>
        <form onSubmit={agregarItem} className="grid" style={{ gridTemplateColumns: "1fr 2fr 1fr 1fr auto", alignItems: "flex-end" }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Tipo</label>
            <select value={nuevoItem.tipo} onChange={(e) => setNuevoItem((f) => ({ ...f, tipo: e.target.value }))}>
              {TIPOS.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Descripción</label>
            <input value={nuevoItem.descripcion} onChange={(e) => setNuevoItem((f) => ({ ...f, descripcion: e.target.value }))} required />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Cantidad</label>
            <input value={nuevoItem.cantidad} onChange={(e) => setNuevoItem((f) => ({ ...f, cantidad: e.target.value }))} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Valor unitario</label>
            <input value={nuevoItem.valorUnitario} onChange={(e) => setNuevoItem((f) => ({ ...f, valorUnitario: e.target.value }))} required />
          </div>
          <button className="btn primary" type="submit">Agregar</button>
        </form>
      </div>
    </div>
  );
}
