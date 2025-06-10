"use client"

import { useState, useEffect } from "react"
import { FiClipboard, FiPlus, FiEdit3, FiTrash2, FiFilter, FiUsers } from "react-icons/fi"
import api from "@/libs/api"

export default function EvaluacionesPage() {
  const [loading, setLoading] = useState(false)
  const [evaluaciones, setEvaluaciones] = useState([])
  const [cursos, setCursos] = useState([])
  const [modulos, setModulos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingEvaluacion, setEditingEvaluacion] = useState(null)
  const [filtros, setFiltros] = useState({
    curso_id: "",
    modulo_id: "",
    tipo: "",
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadEvaluaciones()
  }, [filtros])

  useEffect(() => {
    if (filtros.curso_id) {
      loadModulosByCurso(filtros.curso_id)
    } else {
      setModulos([])
    }
  }, [filtros.curso_id])

  const loadInitialData = async () => {
    try {
      const response = await api.get("/admin/cursos")
      setCursos(response.data.cursos || [])
    } catch (error) {
      console.error("Error loading courses:", error)
    }
  }

  const loadModulosByCurso = async (cursoId) => {
    try {
      const response = await api.get("/admin/cursos/modulos", { params: { curso_id: cursoId } })
      setModulos(response.data.data || [])
    } catch (error) {
      console.error("Error loading modules:", error)
    }
  }

  const loadEvaluaciones = async () => {
    setLoading(true)
    try {
      const response = await api.get("/admin/cursos/evaluaciones", { params: filtros })
      setEvaluaciones(response.data.data || [])
    } catch (error) {
      console.error("Error loading evaluaciones:", error)
      setError("Error al cargar evaluaciones")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)

      if (editingEvaluacion) {
        await api.put(`/admin/cursos/evaluaciones/${editingEvaluacion.id}`, formData)
      } else {
        await api.post("/admin/cursos/evaluaciones", formData)
      }

      await loadEvaluaciones()
      setShowModal(false)
      setEditingEvaluacion(null)
      setError(null)
    } catch (error) {
      console.error("Error saving evaluacion:", error)
      setError(error.response?.data?.error || "Error al guardar evaluación")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta evaluación?")) return

    try {
      setLoading(true)
      await api.delete(`/admin/cursos/evaluaciones/${id}`)
      await loadEvaluaciones()
      setError(null)
    } catch (error) {
      console.error("Error deleting evaluacion:", error)
      setError("Error al eliminar evaluación")
    } finally {
      setLoading(false)
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "examen":
        return "bg-red-100 text-red-800"
      case "tarea":
        return "bg-green-100 text-green-800"
      case "proyecto":
        return "bg-purple-100 text-purple-800"
      case "laboratorio":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
              <FiClipboard className="h-8 w-8 text-accent" />
              Gestión de Evaluaciones
            </h1>
            <p className="text-gray-600 mt-2">Administra exámenes, tareas y proyectos de los módulos</p>
          </div>
          <button
            onClick={() => {
              setEditingEvaluacion(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-amber-600"
          >
            <FiPlus className="h-4 w-4" />
            Nueva Evaluación
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 underline text-sm mt-2">
              Cerrar
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-dark mb-4 flex items-center gap-2">
            <FiFilter className="w-5 h-5" />
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                value={filtros.curso_id}
                onChange={(e) => setFiltros((prev) => ({ ...prev, curso_id: e.target.value, modulo_id: "" }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              >
                <option value="">Todos los cursos</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
              <select
                value={filtros.modulo_id}
                onChange={(e) => setFiltros((prev) => ({ ...prev, modulo_id: e.target.value }))}
                disabled={!filtros.curso_id}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue disabled:bg-gray-100"
              >
                <option value="">Todos los módulos</option>
                {modulos.map((modulo) => (
                  <option key={modulo.id} value={modulo.id}>
                    {modulo.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros((prev) => ({ ...prev, tipo: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              >
                <option value="">Todos los tipos</option>
                <option value="examen">Examen</option>
                <option value="tarea">Tarea</option>
                <option value="proyecto">Proyecto</option>
                <option value="laboratorio">Laboratorio</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFiltros({ curso_id: "", modulo_id: "", tipo: "" })}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Evaluaciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Evaluaciones</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso/Módulo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Máximo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluados
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ciscoBlue mx-auto"></div>
                    </td>
                  </tr>
                ) : evaluaciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No se encontraron evaluaciones
                    </td>
                  </tr>
                ) : (
                  evaluaciones.map((evaluacion) => (
                    <tr key={evaluacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{evaluacion.nombre}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{evaluacion.descripcion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{evaluacion.curso_nombre}</div>
                        <div className="text-sm text-gray-500">{evaluacion.modulo_nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoColor(evaluacion.tipo)}`}
                        >
                          {evaluacion.tipo.charAt(0).toUpperCase() + evaluacion.tipo.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-600">{evaluacion.valor_maximo} pts</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FiUsers className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{evaluacion.estudiantes_evaluados}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-600">
                          {evaluacion.fecha_limite
                            ? new Date(evaluacion.fecha_limite).toLocaleDateString("es-ES")
                            : "Sin límite"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingEvaluacion(evaluacion)
                              setShowModal(true)
                            }}
                            className="text-ciscoBlue hover:text-ciscoDarkBlue p-1"
                            title="Editar evaluación"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(evaluacion.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Eliminar evaluación"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal para crear/editar evaluación */}
        {showModal && (
          <EvaluacionModal
            evaluacion={editingEvaluacion}
            modulos={modulos}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowModal(false)
              setEditingEvaluacion(null)
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}

// Componente Modal para crear/editar evaluaciones
function EvaluacionModal({ evaluacion, modulos, onSubmit, onClose, loading }) {
  const [formData, setFormData] = useState({
    modulo_id: evaluacion?.modulo_id || "",
    tipo: evaluacion?.tipo || "examen",
    nombre: evaluacion?.nombre || "",
    descripcion: evaluacion?.descripcion || "",
    valor_maximo: evaluacion?.valor_maximo || 100,
    fecha_publicacion: evaluacion?.fecha_publicacion
      ? new Date(evaluacion.fecha_publicacion).toISOString().split("T")[0]
      : "",
    fecha_limite: evaluacion?.fecha_limite ? new Date(evaluacion.fecha_limite).toISOString().split("T")[0] : "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">
            {evaluacion ? "Editar Evaluación" : "Crear Nueva Evaluación"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Módulo *</label>
              <select
                value={formData.modulo_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, modulo_id: e.target.value }))}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              >
                <option value="">Seleccionar módulo</option>
                {modulos.map((modulo) => (
                  <option key={modulo.id} value={modulo.id}>
                    {modulo.curso_nombre} - {modulo.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              >
                <option value="examen">Examen</option>
                <option value="tarea">Tarea</option>
                <option value="proyecto">Proyecto</option>
                <option value="laboratorio">Laboratorio</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Evaluación *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Máximo</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={formData.valor_maximo}
                onChange={(e) => setFormData((prev) => ({ ...prev, valor_maximo: Number.parseFloat(e.target.value) }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicación</label>
              <input
                type="date"
                value={formData.fecha_publicacion}
                onChange={(e) => setFormData((prev) => ({ ...prev, fecha_publicacion: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
              <input
                type="date"
                value={formData.fecha_limite}
                onChange={(e) => setFormData((prev) => ({ ...prev, fecha_limite: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "Guardando..." : evaluacion ? "Actualizar" : "Crear"} Evaluación
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
