"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSave, FaArrowLeft, FaSpinner, FaCalendarAlt } from "react-icons/fa"
import api from "@/libs/api"

export default function ParaleloForm({ cursoId, paralelo = null }) {
  const router = useRouter()
  const isEditing = !!paralelo

  const [formData, setFormData] = useState({
    codigo_paralelo: "",
    nombre_paralelo: "",
    instructor_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    horario: "",
    aula: "",
    estado: "planificado",
    max_estudiantes: 20,
  })

  const [instructores, setInstructores] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingInstructores, setLoadingInstructores] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Cargar datos del paralelo si estamos editando
  useEffect(() => {
    if (isEditing && paralelo) {
      setFormData({
        codigo_paralelo: paralelo.codigo_paralelo || "",
        nombre_paralelo: paralelo.nombre_paralelo || "",
        instructor_id: paralelo.instructor_id || "",
        fecha_inicio: paralelo.fecha_inicio ? paralelo.fecha_inicio.split("T")[0] : "",
        fecha_fin: paralelo.fecha_fin ? paralelo.fecha_fin.split("T")[0] : "",
        horario: paralelo.horario || "",
        aula: paralelo.aula || "",
        estado: paralelo.estado || "planificado",
        max_estudiantes: paralelo.max_estudiantes || 20,
      })
    }
  }, [isEditing, paralelo])

  // Cargar lista de instructores
  useEffect(() => {
    const fetchInstructores = async () => {
      setLoadingInstructores(true)
      try {
        const { data } = await api.get("/admin/instructores")
        setInstructores(data.instructores || [])
      } catch (err) {
        console.error("Error al cargar instructores:", err)
        setError("No se pudieron cargar los instructores. Por favor, intenta de nuevo.")
      } finally {
        setLoadingInstructores(false)
      }
    }

    fetchInstructores()
  }, [])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validaciones básicas
      if (
        !formData.codigo_paralelo ||
        !formData.nombre_paralelo ||
        !formData.instructor_id ||
        !formData.fecha_inicio ||
        !formData.fecha_fin
      ) {
        throw new Error("Por favor, completa todos los campos requeridos")
      }

      // Validación de fechas
      if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de finalización")
      }

      // Crear o actualizar paralelo
      if (isEditing) {
        await api.put(`/admin/paralelos/${paralelo.id}`, formData)
        setSuccess(true)
        setTimeout(() => {
          router.push(`/admin/cursos/${cursoId}/paralelos`)
        }, 1500)
      } else {
        await api.post(`/admin/cursos/${cursoId}/paralelos`, formData)
        console.log("Paralelo creado",formData)
        router.push(`/admin/cursos/${cursoId}/paralelos`)
      }
    } catch (err) {
      console.error("Error al guardar paralelo:", err)
      setError(err.response?.data?.error || err.message || "Error al guardar el paralelo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Editar Paralelo" : "Nuevo Paralelo"}</h2>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      {success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">Paralelo actualizado correctamente</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="codigo_paralelo"
              value={formData.codigo_paralelo}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre_paralelo"
              value={formData.nombre_paralelo}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor <span className="text-red-500">*</span>
            </label>
            <select
              name="instructor_id"
              value={formData.instructor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
              disabled={loadingInstructores}
            >
              <option value="">Seleccionar instructor</option>
              {instructores.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.nombre} {instructor.apellido}
                </option>
              ))}
            </select>
            {loadingInstructores && <p className="text-xs text-gray-500 mt-1">Cargando instructores...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de estudiantes <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="max_estudiantes"
              value={formData.max_estudiantes}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
                required
              />
              
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de finalización <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horario <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="horario"
              value={formData.horario}
              onChange={handleChange}
              placeholder="Ej: Lunes y Miércoles 18:00-20:00"
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aula</label>
            <input
              type="text"
              name="aula"
              value={formData.aula}
              onChange={handleChange}
              placeholder="Número o nombre del aula"
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            >
              <option value="planificado">Planificado</option>
              <option value="en_progreso">En progreso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
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