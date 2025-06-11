"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  FaEdit,
  FaArrowLeft,
  FaUsers,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaChalkboardTeacher,
  FaPlus,
  FaEye,
} from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function ParaleloDetail({ paralelo: initialParalelo }) {
  const router = useRouter()
  const [paralelo, setParalelo] = useState(initialParalelo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("info")

  const fetchParaleloData = async () => {
    if (!initialParalelo?.id) {
      console.error("No se puede cargar el paralelo: ID no válido", initialParalelo)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/admin/paralelos/${initialParalelo.id}`)
      if (!data || Object.keys(data).length === 0) {
        console.error("API devolvió datos vacíos o inválidos", data)
        setError("La API devolvió datos vacíos o inválidos. Por favor, intenta de nuevo.")
        return
      }

      setParalelo((prevParalelo) => ({
        ...prevParalelo,
        ...data,
        nombre_paralelo: data.nombre_paralelo || prevParalelo.nombre_paralelo,
        codigo_paralelo: data.codigo_paralelo || prevParalelo.codigo_paralelo,
        estudiantes: data.estudiantes?.length > 0 ? data.estudiantes : prevParalelo.estudiantes || [],
        asistencias: data.asistencias?.length > 0 ? data.asistencias : prevParalelo.asistencias || [],
      }))
    } catch (err) {
      console.error("Error al cargar datos del paralelo:", err)
      setError("Error al cargar los datos del paralelo. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialParalelo && Object.keys(initialParalelo).length > 0) {
      if (!paralelo || Object.keys(paralelo).length === 0) {
        setParalelo(initialParalelo)
      }

      if (initialParalelo.id) {
        fetchParaleloData()
      }
    }
  }, [initialParalelo])

  const getEstadoBadgeClass = (estado) => {
    if (!estado) return "bg-gray-100 text-gray-800"

    switch (estado.toLowerCase()) {
      case "planificado":
        return "bg-yellow-100 text-yellow-800"
      case "en_progreso":
        return "bg-green-100 text-green-800"
      case "completado":
        return "bg-blue-100 text-blue-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getModalidadBadgeClass = (modalidad) => {
    if (!modalidad) return "bg-gray-100 text-gray-800"

    switch (modalidad.toLowerCase()) {
      case "presencial":
        return "bg-blue-100 text-blue-800"
      case "virtual":
        return "bg-purple-100 text-purple-800"
      case "hibrido":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading && !paralelo) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium">Error</h3>
        <p>{error}</p>
        <button
          onClick={fetchParaleloData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const paraleloData = paralelo || initialParalelo || {}

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Encabezado */}
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {paraleloData.nombre_paralelo || "Paralelo sin nombre"}
              </h1>
              <p className="text-gray-600">{paraleloData.curso_nombre || "Curso desconocido"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/paralelos/${paraleloData.id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaEdit /> Editar
            </button>
            <button
              onClick={() => router.push(`/admin/paralelos/${paraleloData.id}/estudiantes`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FaUsers /> Estudiantes
            </button>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "info"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab("estudiantes")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "estudiantes"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Estudiantes
          </button>
          <button
            onClick={() => setActiveTab("asistencias")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "asistencias"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Asistencias
          </button>
          <button
            onClick={() => setActiveTab("calificaciones")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "calificaciones"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Calificaciones
          </button>
        </nav>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Detalles del Paralelo</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <FaChalkboardTeacher className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Instructor</p>
                      <p className="font-medium">
                        {paraleloData.instructor_nombre} {paraleloData.instructor_apellido}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <FaCalendarAlt className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fechas</p>
                      <p className="font-medium">
                        {paraleloData.fecha_inicio ? formatDate(paraleloData.fecha_inicio) : "Sin fecha"} -
                        {paraleloData.fecha_fin ? formatDate(paraleloData.fecha_fin) : "Sin fecha"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <FaClock className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium">{paraleloData.horario || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <FaMapMarkerAlt className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="font-medium">{paraleloData.ubicacion || "No especificada"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Descripción</h2>
                <p className="text-gray-700 whitespace-pre-line">{paraleloData.descripcion || "Sin descripción"}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Estado y Capacidad</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(paraleloData.estado)}`}
                    >
                      {paraleloData.estado ? paraleloData.estado.replace("_", " ") : "Sin estado"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Modalidad</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getModalidadBadgeClass(paraleloData.modalidad)}`}
                    >
                      {paraleloData.modalidad || "No especificada"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Capacidad</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-ciscoBlue h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, ((paraleloData.total_inscritos || 0) / (paraleloData.max_estudiantes || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {paraleloData.total_inscritos || 0}/{paraleloData.max_estudiantes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Estadísticas</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-500 mb-1">Asistencia Promedio</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {paraleloData.estadisticas?.asistencia_promedio || 0}%
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-500 mb-1">Calificación Promedio</p>
                    <p className="text-2xl font-bold text-green-700">
                      {paraleloData.estadisticas?.calificacion_promedio || 0}/100
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-500 mb-1">Aprobados</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {paraleloData.estadisticas?.total_aprobados || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-500 mb-1">Reprobados</p>
                    <p className="text-2xl font-bold text-red-700">
                      {paraleloData.estadisticas?.total_reprobados || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "estudiantes" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-800">Estudiantes Inscritos</h2>
              <button
                onClick={() => router.push(`/admin/paralelos/${paraleloData.id}/estudiantes/nuevo`)}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                <FaPlus /> Añadir Estudiante
              </button>
            </div>

            {paraleloData.estudiantes && paraleloData.estudiantes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estudiante
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha Inscripción
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Asistencia
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Calificación
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paraleloData.estudiantes.map((estudiante) => (
                      <tr key={estudiante.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {estudiante.nombre} {estudiante.apellido}
                              </div>
                              <div className="text-xs text-gray-500">{estudiante.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(estudiante.fecha_inscripcion)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              estudiante.estado === "activa"
                                ? "bg-green-100 text-green-800"
                                : estudiante.estado === "completada"
                                  ? "bg-blue-100 text-blue-800"
                                  : estudiante.estado === "cancelada"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {estudiante.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{estudiante.asistencia || 0}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{estudiante.calificacion || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/academico/inscripciones/${estudiante.inscripcion_id}`)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="ver detalles de inscripción"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay estudiantes inscritos en este paralelo
              </div>
            )}
          </div>
        )}

        {activeTab === "asistencias" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Registro de Asistencias</h2>

            {paraleloData.asistencias && paraleloData.asistencias.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tema
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Asistencia
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paraleloData.asistencias.map((asistencia) => (
                      <tr key={asistencia.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(asistencia.fecha)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{asistencia.tema}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{asistencia.porcentaje_asistencia}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-ciscoBlue h-1.5 rounded-full"
                              style={{ width: `${asistencia.porcentaje_asistencia}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/asistencias/${asistencia.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay registros de asistencia para este paralelo
              </div>
            )}
          </div>
        )}

        {activeTab === "calificaciones" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Calificaciones</h2>

            {paraleloData.calificaciones && paraleloData.calificaciones.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estudiante
                      </th>
                      {paraleloData.evaluaciones &&
                        paraleloData.evaluaciones.map((evaluacion) => (
                          <th
                            key={evaluacion.id}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {evaluacion.nombre}
                          </th>
                        ))}
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Final
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paraleloData.calificaciones.map((calificacion) => (
                      <tr key={calificacion.estudiante_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {calificacion.estudiante_nombre} {calificacion.estudiante_apellido}
                          </div>
                        </td>
                        {paraleloData.evaluaciones &&
                          paraleloData.evaluaciones.map((evaluacion) => {
                            const nota = calificacion.notas.find((n) => n.evaluacion_id === evaluacion.id)
                            return (
                              <td key={evaluacion.id} className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{nota ? nota.valor : "N/A"}</div>
                              </td>
                            )
                          })}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{calificacion.nota_final || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              calificacion.aprobado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {calificacion.aprobado ? "Aprobado" : "Reprobado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay calificaciones registradas para este paralelo
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
