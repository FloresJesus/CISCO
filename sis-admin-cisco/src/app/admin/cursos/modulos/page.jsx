"use client"

import { useState, useEffect } from "react"
import { FiBook, FiPlus, FiEdit3, FiTrash2, FiFilter, FiClock } from "react-icons/fi"
import api from "@/libs/api"

export default function ModulosPage() {
  const [loading, setLoading] = useState(false)
  const [modulos, setModulos] = useState([])
  const [cursos, setCursos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingModulo, setEditingModulo] = useState(null)
  const [filtros, setFiltros] = useState({
    curso_id: "",
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadModulos()
  }, [filtros])

  const loadInitialData = async () => {
    try {
      const response = await api.get("/admin/cursos")
      setCursos(response.data.cursos || [])
    } catch (error) {
      console.error("Error loading courses:", error)
    }
  }

  const loadModulos = async () => {
    setLoading(true)
    try {
      const response = await api.get("/admin/cursos/modulos", { params: filtros })
      setModulos(response.data.data || [])
    } catch (error) {
      console.error("Error loading modulos:", error)
      setError("Error al cargar módulos")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)

      if (editingModulo) {
        await api.put(`/admin/cursos/modulos/${editingModulo.id}`, formData)
      } else {
        await api.post("/admin/cursos/modulos", formData)
      }

      await loadModulos()
      setShowModal(false)
      setEditingModulo(null)
      setError(null)
    } catch (error) {
      console.error("Error saving modulo:", error)
      setError(error.response?.data?.error || "Error al guardar módulo")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este módulo?")) return

    try {
      setLoading(true)
      await api.delete(`/admin/cursos/modulos/${id}`)
      await loadModulos()
      setError(null)
    } catch (error) {
      console.error("Error deleting modulo:", error)
      setError("Error al eliminar módulo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
              <FiBook className="h-8 w-8 text-ciscoBlue" />
              Gestión de Módulos
            </h1>
            <p className="text-gray-600 mt-2">Administra el contenido y estructura de los cursos</p>
          </div>
          <button
            onClick={() => {
              setEditingModulo(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-ciscoBlue text-white rounded-md hover:bg-ciscoDarkBlue"
          >
            <FiPlus className="h-4 w-4" />
            Nuevo Módulo
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                value={filtros.curso_id}
                onChange={(e) => setFiltros((prev) => ({ ...prev, curso_id: e.target.value }))}
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
            <div className="flex items-end">
              <button
                onClick={() => setFiltros({ curso_id: "" })}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Módulos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Módulos de Cursos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Módulo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluaciones
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ciscoBlue mx-auto"></div>
                    </td>
                  </tr>
                ) : modulos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No se encontraron módulos
                    </td>
                  </tr>
                ) : (
                  modulos.map((modulo) => (
                    <tr key={modulo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{modulo.titulo}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{modulo.descripcion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{modulo.curso_nombre}</div>
                        <div className="text-sm text-gray-500">{modulo.curso_codigo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">{modulo.orden}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FiClock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{modulo.duracion_horas}h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {modulo.total_evaluaciones}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingModulo(modulo)
                              setShowModal(true)
                            }}
                            className="text-ciscoBlue hover:text-ciscoDarkBlue p-1"
                            title="Editar módulo"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(modulo.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Eliminar módulo"
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

        {/* Modal para crear/editar módulo */}
        {showModal && (
          <ModuloModal
            modulo={editingModulo}
            cursos={cursos}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowModal(false)
              setEditingModulo(null)
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}

// Componente Modal para crear/editar módulos
function ModuloModal({ modulo, cursos, onSubmit, onClose, loading }) {
  const [formData, setFormData] = useState({
    curso_id: modulo?.curso_id || "",
    titulo: modulo?.titulo || "",
    descripcion: modulo?.descripcion || "",
    orden: modulo?.orden || 1,
    duracion_horas: modulo?.duracion_horas || 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">{modulo ? "Editar Módulo" : "Crear Nuevo Módulo"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso *</label>
              <select
                value={formData.curso_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, curso_id: e.target.value }))}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              >
                <option value="">Seleccionar curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título del Módulo *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input
                type="number"
                min="1"
                value={formData.orden}
                onChange={(e) => setFormData((prev) => ({ ...prev, orden: Number.parseInt(e.target.value) }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.duracion_horas}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duracion_horas: Number.parseFloat(e.target.value) }))
                }
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
              className="px-4 py-2 bg-ciscoBlue text-white rounded-md text-sm font-medium hover:bg-ciscoDarkBlue disabled:opacity-50"
            >
              {loading ? "Guardando..." : modulo ? "Actualizar" : "Crear"} Módulo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
