"use client"
import { useState, useEffect } from "react"
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function EstudiantePerfil() {
  const [estudiante, setEstudiante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    fecha_nacimiento: "",
  })

  useEffect(() => {
    fetchPerfil()
  }, [])

  const fetchPerfil = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/estudiante/perfil")
      setEstudiante(data.estudiante)
      setFormData({
        nombre: data.estudiante.nombre || "",
        apellido: data.estudiante.apellido || "",
        telefono: data.estudiante.telefono || "",
        fecha_nacimiento: data.estudiante.fecha_nacimiento || "",
      })
    } catch (err) {
      console.error("Error al cargar perfil:", err)
      setError("Error al cargar la información del perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { data } = await api.put("/estudiante/perfil", formData)
      setEstudiante(data.estudiante)
      setEditMode(false)
    } catch (err) {
      console.error("Error al actualizar perfil:", err)
      setError("Error al actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      nombre: estudiante.nombre || "",
      apellido: estudiante.apellido || "",
      telefono: estudiante.telefono || "",
      fecha_nacimiento: estudiante.fecha_nacimiento || "",
    })
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button onClick={fetchPerfil} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        {/* Información del Perfil */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <FaEdit />
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                  >
                    <FaSave />
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                  >
                    <FaTimes />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Nombre
                </label>
                {editMode ? (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ingresa tu nombre"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {estudiante.nombre || "No especificado"}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Apellido
                </label>
                {editMode ? (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Ingresa tu apellido"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {estudiante.apellido || "No especificado"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email
                </label>
                <p className="text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">{estudiante.email}</p>
                <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  Teléfono
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ingresa tu teléfono"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {estudiante.telefono || "No especificado"}
                  </p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Fecha de Nacimiento
                </label>
                {editMode ? (
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {estudiante.fecha_nacimiento ? formatDate(estudiante.fecha_nacimiento) : "No especificado"}
                  </p>
                )}
              </div>

              {/* Tipo de Estudiante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Estudiante</label>
                <p className="text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
                  {estudiante.tipo_estudiante === "interno" ? "Interno" : "Externo"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la Cuenta */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Información de la Cuenta</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    estudiante.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {estudiante.estado.charAt(0).toUpperCase() + estudiante.estado.slice(1)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro</label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{formatDate(estudiante.fecha_registro)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Último Acceso</label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                  {estudiante.ultimo_acceso ? formatDate(estudiante.ultimo_acceso) : "Nunca"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta Creada</label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{formatDate(estudiante.fecha_creacion)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
