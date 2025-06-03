"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSave, FaArrowLeft, FaSpinner } from "react-icons/fa"
import api from "@/libs/api"

export default function ModuloForm({ moduloId = null }) {
  const router = useRouter()
  const isEditing = !!moduloId

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    curso_id: "",
    orden: 1,
    duracion_horas: 0,
    objetivos: "",
    contenido: "",
    recursos: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [cursos, setCursos] = useState([])

  useEffect(() => {
    // Cargar cursos
    const fetchCursos = async () => {
      try {
        const response = await api.get("/api/admin/cursos")
        setCursos(response.data)
      } catch (err) {
        console.error("Error al cargar cursos:", err)
        setError("Error al cargar los cursos. Por favor, intenta de nuevo.")
      }
    }

    fetchCursos()

    // Si estamos editando, cargar datos del módulo
    if (isEditing) {
      const fetchModulo = async () => {
        setLoading(true)
        try {
          const response = await api.get(`/api/admin/modulos/${moduloId}`)
          setFormData(response.data)
        } catch (err) {
          console.error("Error al cargar módulo:", err)
          setError("Error al cargar los datos del módulo. Por favor, intenta de nuevo.")
        } finally {
          setLoading(false)
        }
      }

      fetchModulo()
    }
  }, [isEditing, moduloId])

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
      if (!formData.nombre || !formData.curso_id) {
        throw new Error("Por favor, completa los campos requeridos")
      }

      if (isEditing) {
        await api.put(`/api/admin/modulos/${moduloId}`, formData)
        setSuccess(true)
      } else {
        await api.post("/api/admin/modulos", formData)
        router.push("/admin/cursos/modulos")
      }
    } catch (err) {
      console.error("Error al guardar módulo:", err)
      setError(err.response?.data?.error || err.message || "Error al guardar el módulo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Editar Módulo" : "Nuevo Módulo"}</h2>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      {success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">Módulo actualizado correctamente</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Curso <span className="text-red-500">*</span>
            </label>
            <select
              name="curso_id"
              value={formData.curso_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="orden"
              value={formData.orden}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (horas) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duracion_horas"
              value={formData.duracion_horas}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos de Aprendizaje</label>
          <textarea
            name="objetivos"
            value={formData.objetivos}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
            placeholder="Enumera los objetivos de aprendizaje de este módulo"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
          <textarea
            name="contenido"
            value={formData.contenido}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
            placeholder="Detalla el contenido que se cubrirá en este módulo"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recursos</label>
          <textarea
            name="recursos"
            value={formData.recursos}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
            placeholder="Enlaces, documentos, videos u otros recursos para este módulo"
          ></textarea>
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
