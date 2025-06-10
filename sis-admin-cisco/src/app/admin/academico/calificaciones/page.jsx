"use client"

import { useState, useEffect } from "react"
import {
  FiEdit3,
  FiSave,
  FiX,
  FiFilter,
  FiDownload,
  FiFileText,
  FiAward,
  FiUsers,
  FiBookOpen,
  FiTrendingUp,
} from "react-icons/fi"
import { formatDate } from "@/libs/utils"
import api from "@/libs/api"

export default function CalificacionesPage() {
  const [loading, setLoading] = useState(false)
  const [calificaciones, setCalificaciones] = useState([])
  const [cursos, setCursos] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [editingGrade, setEditingGrade] = useState(null)
  const [filtros, setFiltros] = useState({
    curso_id: "",
    estudiante_id: "",
    estado: "",
    fecha_inicio: "",
    fecha_fin: "",
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (cursos.length > 0) {
      loadCalificaciones()
    }
  }, [filtros, cursos])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [cursosRes, estudiantesRes, estadisticasRes] = await Promise.all([
        api.get("/admin/cursos"),
        api.get("/admin/estudiantes"),
        api.get("/admin/calificaciones/estadisticas"),
      ])

      setCursos(cursosRes.data.cursos || [])
      setEstudiantes(estudiantesRes.data.estudiantes || [])
      setEstadisticas(estadisticasRes.data.data || {})
    } catch (error) {
      console.error("Error loading initial data:", error)
      setError("Error al cargar datos iniciales")
    } finally {
      setLoading(false)
    }
  }

  const loadCalificaciones = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filtros).forEach((key) => {
        if (filtros[key]) {
          params.append(key, filtros[key])
        }
      })

      const response = await api.get(`/admin/calificaciones?${params.toString()}`)
      setCalificaciones(response.data.data || [])
    } catch (error) {
      console.error("Error loading calificaciones:", error)
      setError("Error al cargar calificaciones")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }))
  }

  const startEditing = (calificacion) => {
    setEditingGrade({
      ...calificacion,
      nueva_calificacion: calificacion.calificacion_final || "",
    })
  }

  const cancelEditing = () => {
    setEditingGrade(null)
  }

  const saveGrade = async () => {
    if (!editingGrade) return

    try {
      setLoading(true)
      await api.put(`/admin/calificaciones/${editingGrade.inscripcion_id}`, {
        calificacion_final: Number.parseFloat(editingGrade.nueva_calificacion),
      })

      await loadCalificaciones()
      setEditingGrade(null)
    } catch (error) {
      console.error("Error saving grade:", error)
      setError("Error al guardar calificación")
    } finally {
      setLoading(false)
    }
  }

  const exportGrades = async (format) => {
    try {
      const params = new URLSearchParams()
      Object.keys(filtros).forEach((key) => {
        if (filtros[key]) {
          params.append(key, filtros[key])
        }
      })

      const response = await api.get(`/admin/calificaciones/export?format=${format}&${params.toString()}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `calificaciones.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting grades:", error)
      setError("Error al exportar calificaciones")
    }
  }

  const getGradeColor = (grade) => {
    if (grade >= 85) return "text-green-600 bg-green-50"
    if (grade >= 70) return "text-blue-600 bg-blue-50"
    if (grade >= 51) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getGradeLabel = (grade) => {
    if (grade >= 85) return "Excelente"
    if (grade >= 70) return "Bueno"
    if (grade >= 51) return "Regular"
    return "Reprobado"
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
              <FiAward className="h-8 w-8 text-ciscoBlue" />
              Gestión de Calificaciones
            </h1>
            <p className="text-gray-600 mt-2">Administra y supervisa las calificaciones de los estudiantes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportGrades("excel")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
            >
              <FiDownload className="h-4 w-4" />
              Excel
            </button>
            <button
              onClick={() => exportGrades("pdf")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
            >
              <FiFileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setError(null)}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-ciscoBlue to-ciscoDarkBlue px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Total Estudiantes</h3>
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                <FiUsers className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-2xl font-bold text-dark">{estadisticas.total_estudiantes || 0}</div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-500">Con calificaciones</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Promedio General</h3>
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                <FiTrendingUp className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.promedio_general ? Number(estadisticas.promedio_general).toFixed(1) : "0.0"}
              </div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-500">Todas las materias</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-animate to-ciscoBlue px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Tasa Aprobación</h3>
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                <FiAward className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-2xl font-bold text-dark">
                {estadisticas.tasa_aprobacion ? `${Number(estadisticas.tasa_aprobacion).toFixed(1)}%` : "0%"}
              </div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-500">Calificación ≥ 51</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-accent to-amber-500 px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Cursos Activos</h3>
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                <FiBookOpen className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-2xl font-bold text-dark">{estadisticas.cursos_activos || 0}</div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-500">En progreso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark flex items-center gap-2">
              <FiFilter className="w-5 h-5" />
              Filtros
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                <select
                  value={filtros.curso_id}
                  onChange={(e) => handleFilterChange("curso_id", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                <select
                  value={filtros.estudiante_id}
                  onChange={(e) => handleFilterChange("estudiante_id", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                >
                  <option value="">Todos los estudiantes</option>
                  {estudiantes.map((estudiante) => (
                    <option key={estudiante.id} value={estudiante.id}>
                      {estudiante.nombre} {estudiante.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFilterChange("estado", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                >
                  <option value="">Todos los estados</option>
                  <option value="activa">Activa</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input
                  type="date"
                  value={filtros.fecha_inicio}
                  onChange={(e) => handleFilterChange("fecha_inicio", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() =>
                    setFiltros({ curso_id: "", estudiante_id: "", estado: "", fecha_inicio: "", fecha_fin: "" })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Calificaciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Calificaciones de Estudiantes</h3>
            <p className="text-sm text-gray-600">Gestiona las calificaciones finales de los cursos</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paralelo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inscripción
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
                ) : calificaciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No se encontraron calificaciones
                    </td>
                  </tr>
                ) : (
                  calificaciones.map((calificacion) => (
                    <tr key={calificacion.inscripcion_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {calificacion.estudiante_nombre} {calificacion.estudiante_apellido}
                          </div>
                          <div className="text-sm text-gray-500">{calificacion.estudiante_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{calificacion.curso_nombre}</div>
                        <div className="text-sm text-gray-500">{calificacion.curso_codigo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {calificacion.paralelo_nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editingGrade && editingGrade.inscripcion_id === calificacion.inscripcion_id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              value={editingGrade.nueva_calificacion}
                              onChange={(e) =>
                                setEditingGrade((prev) => ({ ...prev, nueva_calificacion: e.target.value }))
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                            />
                            <button onClick={saveGrade} className="p-1 text-green-600 hover:text-green-800">
                              <FiSave className="h-4 w-4" />
                            </button>
                            <button onClick={cancelEditing} className="p-1 text-red-600 hover:text-red-800">
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            {calificacion.calificacion_final ? (
                              <>
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(calificacion.calificacion_final)}`}
                                >
                                  {Number(calificacion.calificacion_final).toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                  {getGradeLabel(calificacion.calificacion_final)}
                                </span>
                              </>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                Sin calificar
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            calificacion.estado === "activa"
                              ? "bg-blue-100 text-blue-800"
                              : calificacion.estado === "completada"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {calificacion.estado.charAt(0).toUpperCase() + calificacion.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {formatDate(calificacion.fecha_inscripcion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => startEditing(calificacion)}
                          className="text-ciscoBlue hover:text-ciscoDarkBlue p-1"
                          title="Editar calificación"
                        >
                          <FiEdit3 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
