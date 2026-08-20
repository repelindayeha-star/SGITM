import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/client";
import ItemsTable from "../../components/ItemsTable";

/**
 * Modulo "Portal del cliente" -- solo lectura. Reutiliza <ItemsTable soloLectura>,
 * el mismo componente que usa la vista de detalle de orden del taller, en vez de
 * tener una tabla de items propia.
 */
export default function PortalPage() {
  const { usuario, cerrarSesion } = useAuth();
  const [motos, setMotos] = useState([]);
  const [motoSeleccionada, setMotoSeleccionada] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    api.get("/portal/mis-motos").then((data) => {
      setMotos(data);
      if (data.length > 0) setMotoSeleccionada(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!motoSeleccionada) return;
    api.get(`/portal/motos/${motoSeleccionada}/historial`).then(setHistorial);
  }, [motoSeleccionada]);

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="brand">
          <div className="logo">M</div>
          <div><b>MotoNexus</b><span>Portal del cliente</span></div>
        </div>
        {motos.map((m) => (
          <div
            key={m.id}
            className={"nav-item" + (motoSeleccionada === m.id ? " active" : "")}
            style={{ cursor: "pointer" }}
            onClick={() => setMotoSeleccionada(m.id)}
          >
            {m.marca} {m.modelo} ({m.placa})
          </div>
        ))}
        <div style={{ marginTop: 24, fontSize: 12, color: "var(--muted)" }}>
          <div>{usuario?.correo}</div>
          <button className="btn" style={{ marginTop: 8, width: "100%" }} onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div>
            <h1>Historial de mi moto</h1>
            <div className="sub">Diagnósticos, pruebas y repuestos usados — solo lectura</div>
          </div>
        </div>

        {historial.length === 0 && <p style={{ color: "var(--muted)" }}>Sin historial de servicios todavía.</p>}

        {historial.map(({ orden, items }) => (
          <div key={orden.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <b>{new Date(orden.fecha).toLocaleDateString("es-CO")}</b>
              <span className="pill proceso">{orden.estado.replace("_", " ")}</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{orden.diagnostico}</p>
            <ItemsTable items={items} soloLectura />
          </div>
        ))}
      </div>
    </div>
  );
}
