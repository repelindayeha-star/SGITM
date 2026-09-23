import { Wrench } from 'lucide-react';

/**
 * El marco comun de las pantallas de acceso: inicio de sesion, recuperacion,
 * restablecimiento y confirmacion de correo.
 *
 * Existe para que las cuatro se vean como la misma aplicacion. Cuando cada
 * pantalla se maqueta por separado, terminan con margenes y tonos ligeramente
 * distintos y la diferencia se nota justo donde peor cae: en la primera
 * impresion, antes de entrar.
 */
export default function PantallaAuth({ titulo, descripcion, children, pie }) {
  return (
    <div className="relative min-h-screen bg-taller-900 flex items-center justify-center px-4 py-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-taller-200) 1px, transparent 1px), linear-gradient(90deg, var(--color-taller-200) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ambar-400 to-transparent opacity-60" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-lg bg-taller-800 border border-taller-700 flex items-center justify-center mb-4 shadow-lg">
            <Wrench className="w-7 h-7 text-ambar-400" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-taller-100 tracking-wide uppercase">SIGTM</h1>
          <p className="text-taller-400 text-xs font-mono mt-1 tracking-wider text-center">
            SISTEMA INTEGRAL DE GESTION - TALLERES DE MOTOCICLETAS
          </p>
        </div>

        <div className="relative bg-taller-850 border border-taller-700 rounded-xl shadow-2xl">
          <div className="h-1.5 rounded-t-xl bg-ambar-400" />

          {/* Tornillos decorativos: taller-600 aqui es correcto, no hay texto. */}
          <span className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-taller-600" />

          <div className="px-8 py-9">
            <h2 className="text-taller-100 font-semibold text-lg mb-1">{titulo}</h2>
            {descripcion && <p className="text-taller-400 text-sm mb-6">{descripcion}</p>}
            {children}
          </div>
        </div>

        {pie && <div className="mt-6 text-center">{pie}</div>}

        <p className="text-center text-taller-400 text-xs font-mono mt-6">v1.0.0 - SENA - ADSO 3114227</p>
      </div>
    </div>
  );
}
