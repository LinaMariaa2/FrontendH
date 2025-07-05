// src/app/registro/RegistroUsuario.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Importa axios para facilitar las peticiones HTTP

export default function RegistroUsuario() {
  const router = useRouter();

  // Estado para el nombre de usuario (un solo campo)
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState(''); // Estado para el rol seleccionado (operario/admin)
  const [codigo, setCodigo] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false); // Controla si el registro inicial fue exitoso
  const [expiraEn, setExpiraEn] = useState(600); // 10 minutos en segundos para el código de verificación
  const [mensajeGlobal, setMensajeGlobal] = useState({ type: '', text: '' }); // Para mensajes de éxito/error globales

  // Estados para manejar errores de validación en el formulario
  const [errores, setErrores] = useState({
    nombreUsuario: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: '',
    codigo: '',
    general: ''
  });

  // Efecto para el temporizador del código de verificación
  useEffect(() => {
    if (registroExitoso && expiraEn > 0) {
      const timer = setInterval(() => setExpiraEn((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (expiraEn === 0 && registroExitoso) {
      // Si el código expiró y el registro fue exitoso, muestra un mensaje
      setMensajeGlobal({ type: 'error', text: 'El código de verificación ha expirado. Por favor, solicita uno nuevo.' });
    }
  }, [registroExitoso, expiraEn]);

  // Función para formatear el tiempo restante del código
  const formatearTiempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Función para validar los campos del formulario antes de enviar
  const validarFormulario = (): boolean => {
    const nuevosErrores: any = {};
    let isValid = true;

    if (!nombreUsuario) { nuevosErrores.nombreUsuario = 'El nombre de usuario es obligatorio'; isValid = false; }
    if (!email) { nuevosErrores.email = 'El correo es obligatorio'; isValid = false; }
    // Validación básica de formato de correo electrónico
    if (email && !/\S+@\S+\.\S+/.test(email)) { nuevosErrores.email = 'Formato de correo inválido'; isValid = false; }
    if (!password) { nuevosErrores.password = 'La contraseña es obligatoria'; isValid = false; }
    if (!rol) { nuevosErrores.rol = 'Selecciona un rol'; isValid = false; }

    // Validación de seguridad de contraseña: al menos 10 caracteres, una mayúscula y un número
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      nuevosErrores.password = 'Debe tener al menos 10 caracteres, una mayúscula y un número';
      isValid = false;
    }

    if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrores(nuevosErrores); // Actualiza el estado de errores
    return isValid;
  };

  /**
   * @function handleRegisterSubmit
   * @description Maneja el envío del formulario de registro inicial.
   * Envía los datos del usuario al backend para crear la cuenta.
   * @param {React.FormEvent} e - Evento del formulario.
   */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeGlobal({ type: '', text: '' }); // Limpiar mensajes globales anteriores

    if (!validarFormulario()) {
      setMensajeGlobal({ type: 'error', text: 'Por favor, corrige los errores del formulario.' });
      return;
    }

    try {
      // Realiza la solicitud POST al endpoint de registro del backend
      // ¡IMPORTANTE! La URL ahora apunta al puerto 4000 de tu backend
      const response = await axios.post('http://localhost:4000/api/auth/register', { // <-- ¡AQUÍ DEBE SER 4000!
        nombre_usuario: nombreUsuario, // Envía el nombre de usuario
        correo: email,
        contrasena: password,
        rol: rol, // Envía el rol seleccionado por el usuario (operario o admin)
      });

      console.log('Respuesta de registro exitoso:', response.data);
      setRegistroExitoso(true); // Establece el registro como exitoso para mostrar la sección de verificación
      setMensajeGlobal({ type: 'success', text: response.data.message || 'Registro exitoso. Se ha enviado un código de verificación a tu correo.' });
      setExpiraEn(600); // Reinicia el contador del código de verificación
    } catch (error: any) {
      // Manejo de errores de la API (ej. correo ya registrado, error del servidor)
      console.error('Error al registrar usuario (handleRegisterSubmit):', error.response?.data || error.message);
      setErrores(prev => ({ ...prev, general: error.response?.data?.error || 'Error al registrar usuario. Inténtalo de nuevo.' }));
      setMensajeGlobal({ type: 'error', text: error.response?.data?.error || 'Error al registrar usuario.' });
    }
  };

  /**
   * @function handleVerifyCode
   * @description Maneja la verificación del código enviado al correo.
   * Envía el correo y el código al backend para verificar la cuenta.
   */
  const handleVerifyCode = async () => {
    if (!codigo.trim()) {
      setErrores(prev => ({ ...prev, codigo: 'El código de verificación es obligatorio.' }));
      return;
    }
    setErrores(prev => ({ ...prev, codigo: '' })); // Limpiar error de código
    setMensajeGlobal({ type: '', text: '' }); // Limpiar mensajes globales anteriores

    try {
      // Realiza la solicitud POST al endpoint de verificación de código del backend
      // ¡IMPORTANTE! La URL ahora apunta al puerto 4000 de tu backend
      const response = await axios.post('http://localhost:4000/api/auth/verify-email', { // <-- ¡AQUÍ DEBE SER 4000!
        correo: email, // Se necesita el correo para identificar al usuario
        verificationCode: codigo,
      });

      console.log('Respuesta de verificación exitosa:', response.data);
      setMensajeGlobal({ type: 'success', text: response.data.message || 'Correo electrónico verificado exitosamente. ¡Ya puedes iniciar sesión!' });
      alert('¡Cuenta verificada correctamente! Serás redirigido al login.');
      router.push('/login'); // Redirige al usuario a la página de login
    } catch (error: any) {
      // *** CAMBIO CLAVE AQUÍ: MEJORA DEL MANEJO DE ERRORES PARA VERIFICACIÓN ***
      console.error('Error al verificar código (handleVerifyCode):', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'Error desconocido al verificar el código. Inténtalo de nuevo.';
      setErrores(prev => ({ ...prev, codigo: errorMessage }));
      setMensajeGlobal({ type: 'error', text: errorMessage });
    }
  };

  /**
   * @function handleResendCode
   * @description Maneja el reenvío del código de verificación.
   * Envía una solicitud al backend para generar y enviar un nuevo código.
   */
  const handleResendCode = async () => {
    setMensajeGlobal({ type: '', text: '' }); // Limpiar mensajes globales anteriores

    try {
      // Realiza la solicitud POST al endpoint de reenvío de código del backend
      // ¡IMPORTANTE! La URL ahora apunta al puerto 4000 de tu backend
      const response = await axios.post('http://localhost:4000/api/auth/resend-verification-code', { 
        correo: email, // Se necesita el correo para saber a quién reenviar el código
      });
      console.log('Respuesta de reenvío de código:', response.data);
      setMensajeGlobal({ type: 'success', text: response.data.message || 'Nuevo código de verificación enviado a tu correo.' });
      setExpiraEn(600); // Reinicia el temporizador al reenviar el código
    } catch (error: any) {
      console.error('Error al reenviar código (handleResendCode):', error.response?.data || error.message);
      setMensajeGlobal({ type: 'error', text: error.response?.data?.error || 'Error al reenviar código.' });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-green-800 text-center">Registro de Usuario</h1>

        {/* Muestra mensajes globales de éxito o error */}
        {mensajeGlobal.text && (
          <div className={`p-3 rounded-md text-center ${mensajeGlobal.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensajeGlobal.text}
          </div>
        )}

        {/* Renderizado condicional: muestra el formulario de registro o la sección de verificación */}
        {!registroExitoso ? (
          // Formulario de registro inicial
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre de Usuario</label>
              <input
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              {errores.nombreUsuario && <p className="text-red-500 text-sm">{errores.nombreUsuario}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              {errores.email && <p className="text-red-500 text-sm">{errores.email}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md"
                />
                {errores.password && <p className="text-red-500 text-sm">{errores.password}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md"
                />
                {errores.confirmPassword && <p className="text-red-500 text-sm">{errores.confirmPassword}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Rol</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              >
                <option value="">Selecciona tu rol</option>
                <option value="operario">Operario</option>
                <option value="admin">Administrador</option>
              </select>
              {errores.rol && <p className="text-red-500 text-sm">{errores.rol}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white p-3 rounded-md font-semibold hover:bg-green-600 transition"
            >
              Crear Cuenta
            </button>
          </form>
        ) : (
          // Sección de verificación de código (se muestra solo después de un registro exitoso)
          <div className="bg-green-50 p-4 border border-green-300 rounded-md space-y-3 mt-6">
            <p className="text-sm text-gray-700">
              Ingresa el código de verificación enviado a tu correo. Expira en{" "}
              <strong>{formatearTiempo(expiraEn)}</strong>.
            </p>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Código de 6 dígitos"
            />
            {errores.codigo && <p className="text-red-500 text-sm">{errores.codigo}</p>}

            <button
              onClick={handleVerifyCode}
              disabled={!codigo.trim()}
              className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verificar código
            </button>
            <button
              onClick={handleResendCode}
              className="text-sm text-green-600 underline mt-2 block"
            >
              Reenviar código
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
