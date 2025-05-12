'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck } from 'react-icons/fa'
import { useAuth } from '@/components/auth/AuthProvider'

const LoginPage = () => {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const sessionExpired = searchParams.get('session_expired') === '1'

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    if (!credentials.email) {
      newErrors.email = 'El correo electrónico es requerido'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Correo electrónico inválido'
      isValid = false
    }

    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      await login({
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      })
    } catch (err) {
      let errorMessage = 'Error al iniciar sesión'

      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Credenciales incorrectas'
            break
          case 403:
            errorMessage = 'Cuenta no verificada. Por favor verifica tu correo.'
            break
          case 423:
            errorMessage = 'Cuenta bloqueada. Contacta al administrador.'
            break
          default:
            errorMessage = err.response.data?.message || errorMessage
        }
      }

      setErrors(prev => ({ ...prev, form: errorMessage }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ciscoDarkBlue/10 to-ciscoBlue/10 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sección de imagen */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-ciscoDarkBlue to-ciscoBlue p-8 flex flex-col justify-center items-center text-white">
            <div className="mb-8">
              <Image 
                src="/images/cisco2.png" 
                width={280} 
                height={120} 
                alt="Cisco Academy Logo"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center">Bienvenido de vuelta</h1>
            <p className="text-center text-blue-100 max-w-md">
              Accede a tu cuenta para continuar con tu formación en tecnologías de redes y seguridad.
            </p>
            <div className="mt-8 w-full max-w-xs">
              <div className="flex items-center mb-3">
                <FaCheck className="text-green-300 mr-2" />
                <span className="text-blue-100">Cursos certificados por Cisco</span>
              </div>
              <div className="flex items-center mb-3">
                <FaCheck className="text-green-300 mr-2" />
                <span className="text-blue-100">Instructores certificados</span>
              </div>
              <div className="flex items-center">
                <FaCheck className="text-green-300 mr-2" />
                <span className="text-blue-100">Laboratorios prácticos</span>
              </div>
            </div>
          </div>

          {/* Sección del formulario */}
          <div className="w-full md:w-1/2 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Iniciar sesión</h2>
            
            
            {sessionExpired && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-500 mr-3 flex-shrink-0" />
                  <p className="text-yellow-700">Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</p>
                </div>
              </div>
            )}

            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-red-700">{errors.form}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    className={`w-full pl-10 px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                    placeholder="usuario@email.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-ciscoBlue"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-ciscoBlue focus:ring-ciscoBlue border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-ciscoBlue hover:text-ciscoDarkBlue">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-ciscoBlue text-white py-3 px-4 rounded-lg hover:bg-ciscoDarkBlue focus:outline-none focus:ring-2 focus:ring-ciscoBlue focus:ring-offset-2 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : 'Iniciar sesión'}
              </button>
            </form>
            <p className="text-gray-600 mb-6">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-ciscoBlue hover:text-ciscoDarkBlue font-medium">
                Regístrate aquí
              </Link>
            </p>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage