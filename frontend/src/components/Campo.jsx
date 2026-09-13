// Campo de formulario consistente: label + input/select/textarea con el mismo
// tratamiento visual en todo el sistema (fondo taller-900, foco ambar).
const clasesInput =
  'w-full bg-taller-900 border border-taller-700 rounded-md px-3 py-2.5 text-taller-100 placeholder-taller-400 text-sm outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export function Etiqueta({ children }) {
  return (
    <label className="block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide">
      {children}
    </label>
  );
}

export function Input({ etiqueta, className = '', ...props }) {
  return (
    <div>
      {etiqueta && <Etiqueta>{etiqueta}</Etiqueta>}
      <input className={`${clasesInput} ${className}`} {...props} />
    </div>
  );
}

export function Textarea({ etiqueta, className = '', ...props }) {
  return (
    <div>
      {etiqueta && <Etiqueta>{etiqueta}</Etiqueta>}
      <textarea className={`${clasesInput} resize-none ${className}`} {...props} />
    </div>
  );
}

export function Select({ etiqueta, children, className = '', ...props }) {
  return (
    <div>
      {etiqueta && <Etiqueta>{etiqueta}</Etiqueta>}
      <select className={`${clasesInput} ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
}
