'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    fecha_nacimiento: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.nombre.trim()) errors.push('El nombre es obligatorio');
    if (!formData.apellido.trim()) errors.push('El apellido es obligatorio');
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Ingrese un correo electrónico válido');
    }
    
    if (formData.password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    } else if (formData.password !== confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || null,
        fecha_nacimiento: formData.fecha_nacimiento || null
      };

      const response = await axios.post('/api/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccess('¡Registro exitoso! Verifica tu correo para activar la cuenta.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      // Manejo mejorado de errores con Axios
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Error al conectar con el servidor';
      
      setError(errorMessage.includes('Unique constraint') || 
             errorMessage.includes('duplicate')
        ? 'El correo electrónico ya está registrado'
        : errorMessage);
      
      console.error('Register error:', err);
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
          <p className="text-gray-600 text-center">Crea tu cuenta para comenzar</p>
          <p>
            {formData.apellido}
          </p>
        </div>

        {/* Sección del formulario */}
        <div className="w-full md:w-1/2 p-4 md:p-8 border-l-0 md:border-l md:border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Registro</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Nombre*</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Apellido*</label>
                <input 
                  type="text" 
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Correo Electrónico*</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Teléfono</label>
                <input 
                  type="tel" 
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Contraseña*</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Confirmar*</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  Acepto los <Link href="/terms" className="text-blue-600 hover:text-blue-800">términos y condiciones</Link>*
                </label>
                <p className="text-gray-500">Al registrarte aceptas nuestro tratamiento de datos</p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;