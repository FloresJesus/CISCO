"use client"
import { useState, useEffect } from "react"
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function EstudianteAsistencias() {
  const [asistencias, setAsistencias] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [asistenciaPorCurso, setAsistenciaPorCurso] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroMes, setFiltroMes] = useState("")
  const [filtroAño, setFiltroAño] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    fetchAsistencias()
  }, [filtroMes, filtroAño])

  const fetchAsistencias = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filtroMes) params.append("mes", filtroMes)
      if (filtroAño) params.append("año", filtroAño)

      const { data } = await api.get(`/estudiante/asistencias?${params}`)
      setAsistencias(data.asistencias)
      setEstadisticas(data.estadisticas)
      setAsistenciaPorCurso(data.asistenciaPorCurso)
    } catch (err) {
      console.error("Error al cargar asistencias:", err)
      setError("Error al cargar las asistencias")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "presente":
        return <FaCheckCircle className="text-green-500" />
      case "ausente":
        return <FaTimesCircle className="text-red-500" />
      case "justificado":
        return <FaExclamationTriangle className="text-yellow-500" />
      case "tardanza":
        return <FaClock className="text-orange-500" />
      default:
        return <FaTimesCircle className="text-gray-500" />
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      presente: "bg-green-100 text-green-800",
      ausente: "bg-red-100 text-red-800",
      justificado: "bg-yellow-100 text-yellow-800",
      tardanza: "bg-orange-100 text-orange-800",
    }
    return badges[estado] || "bg-gray-100 text-gray-800"
  }

  const meses = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Asistencias</h1>
          <p className="text-gray-600">Revisa tu historial de asistencias y puntualidad</p>
        </div>

        {/* Estadísticas Generales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Asistencia General</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.porcentaje_general}%</p>
                </div>
                <FaCalendarAlt className="text-blue-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clases Asistidas</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.clases_asistidas}</p>
                </div>
                <FaCheckCircle className="text-green-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faltas</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.clases_ausentes}</p>
                </div>
                <FaTimesCircle className="text-red-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tardanzas</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.tardanzas}</p>
                </div>
                <FaClock className="text-orange-500 text-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Asistencia por Curso */}
        {asistenciaPorCurso.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Asistencia por Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asistenciaPorCurso.map((curso) => (
                <div key={curso.curso_id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{curso.curso_nombre}</h3>
                  <p className="text-sm text-gray-600 mb-3">{curso.nombre_paralelo}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Asistencia:</span>
                    <span
                      className={`text-lg font-bold ${curso.porcentaje_asistencia >= 80 ? "text-green-600" : curso.porcentaje_asistencia >= 70 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {curso.porcentaje_asistencia}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Clases:</span>
                    <span className="text-sm text-gray-900">
                      {curso.clases_asistidas} / {curso.total_clases}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full ${curso.porcentaje_asistencia >= 80 ? "bg-green-500" : curso.porcentaje_asistencia >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${curso.porcentaje_asistencia}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mes:</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
              >
                <option value="">Todos los meses</option>
                {meses.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Año:</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtroAño}
                onChange={(e) => setFiltroAño(e.target.value)}
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Asistencias */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchAsistencias}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : asistencias.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay registros de asistencia</h3>
            <p className="text-gray-600">
              Los registros de asistencia aparecerán aquí una vez que comiences a asistir a clases
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {asistencias.map((asistencia) => (
                    <tr key={asistencia.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(asistencia.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{asistencia.curso_nombre}</div>
                        <div className="text-sm text-gray-500">{asistencia.nombre_paralelo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asistencia.horario}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(asistencia.estado)}
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(asistencia.estado)}`}
                          >
                            {asistencia.estado.charAt(0).toUpperCase() + asistencia.estado.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{asistencia.observaciones || "-"}</td>
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
