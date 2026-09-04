import Modal from './Modal';
import { LoaderCircle } from 'lucide-react';

export default function ConfirmDialog({
  abierto,
  onCerrar,
  onConfirmar,
  titulo = 'Confirmar accion',
  mensaje,
  textoConfirmar = 'Confirmar',
  cargando = false,
  peligroso = false,
}) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} ancho="max-w-sm">
      <p className="text-taller-200 text-sm mb-6">{mensaje}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onCerrar}
          className="flex-1 border border-taller-700 text-taller-200 hover:bg-taller-800 rounded-md py-2 text-sm font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          disabled={cargando}
          className={`flex-1 rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
            peligroso
              ? 'bg-red-700 hover:bg-red-600 text-red-50'
              : 'bg-ambar-400 hover:bg-ambar-500 text-taller-950'
          }`}
        >
          {cargando && <LoaderCircle className="w-4 h-4 animate-spin" />}
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
