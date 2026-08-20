import { useEffect, useState } from "react";
import { api } from "../../api/client";

/** Modulo "Clientes". */
export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/clientes").then(setClientes).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Clientes</h1>
          <div className="sub">Alta y consulta de clientes del taller</div>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3>Listado de clientes</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.documento || "—"}</td>
                <td>{c.telefono || "—"}</td>
                <td>{c.correo}</td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--muted)" }}>Sin clientes registrados todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
