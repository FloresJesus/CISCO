'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Guardar el token en localStorage o cookies
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      // Redirigir según el rol del usuario
      const redirectPath = response.data.user?.rol === 'instructor' 
        ? '/dashboard/instructor' 
        : '/dashboard/estudiante';
      
      router.push(redirectPath);

    } catch (err) {
      // Manejo mejorado de errores con Axios
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         'Error al conectar con el servidor';
      
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        {/* Sección de imagen */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-8 space-y-4">
          <Image 
            src="/images/cisco2.png" 
            width={300} 
            height={300} 
            alt="Cisco Logo"
            className="rounded-md object-contain"
            priority
          />
          <h1 className="text-2xl font-bold text-gray-800 text-center">Sistema Académico CISCO</h1>
          <p className="text-gray-600 text-center">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        {/* Sección del formulario */}
        <div className="w-full md:w-1/2 p-4 md:p-8 border-l-0 md:border-l md:border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="usuario@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordar sesión
                </label>
              </div>

              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;