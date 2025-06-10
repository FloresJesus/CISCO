"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSave, FaArrowLeft, FaSpinner } from "react-icons/fa"
import api from "@/libs/api"

// Modificar la definición de la función para aceptar un rol predeterminado
export default function UsuarioForm({ usuario = null, rolPredeterminado = null }) {
  const router = useRouter()
  const isEditing = !!usuario

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rol: rolPredeterminado || "estudiante",
    nombre: "",
    apellido: "",
    telefono: "",
    especialidad: "",
    biografia: "",
    activo: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isEditing && usuario) {
      setFormData({
        email: usuario.email || "",
        password: "", // No mostrar contraseña
        rol: usuario.rol || "estudiante",
        nombre: usuario.detalles?.nombre || "",
        apellido: usuario.detalles?.apellido || "",
        telefono: usuario.detalles?.telefono || "",
        especialidad: usuario.detalles?.especialidad || "",
        biografia: usuario.detalles?.biografia || "",
        activo: usuario.activo,
      })
    }
  }, [isEditing, usuario])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validaciones
      if (!formData.email || !formData.nombre || !formData.apellido) {
        throw new Error("Por favor, completa los campos requeridos")
      }

      if (!isEditing && !formData.password) {
        throw new Error("La contraseña es requerida para nuevos usuarios")
      }

      // Crear o actualizar usuario
      if (isEditing) {
        await api.put(`/admin/usuarios/${usuario.id}`, formData)
        setSuccess(true)
      } else {
        await api.post("/admin/usuarios", formData)
        if (formData.rol === "estudiante") {
          router.push("/admin/usuarios/estudiantes")
        }else if (formData.rol === "instructor") {
          router.push("/admin/usuarios/instructores")
        }else if (formData.rol === "admin") {
          router.push("/admin/usuarios/administradores")
        }
      }
    } catch (err) {
      console.error("Error al guardar usuario:", err)
      setError(err.response?.data?.error || err.message || "Error al guardar el usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      {success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">Usuario actualizado correctamente</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {!isEditing && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              placeholder={isEditing ? "Dejar en blanco para mantener la actual" : ""}
              required={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            >
              <option value="estudiante">Estudiante</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
            />
          </div>

          {formData.rol === "instructor" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                <textarea
                  name="biografia"
                  value={formData.biografia}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
                ></textarea>
              </div>
            </>
          )}

          {isEditing && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="h-4 w-4 text-ciscoBlue focus:ring-ciscoBlue border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                Usuario activo
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-ciscoBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ciscoDarkBlue transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  )
}
