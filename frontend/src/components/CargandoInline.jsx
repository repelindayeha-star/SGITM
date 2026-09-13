import { LoaderCircle } from 'lucide-react';

export default function CargandoInline({ children = 'Cargando...' }) {
  return (
    <div className="flex items-center gap-2 text-taller-400 text-sm py-4">
      <LoaderCircle className="w-4 h-4 animate-spin" />
      {children}
    </div>
  );
}
