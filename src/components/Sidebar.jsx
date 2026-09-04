import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bike,
  CalendarClock,
  ClipboardList,
  Package,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ITEMS_MENU = [
  { to: '/dashboard', etiqueta: 'Panel general', icono: LayoutDashboard, roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'] },
  { to: '/clientes', etiqueta: 'Clientes', icono: Users, roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'] },
  { to: '/motocicletas', etiqueta: 'Motocicletas', icono: Bike, roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'] },
  { to: '/citas', etiqueta: 'Citas', icono: CalendarClock, roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] },
  { to: '/ordenes', etiqueta: 'Órdenes de trabajo', icono: ClipboardList, roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'] },
  { to: '/inventario', etiqueta: 'Inventario', icono: Package, roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] },
  { to: '/facturas', etiqueta: 'Facturación', icono: Receipt, roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] },
];

export default function Sidebar() {
  const { usuario } = useAuth();

  const itemsVisibles = ITEMS_MENU.filter((item) => item.roles.includes(usuario?.rol));

  return (
    <aside className="w-60 shrink-0 bg-taller-850 border-r border-taller-700 min-h-[calc(100vh-4rem)] py-6 px-3 hidden md:block">
      <nav className="space-y-1">
        {itemsVisibles.map((item) => {
          const Icono = item.icono;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ambar-400/15 text-ambar-400'
                    : 'text-taller-200 hover:bg-taller-800 hover:text-taller-100'
                }`
              }
            >
              <Icono className="w-4 h-4" strokeWidth={1.75} />
              {item.etiqueta}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}