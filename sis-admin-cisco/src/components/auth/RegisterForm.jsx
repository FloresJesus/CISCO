'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa'

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    fecha_nacimiento: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const router = useRouter()

  // Efecto para calcular fortaleza de contraseña
  useEffect(() => {
    if (formData.password) {
      let strength = 0
      // Longitud mínima
      if (formData.password.length >= 8) strength += 1
      // Contiene número
      if (/\d/.test(formData.password)) strength += 1
      // Contiene mayúscula
      if (/[A-Z]/.test(formData.password)) strength += 1
      // Contiene carácter especial
      if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) strength += 1
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [formData.password])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) error = 'Este campo es obligatorio'
        else if (value.length < 2) error = 'Mínimo 2 caracteres'
        break
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Ingrese un correo válido'
        }
        break
      case 'password':
        if (value.length < 8) {
          error = 'Mínimo 8 caracteres'
        }
        break
      case 'telefono':
        if (value && !/^[0-9+\-\s]+$/.test(value)) {
          error = 'Teléfono no válido'
        }
        break
      case 'fecha_nacimiento':
        if (value && new Date(value) >= new Date()) {
          error = 'Fecha no válida'
        }
        break
      default:
        break
    }
    
    return error
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    // Validar campos individuales
    Object.keys(formData).forEach(key => {
      if (key !== 'telefono' && key !== 'fecha_nacimiento') {
        const error = validateField(key, formData[key])
        if (error) {
          newErrors[key] = error
          isValid = false
        }
      }
    })

    // Validar confirmación de contraseña
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
      isValid = false
    }

    // Validar términos y condiciones
    if (!acceptedTerms) {
      newErrors.terms = 'Debes aceptar los términos'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccess('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const userData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        telefono: formData.telefono.trim() || null,
        fecha_nacimiento: formData.fecha_nacimiento || null
      }

      const response = await axios.post('/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setSuccess('¡Registro exitoso! Redirigiendo...')
      
      // Guardar token temporalmente si es necesario
      if (response.data.token) {
        localStorage.setItem('temp_token', response.data.token)
      }

      setTimeout(() => {
        router.push('/auth/verify-email')
      }, 2000)
    } catch (err) {
      let errorMessage = 'Error al registrar'
      
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = 'El correo ya está registrado'
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
        }
      }
      
      setErrors(prev => ({ ...prev, form: errorMessage }))
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return 'bg-red-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-blue-500'
      case 4: return 'bg-green-500'
      default: return 'bg-gray-200'
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 1: return 'Débil'
      case 2: return 'Moderada'
      case 3: return 'Fuerte'
      case 4: return 'Muy fuerte'
      default: return ''
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
            <h1 className="text-3xl font-bold mb-4 text-center">Únete a nuestra comunidad</h1>
            <p className="text-center text-blue-100 max-w-md">
              Accede a cursos certificados, recursos exclusivos y conéctate con profesionales de redes y seguridad.
            </p>
            <div className="mt-8 w-full max-w-xs">
              <div className="flex items-center mb-3">
                <FaCheck className="text-green-300 mr-2" />
                <span className="text-blue-100">Acceso a laboratorios virtuales</span>
              </div>
              <div className="flex items-center mb-3">
                <FaCheck className="text-green-300 mr-2" />
                <span className="text-blue-100">Preparación para certificaciones</span>
              </div>
              <div className="flex items-center">
                <FaCheck className="text-green-300 mr-2" />
                <span className="text-blue-100">Soporte de instructores expertos</span>
              </div>
            </div>
          </div>

          {/* Sección del formulario */}
          <div className="w-full md:w-1/2 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear cuenta</h2>
            <p className="text-gray-600 mb-6">Completa tus datos para registrarte</p>
            
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <FaTimes className="text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-red-700">{errors.form}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                    placeholder="first name"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido*</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.apellido ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                    placeholder="last name"
                  />
                  {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                  placeholder="usuario@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                    placeholder="+591 ********"
                  />
                  {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.fecha_nacimiento ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.fecha_nacimiento && <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña*</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent pr-10`}
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
                
                {/* Indicador de fortaleza de contraseña */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Fortaleza: {getPasswordStrengthText()}</span>
                      <span>{formData.password.length}/8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`} 
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña*</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-ciscoBlue focus:border-transparent`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked)
                      if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }))
                    }}
                    className="focus:ring-ciscoBlue h-4 w-4 text-ciscoBlue border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">
                    Acepto los <Link href="/terms" className="text-ciscoBlue hover:text-ciscoDarkBlue">términos y condiciones</Link>*
                  </label>
                  <p className="text-gray-500">Al registrarte aceptas nuestro tratamiento de datos</p>
                  {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
                </div>
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
                    Creando cuenta...
                  </span>
                ) : 'Registrarse'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-ciscoBlue hover:text-ciscoDarkBlue font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register;