export default function TarjetaMetrica({ icono: Icono, etiqueta, valor, acento = false }) {
  return (
    <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-5">
      <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            acento ? 'bg-ambar-400/15' : 'bg-taller-800'
          }`}
        >
          <Icono className={`w-4.5 h-4.5 ${acento ? 'text-ambar-400' : 'text-taller-600'}`} strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-taller-600 text-xs font-mono uppercase tracking-wide mb-1">{etiqueta}</p>
      <p className="text-taller-100 text-2xl font-semibold font-display">{valor}</p>
    </div>
  );
}