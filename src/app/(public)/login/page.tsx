// src/app/(public)/login/page.tsx
"use client"; // Directiva esencial para usar Hooks de React y manejar interacciones en Next.js App Router

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Hook para la navegación programática

export default function LoginPage() {
  const router = useRouter();

  // Estados para los campos del formulario: 'correo' y 'contrasena'
  // IMPORTANTE: Estos nombres coinciden con lo que tu backend espera en el 'req.body'.
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Estados para los mensajes de error de validación de campos individuales
  const [correoError, setCorreoError] = useState('');
  const [contrasenaError, setContrasenaError] = useState('');

  // Estados para el manejo de la petición al backend
  const [loading, setLoading] = useState(false); // Controla el estado de carga (ej. para deshabilitar el botón)
  const [apiError, setApiError] = useState<string | null>(null); // Muestra errores generales de la API (ej. credenciales inválidas)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita la recarga de la página al enviar el formulario

    // Limpiar errores previos al intentar un nuevo envío
    setCorreoError('');
    setContrasenaError('');
    setApiError(null);

    let isValid = true;

    // Validaciones básicas de campos del formulario en el frontend
    if (!correo.trim()) {
      setCorreoError('El correo electrónico es obligatorio.');
      isValid = false;
    }

    if (!contrasena.trim()) {
      setContrasenaError('La contraseña es obligatoria.');
      isValid = false;
    }

    if (!isValid) {
      return; // Detener la ejecución si hay errores de validación en el frontend
    }

    setLoading(true); // Activa el estado de carga antes de la petición a la API
    try {
      // Realiza la petición POST a tu endpoint de login en el backend
      // IMPORTANTE: La URL debe ser EXACTAMENTE la de tu endpoint de login.
      // Confirmamos que es http://localhost:3000/api/auth/login
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST', // Método HTTP para enviar datos
        headers: {
          'Content-Type': 'application/json', // Indica que el cuerpo de la petición es JSON
        },
        body: JSON.stringify({ correo, contrasena }), // Convierte los datos a JSON para enviarlos
      });

      const data = await response.json(); // Parsea la respuesta JSON del backend

      // Verifica si la respuesta HTTP fue exitosa (códigos 200-299)
      if (response.ok) {
        console.log('Login exitoso:', data);
        // Guarda el token JWT en el almacenamiento local del navegador
        // IMPORTANTE: Este token es tu "pase VIP" para futuras peticiones autenticadas.
        localStorage.setItem('authToken', data.token);

        // Redirecciona al usuario a la página de inicio o dashboard
        // IMPORTANTE: Asegúrate de que la ruta '/home' exista en tu proyecto Next.js.
        router.push('/home');
      } else {
        // Si la respuesta no fue exitosa (ej. 401, 403, 500), muestra el error del backend
        console.error('Error en el login:', data.error || 'Error desconocido del servidor.');
        setApiError(data.error || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
      }
    } catch (err: any) {
      // Captura errores de red (ej. el backend no está corriendo, problemas de CORS)
      // IMPORTANTE: Este 'catch' es vital para depurar problemas de conexión.
      console.error('Error de red o del servidor:', err);
      setApiError('No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false); // Desactiva el estado de carga al finalizar la petición (éxito o error)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Image
            src="/images/logo-black-3.svg"
            alt="Logo de Hotitech"
            width={150}
            height={40}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-green-800">Iniciar Sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              id="correo"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {correoError && <p className="text-red-500 text-sm mt-1">{correoError}</p>}
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              placeholder="••••••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {contrasenaError && <p className="text-red-500 text-sm mt-1">{contrasenaError}</p>}
          </div>

          {apiError && ( // Muestra el mensaje de error general de la API si existe
            <p className="text-red-600 text-center text-sm">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={loading} // El botón se deshabilita mientras 'loading' es true
            className="w-full bg-green-500 text-white p-3 rounded-md font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'} {/* Cambia el texto del botón según el estado de carga */}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          ¿Olvidó su contraseña?{' '}
          <Link href="/recpassword" className="text-green-600 hover:underline">
            Recuperar
          </Link>
        </p>
      </div>
    </div>
  );
}
