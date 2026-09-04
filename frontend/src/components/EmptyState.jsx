export default function EmptyState({ icono: Icono, titulo, descripcion, accion }) {
  return (
    <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-10 text-center">
      <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
      {Icono && <Icono className="w-8 h-8 text-taller-700 mx-auto mb-3" strokeWidth={1.5} />}
      <p className="text-taller-200 font-medium mb-1">{titulo}</p>
      {descripcion && <p className="text-taller-600 text-sm">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}
