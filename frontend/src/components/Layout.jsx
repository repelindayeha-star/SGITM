import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-taller-900">
      <Navbar onAbrirMenu={() => setMenuAbierto(true)} />
      <div className="flex">
        {/* El menu se cierra desde el propio Sidebar: al tocar un enlace, la X
            o el fondo oscuro. No hace falta vigilar la ruta desde aqui. */}
        <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
        {/* min-w-0 es imprescindible: sin el, un hijo flex no se encoge y
            cualquier tabla ancha empuja la pagina fuera de la pantalla del
            celular, dejando toda la aplicacion corrida hacia la derecha. */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
