export default function PageHeader({ titulo, descripcion, accion }) {
  return (
    <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
      <div>
        <h1 className="font-display text-2xl font-semibold text-taller-100 uppercase tracking-wide">
          {titulo}
        </h1>
        {descripcion && <p className="text-taller-600 text-sm mt-1">{descripcion}</p>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}
