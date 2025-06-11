"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { FaChartBar, FaTrophy, FaFileAlt, FaCalendarAlt } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function EstudianteCalificaciones() {
  const searchParams = useSearchParams()
  const cursoIdParam = searchParams.get("cursoId")

  const [calificaciones, setCalificaciones] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [promediosPorCurso, setPromediosPorCurso] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState("")
  const [cursoSeleccionado, setCursoSeleccionado] = useState(cursoIdParam || "")

  useEffect(() => {
    fetchCalificaciones()
  }, [cursoSeleccionado])

  const fetchCalificaciones = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (cursoSeleccionado) {
        params.append("cursoId", cursoSeleccionado)
      }

      const { data } = await api.get(`/estudiante/calificaciones?${params}`)
      setCalificaciones(data.calificaciones)
      setEstadisticas(data.estadisticas)
      setPromediosPorCurso(data.promediosPorCurso)
    } catch (err) {
      console.error("Error al cargar calificaciones:", err)
      setError("Error al cargar las calificaciones")
    } finally {
      setLoading(false)
    }
  }

  const getTipoEvaluacionBadge = (tipo) => {
    const badges = {
      examen: "bg-red-100 text-red-800",
      tarea: "bg-blue-100 text-blue-800",
      proyecto: "bg-purple-100 text-purple-800",
      laboratorio: "bg-green-100 text-green-800",
    }
    return badges[tipo] || "bg-gray-100 text-gray-800"
  }

  const getCalificacionColor = (puntuacion, valorMaximo) => {
    const porcentaje = (puntuacion / valorMaximo) * 100
    if (porcentaje >= 90) return "text-green-600 font-bold"
    if (porcentaje >= 80) return "text-blue-600 font-semibold"
    if (porcentaje >= 70) return "text-yellow-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  const calificacionesFiltradas = calificaciones.filter((cal) => !filtroTipo || cal.evaluacion_tipo === filtroTipo)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Calificaciones</h1>
          <p className="text-gray-600">Revisa tu rendimiento académico y progreso en evaluaciones</p>
        </div>

        {/* Estadísticas Generales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio General</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.promedio_general}</p>
                </div>
                <FaChartBar className="text-blue-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Evaluaciones Aprobadas</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.evaluaciones_aprobadas}</p>
                </div>
                <FaTrophy className="text-green-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Evaluaciones Reprobadas</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.evaluaciones_reprobadas}</p>
                </div>
                <FaFileAlt className="text-red-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.total_evaluaciones}</p>
                </div>
                <FaCalendarAlt className="text-purple-500 text-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Promedios por Curso */}
        {promediosPorCurso.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Promedios por Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promediosPorCurso.map((curso) => (
                <div key={curso.curso_id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{curso.curso_nombre}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio:</span>
                    <span
                      className={`text-lg font-bold ${curso.promedio_curso >= 7 ? "text-green-600" : "text-red-600"}`}
                    >
                      {curso.promedio_curso}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Evaluaciones:</span>
                    <span className="text-sm text-gray-900">{curso.total_evaluaciones}</span>
                  </div>
                  {curso.calificacion_final && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Nota Final:</span>
                      <span
                        className={`text-sm font-semibold ${curso.calificacion_final >= 7 ? "text-green-600" : "text-red-600"}`}
                      >
                        {curso.calificacion_final}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por curso:</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
              >
                <option value="">Todos los cursos</option>
                {promediosPorCurso.map((curso) => (
                  <option key={curso.curso_id} value={curso.curso_id}>
                    {curso.curso_nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de evaluación:</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="examen">Exámenes</option>
                <option value="tarea">Tareas</option>
                <option value="proyecto">Proyectos</option>
                <option value="laboratorio">Laboratorios</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Calificaciones */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchCalificaciones}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : calificacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay calificaciones disponibles</h3>
            <p className="text-gray-600">
              Las calificaciones aparecerán aquí una vez que sean publicadas por tus instructores
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evaluación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calificación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comentarios
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calificacionesFiltradas.map((calificacion) => (
                    <tr key={calificacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{calificacion.evaluacion_nombre}</div>
                          <div className="text-sm text-gray-500">{calificacion.modulo_titulo}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{calificacion.curso_nombre}</div>
                        <div className="text-sm text-gray-500">{calificacion.nombre_paralelo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoEvaluacionBadge(calificacion.evaluacion_tipo)}`}
                        >
                          {calificacion.evaluacion_tipo.charAt(0).toUpperCase() + calificacion.evaluacion_tipo.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className={getCalificacionColor(calificacion.puntuacion, calificacion.valor_maximo)}>
                            {calificacion.puntuacion} / {calificacion.valor_maximo}
                          </span>
                          <div className="text-xs text-gray-500">
                            {Math.round((calificacion.puntuacion / calificacion.valor_maximo) * 100)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(calificacion.fecha_calificacion)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {calificacion.comentarios || "Sin comentarios"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
