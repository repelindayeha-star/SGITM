import { useState, useRef } from 'react';
import { Camera, Trash2, X, LoaderCircle, ImageOff } from 'lucide-react';
import { subirEvidencia, eliminarEvidencia, MOMENTOS } from '../services/evidencia.service';
import { formatearFechaHora } from '../utils/formato';

const ETIQUETA_MOMENTO = { ANTES: 'Antes', DURANTE: 'Durante', DESPUES: 'Después' };

/**
 * Fotografias del trabajo hecho sobre la moto.
 *
 * Es la respuesta al problema que origina el proyecto: el cliente deja la
 * moto y se la devuelven arreglada sin poder ver que se hizo.
 *
 * `editable` separa los dos usos de este mismo componente: dentro del taller
 * se sube y se borra; en el portal del cliente y en el seguimiento publico
 * solo se mira.
 */
export default function GaleriaEvidencias({
  ordenId,
  evidencias = [],
  editable = false,
  ordenCerrada = false,
  alCambiar,
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState('');
  const [momento, setMomento] = useState('DURANTE');
  const [descripcion, setDescripcion] = useState('');
  const [ampliada, setAmpliada] = useState(null);
  const campoArchivo = useRef(null);

  async function manejarArchivo(e) {
    const imagen = e.target.files?.[0];
    if (!imagen) return;
    setError('');
    setSubiendo(true);
    setProgreso(0);
    try {
      await subirEvidencia(ordenId, { imagen, momento, descripcion, alProgresar: setProgreso });
      setDescripcion('');
      alCambiar?.();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
      setProgreso(0);
      // Sin esto, volver a elegir el MISMO archivo no dispara el evento.
      if (campoArchivo.current) campoArchivo.current.value = '';
    }
  }

  async function borrar(evidencia) {
    setError('');
    try {
      await eliminarEvidencia(ordenId, evidencia.id);
      alCambiar?.();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo borrar la imagen.');
    }
  }

  const campo =
    'bg-taller-900 border border-taller-700 rounded-md px-3 py-2 text-taller-100 text-sm ' +
    'placeholder-taller-400 outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors';

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2.5">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {editable && !ordenCerrada && (
        <div className="mb-5 rounded-lg border border-dashed border-taller-700 bg-taller-900/50 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="momento-evidencia" className="text-taller-200 text-xs font-medium uppercase tracking-wide">
                Momento
              </label>
              <select
                id="momento-evidencia"
                value={momento}
                onChange={(e) => setMomento(e.target.value)}
                className={campo}
              >
                {MOMENTOS.map((m) => (
                  <option key={m.valor} value={m.valor}>{m.etiqueta}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
              <label htmlFor="desc-evidencia" className="text-taller-200 text-xs font-medium uppercase tracking-wide">
                Qué se ve (opcional)
              </label>
              <input
                id="desc-evidencia"
                type="text"
                maxLength={200}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Pastillas de freno desgastadas"
                className={campo}
              />
            </div>

            <label
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                subiendo
                  ? 'bg-taller-700 text-taller-400 cursor-not-allowed'
                  : 'bg-ambar-400 hover:bg-ambar-500 text-taller-950'
              }`}
            >
              {subiendo ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  {progreso > 0 ? `${progreso} %` : 'Subiendo...'}
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Agregar foto
                </>
              )}
              <input
                ref={campoArchivo}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={subiendo}
                onChange={manejarArchivo}
              />
            </label>
          </div>
          <p className="text-taller-400 text-xs mt-2.5">
            JPG, PNG o WEBP, hasta 5 MB. Máximo 12 fotos por orden.
          </p>
        </div>
      )}

      {editable && ordenCerrada && (
        <p className="mb-5 text-taller-400 text-sm">
          La orden ya está cerrada: las evidencias quedaron como registro y no se pueden cambiar.
        </p>
      )}

      {evidencias.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-taller-700 bg-taller-900/40 px-4 py-6">
          <ImageOff className="w-5 h-5 text-taller-400 shrink-0" />
          <p className="text-taller-400 text-sm">
            Todavía no hay fotografías de este trabajo.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {evidencias.map((ev) => (
            <li key={ev.id} className="group relative rounded-lg overflow-hidden border border-taller-700 bg-taller-900">
              <button
                type="button"
                onClick={() => setAmpliada(ev)}
                className="block w-full text-left"
                aria-label={`Ampliar: ${ev.descripcion || ETIQUETA_MOMENTO[ev.momento]}`}
              >
                <img
                  src={ev.urlMiniatura || ev.url}
                  alt={ev.descripcion || `Evidencia del trabajo, ${ETIQUETA_MOMENTO[ev.momento]?.toLowerCase()}`}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover"
                />
              </button>

              <div className="px-2.5 py-2">
                <span className="inline-block rounded bg-taller-800 border border-taller-700 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-ambar-400">
                  {ETIQUETA_MOMENTO[ev.momento] || ev.momento}
                </span>
                {ev.descripcion && (
                  <p className="text-taller-200 text-xs mt-1.5 leading-snug">{ev.descripcion}</p>
                )}
                <p className="text-taller-400 text-[10px] font-mono mt-1">
                  {formatearFechaHora(ev.createdAt)}
                </p>
              </div>

              {editable && !ordenCerrada && (
                <button
                  type="button"
                  onClick={() => borrar(ev)}
                  className="absolute top-2 right-2 rounded-md bg-taller-950/80 border border-taller-700 p-1.5
                             text-taller-200 opacity-0 group-hover:opacity-100 focus:opacity-100
                             hover:text-red-300 hover:border-red-800 transition-all"
                  aria-label="Borrar esta fotografía"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Vista ampliada */}
      {ampliada && (
        <div
          className="fixed inset-0 z-50 bg-taller-950/90 flex items-center justify-center p-4"
          onClick={() => setAmpliada(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Fotografía ampliada"
        >
          <button
            type="button"
            onClick={() => setAmpliada(null)}
            className="absolute top-4 right-4 rounded-md border border-taller-700 bg-taller-900 p-2 text-taller-200 hover:text-ambar-400 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <figure className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={ampliada.url}
              alt={ampliada.descripcion || 'Evidencia del trabajo'}
              className="w-full max-h-[75vh] object-contain rounded-lg border border-taller-700"
            />
            <figcaption className="mt-3 text-center">
              <span className="text-ambar-400 text-xs font-mono uppercase tracking-wide">
                {ETIQUETA_MOMENTO[ampliada.momento] || ampliada.momento}
              </span>
              {ampliada.descripcion && (
                <p className="text-taller-100 text-sm mt-1">{ampliada.descripcion}</p>
              )}
              <p className="text-taller-400 text-xs font-mono mt-1">
                {formatearFechaHora(ampliada.createdAt)}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
