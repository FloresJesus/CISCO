'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      newErrors.email = 'Ingrese un correo electrónico válido'
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
      const response = await axios.post('/api/login', {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Guardar token y redirigir según rol
      localStorage.setItem('cisco_token', response.data.token)
      
      if (response.data.requiresPasswordChange) {
        router.push('/auth/change-password')
      } else {
        router.push(response.data.role === 'admin' ? '/admin' : '/dashboard')
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-ciscoDarkBlue/5 to-ciscoBlue/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <Image 
              src="/images/cisco2.png" 
              width={200} 
              height={80} 
              alt="Cisco Academy Logo"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Iniciar Sesión</h1>
          <p className="text-center text-gray-600 mb-8">Ingresa tus credenciales para acceder</p>
          
          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm">{errors.form}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                  placeholder="usuario@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent pr-10`}
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
              
              <div className="flex justify-end mt-2">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-ciscoBlue hover:text-ciscoDarkBlue"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-ciscoBlue focus:ring-ciscoBlue border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Recordar sesión
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-ciscoBlue text-white py-3 px-4 rounded-lg hover:bg-ciscoDarkBlue focus:outline-none focus:ring-2 focus:ring-ciscoBlue focus:ring-offset-2 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
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

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-ciscoBlue hover:text-ciscoDarkBlue font-medium">
                Regístrate
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" className="text-ciscoBlue hover:text-ciscoDarkBlue">
              Términos de servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-ciscoBlue hover:text-ciscoDarkBlue">
              Política de privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}