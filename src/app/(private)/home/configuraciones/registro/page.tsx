"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const [identificador, setIdentificador] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [apellidoCompleto, setApellidoCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('');

  const [identificadorError, setIdentificadorError] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [rolError, setRolError] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentificadorError('');
    setNombreError('');
    setApellidoError('');
    setEmailError('');
    setPasswordError('');
    setTelefonoError('');
    setRolError('');
    setGeneralMessage('');

    let isValid = true;

    if (!identificador.trim()) {
      setIdentificadorError('El identificador es obligatorio.');
      isValid = false;
    }
    if (!nombreCompleto.trim()) {
      setNombreError('El nombre completo es obligatorio.');
      isValid = false;
    }
    if (!apellidoCompleto.trim()) {
      setApellidoError('El apellido completo es obligatorio.');
      isValid = false;
    }
    if (!email.trim()) {
      setEmailError('El correo electrónico es obligatorio.');
      isValid = false;
    }
    if (!telefono.trim()) {
      setTelefonoError('El teléfono es obligatorio.');
      isValid = false;
    }
    if (!rol) {
      setRolError('Selecciona un rol.');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('La contraseña es obligatoria.');
      isValid = false;
    } else {
      const messages: string[] = [];
      if (password.length < 10) messages.push('mínimo 10 caracteres');
      if (!/[A-Z]/.test(password)) messages.push('una mayúscula');
      if (!/[0-9]/.test(password)) messages.push('un número');
      if (messages.length > 0) {
        setPasswordError(`Debe contener ${messages.join(', ')}`);
        isValid = false;
      }
    }

    if (!isValid) {
      setGeneralMessage('Corrige los errores antes de continuar.');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGeneralMessage('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      setGeneralMessage('Ocurrió un error al registrar. Inténtalo de nuevo.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-green-800 text-center">Registro de Usuario</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Identificador de Usuario</label>
            <input
              type="text"
              placeholder="Ej: usuario123"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md"
            />
            {identificadorError && <p className="text-red-500 text-sm">{identificadorError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombres</label>
              <input
                type="text"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              {nombreError && <p className="text-red-500 text-sm">{nombreError}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Apellidos</label>
              <input
                type="text"
                value={apellidoCompleto}
                onChange={(e) => setApellidoCompleto(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              {apellidoError && <p className="text-red-500 text-sm">{apellidoError}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md"
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md"
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              {telefonoError && <p className="text-red-500 text-sm">{telefonoError}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Rol</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              >
                <option value="">Selecciona tu rol</option>
                <option value="admin">Administrador</option>
                <option value="operario">Operario</option>
              </select>
              {rolError && <p className="text-red-500 text-sm">{rolError}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-md font-semibold hover:bg-green-600 transition"
          >
            Crear Cuenta
          </button>

          {generalMessage && <p className="text-center text-sm text-green-700 mt-4">{generalMessage}</p>}
        </form>

      </div>
    </main>
  );
}
