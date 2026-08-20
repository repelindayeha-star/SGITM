import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const MODULOS_TALLER = [
  { to: "/clientes", label: "Clientes" },
  { to: "/motos", label: "Motocicletas" },
  { to: "/ordenes", label: "Órdenes de servicio" },
  { to: "/facturacion", label: "Facturación" },
];

/**
 * Layout compartido por todas las paginas del rol TALLER. El Portal del cliente
 * tiene su propio layout mas simple (ver PortalPage) porque su navegacion es distinta.
 */
export default function AppShell() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="brand">
          <div className="logo">M</div>
          <div>
            <b>MotoNexus</b>
            <span>Taller de Motos</span>
          </div>
        </div>
        {MODULOS_TALLER.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
          >
            {m.label}
          </NavLink>
        ))}

        <div style={{ marginTop: 24, fontSize: 12, color: "var(--muted)" }}>
          <div>{usuario?.correo}</div>
          <button className="btn" style={{ marginTop: 8, width: "100%" }} onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}
