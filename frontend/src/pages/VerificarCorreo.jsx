import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LoaderCircle, CircleCheck, TriangleAlert } from 'lucide-react';
import PantallaAuth from '../components/PantallaAuth';
import * as authService from '../services/auth.service';

export default function VerificarCorreo() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') || '';
  const [estado, setEstado] = useState('comprobando'); // comprobando | listo | error
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    let vigente = true;

    if (!token) {
      setEstado('error');
      setMensaje('La direccion no trae el codigo del enlace.');
      return undefined;
    }

    authService
      .verificarCorreo(token)
      .then((texto) => {
        if (!vigente) return;
        setEstado('listo');
        setMensaje(texto || 'Correo confirmado.');
      })
      .catch((err) => {
        if (!vigente) return;
        setEstado('error');
        setMensaje(err.response?.data?.mensaje || 'No se pudo confirmar el correo.');
      });

    return () => {
      vigente = false;
    };
  }, [token]);

  if (estado === 'comprobando') {
    return (
      <PantallaAuth titulo="Confirmando tu correo">
        <div className="flex items-center gap-3 text-taller-200 text-sm">
          <LoaderCircle className="w-5 h-5 animate-spin text-ambar-400" />
          Un momento...
        </div>
      </PantallaAuth>
    );
  }

  const correcto = estado === 'listo';
  const Icono = correcto ? CircleCheck : TriangleAlert;

  return (
    <PantallaAuth titulo={correcto ? 'Correo confirmado' : 'No se pudo confirmar'}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-taller-800 border border-taller-700 flex items-center justify-center mb-4">
          <Icono className="w-6 h-6 text-ambar-400" strokeWidth={1.75} />
        </div>
        <p className="text-taller-200 text-sm leading-relaxed">{mensaje}</p>
        {correcto && (
          <p className="text-taller-400 text-xs mt-3 leading-relaxed">
            A partir de ahora recibiras los avisos del estado de tu motocicleta en este correo.
          </p>
        )}
        <Link
          to="/login"
          className="mt-6 w-full bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md py-2.5 transition-colors"
        >
          Ir al inicio de sesion
        </Link>
      </div>
    </PantallaAuth>
  );
}
