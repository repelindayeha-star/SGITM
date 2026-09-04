const VARIANTES = {
  ambar: 'bg-ambar-400/15 text-ambar-400 border-ambar-400/30',
  neutro: 'bg-taller-800 text-taller-200 border-taller-700',
  verde: 'bg-green-900/30 text-green-400 border-green-800/50',
  rojo: 'bg-red-900/30 text-red-400 border-red-800/50',
};

export default function Badge({ children, variante = 'neutro' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-mono uppercase tracking-wide ${VARIANTES[variante]}`}
    >
      {children}
    </span>
  );
}
