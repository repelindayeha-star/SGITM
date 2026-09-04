import { X } from 'lucide-react';

export default function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-lg' }) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-taller-950/80 backdrop-blur-sm"
        onClick={onCerrar}
      />
      <div className={`relative w-full ${ancho} bg-taller-850 border border-taller-700 rounded-xl shadow-2xl`}>
        <div className="h-1 rounded-t-xl bg-ambar-400" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-taller-700">
          <h2 className="text-taller-100 font-semibold text-sm uppercase tracking-wide">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="text-taller-600 hover:text-ambar-400 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
