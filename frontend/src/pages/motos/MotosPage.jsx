import { useEffect, useState } from "react";
import { api } from "../../api/client";

const VACIO = { clienteId: "", marca: "", modelo: "", placa: "", anio: "", cilindraje: "", color: "", chasis: "" };

/** Modulo "Motocicletas". */
export default function MotosPage() {
  const [motos, setMotos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState(null);

  function cargarMotos() {
    api.get("/motocicletas").then(setMotos).catch((e) => setError(e.message));
  }

  useEffect(() => {
    cargarMotos();
    api.get("/clientes").then(setClientes).catch(() => {});
  }, []);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/motocicletas", {
        ...form,
        clienteId: Number(form.clienteId),
        anio: form.anio ? Number(form.anio) : null,
        cilindraje: form.cilindraje ? Number(form.cilindraje) : null,
      });
      setForm(VACIO);
      cargarMotos();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Motocicletas</h1>
          <div className="sub">Datos fijos de cada moto — un cliente puede tener varias</div>
        </div>
      </div>

      <div className="grid cols-2">
        <div>
          {motos.map((m) => (
            <div key={m.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <b>{m.clienteNombre}</b>
                <span style={{ fontFamily: "monospace", background: "var(--panel2)", padding: "2px 8px", borderRadius: 4 }}>
                  {m.placa}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                {m.marca} {m.modelo} · {m.anio || "año s/d"} · {m.cilindraje ? `${m.cilindraje}cc` : "cc s/d"} · {m.color || "color s/d"}
              </p>
            </div>
          ))}
          {motos.length === 0 && <p style={{ color: "var(--muted)" }}>Sin motos registradas todavía.</p>}
        </div>

        <div className="card">
          <h3>Registrar moto</h3>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Cliente</label>
              <select value={form.clienteId} onChange={(e) => actualizar("clienteId", e.target.value)} required>
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="grid cols-2">
              <div className="field"><label>Marca</label><input value={form.marca} onChange={(e) => actualizar("marca", e.target.value)} required /></div>
              <div className="field"><label>Modelo</label><input value={form.modelo} onChange={(e) => actualizar("modelo", e.target.value)} required /></div>
              <div className="field"><label>Placa</label><input value={form.placa} onChange={(e) => actualizar("placa", e.target.value)} required /></div>
              <div className="field"><label>Año</label><input value={form.anio} onChange={(e) => actualizar("anio", e.target.value)} /></div>
              <div className="field"><label>Cilindraje (cc)</label><input value={form.cilindraje} onChange={(e) => actualizar("cilindraje", e.target.value)} /></div>
              <div className="field"><label>Color</label><input value={form.color} onChange={(e) => actualizar("color", e.target.value)} /></div>
            </div>
            <div className="field"><label>Chasis / VIN</label><input value={form.chasis} onChange={(e) => actualizar("chasis", e.target.value)} /></div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn primary" type="submit">Guardar moto</button>
          </form>
        </div>
      </div>
    </div>
  );
}
