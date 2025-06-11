"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaEdit, FaArrowLeft, FaUserGraduate, FaBook, FaCalendarAlt, FaCreditCard, FaFileAlt } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate, formatCurrency } from "@/libs/utils"

// Función helper para formatear números de forma segura
const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return "0"
  const num = typeof value === "number" ? value : Number.parseFloat(value)
  return isNaN(num) ? "0" : num.toFixed(decimals)
}

export default function InscripcionDetail({ inscripcion: initialInscripcion }) {
  const router = useRouter()
  const [inscripcion, setInscripcion] = useState(initialInscripcion)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("info")

  const fetchInscripcionData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/admin/inscripciones/${initialInscripcion.id}`)
      console.log("Datos de inscripción cargados:", data)
      setInscripcion(data)
    } catch (err) {
      console.error("Error al cargar datos de la inscripción:", err)
      setError("Error al cargar los datos de la inscripción. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInscripcionData()
  }, [initialInscripcion.id])

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "completada":
        return "bg-green-100 text-green-800"
      case "activa":
        return "bg-blue-100 text-blue-800"
      case "suspendida":
        return "bg-yellow-100 text-yellow-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading && !inscripcion) {
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
          onClick={fetchInscripcionData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-gray-800">
              Inscripción #{inscripcion.id} - {inscripcion.estudiante_nombre}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/academico/inscripciones/${inscripcion.id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaEdit /> Editar
            </button>
            {inscripcion.estado === "completada" && (
              <button
                onClick={() => router.push(`/admin/academico/inscripciones/${inscripcion.id}/certificado`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <FaFileAlt /> Certificado
              </button>
            )}
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
            onClick={() => setActiveTab("pagos")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "pagos"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Pagos
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
          <button
            onClick={() => setActiveTab("asistencia")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "asistencia"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Asistencia
          </button>
        </nav>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Estudiante */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FaUserGraduate className="mr-2 text-ciscoBlue" />
                Información del Estudiante
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="font-medium">{inscripcion.estudiante_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{inscripcion.estudiante_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{inscripcion.estudiante_telefono || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      inscripcion.estudiante_estado === "activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {inscripcion.estudiante_estado}
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => router.push(`/admin/usuarios/${inscripcion.usuario_id}`)}
                    className="text-sm text-ciscoBlue hover:text-ciscoDarkBlue"
                  >
                    Ver perfil completo del estudiante →
                  </button>
                </div>
              </div>
            </div>

            {/* Información del Curso */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FaBook className="mr-2 text-ciscoBlue" />
                Información del Curso
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre del Curso</p>
                  <p className="font-medium">{inscripcion.curso_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código del Curso</p>
                  <p className="font-medium">{inscripcion.curso_codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nivel</p>
                  <p className="font-medium">{inscripcion.curso_nivel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duración</p>
                  <p className="font-medium">{inscripcion.curso_duracion_semanas} semanas</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => router.push(`/admin/cursos/${inscripcion.curso_id}`)}
                    className="text-sm text-ciscoBlue hover:text-ciscoDarkBlue"
                  >
                    Ver detalles del curso →
                  </button>
                </div>
              </div>
            </div>

            {/* Información del Paralelo */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-ciscoBlue" />
                Información del Paralelo
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre del Paralelo</p>
                  <p className="font-medium">{inscripcion.paralelo_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código del Paralelo</p>
                  <p className="font-medium">{inscripcion.paralelo_codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Instructor</p>
                  <p className="font-medium">{inscripcion.instructor_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fechas</p>
                  <p className="font-medium">
                    {formatDate(inscripcion.fecha_inicio)} - {formatDate(inscripcion.fecha_fin)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="font-medium">{inscripcion.horario}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aula</p>
                  <p className="font-medium">{inscripcion.aula || "No asignada"}</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => router.push(`/admin/paralelos/${inscripcion.paralelo_id}`)}
                    className="text-sm text-ciscoBlue hover:text-ciscoDarkBlue"
                  >
                    Ver detalles del paralelo →
                  </button>
                </div>
              </div>
            </div>

            {/* Información de la Inscripción */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-ciscoBlue" />
                Información de la Inscripción
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">ID de Inscripción</p>
                  <p className="font-medium">{inscripcion.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Inscripción</p>
                  <p className="font-medium">{formatDate(inscripcion.fecha_inscripcion)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(
                      inscripcion.estado,
                    )}`}
                  >
                    {inscripcion.estado.charAt(0).toUpperCase() + inscripcion.estado.slice(1)}
                  </span>
                </div>
                {inscripcion.calificacion_final !== null && (
                  <div>
                    <p className="text-sm text-gray-500">Calificación Final</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        inscripcion.calificacion_final >= 7
                          ? "bg-green-100 text-green-800"
                          : inscripcion.calificacion_final >= 5
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {formatNumber(inscripcion.calificacion_final)}/10
                    </span>
                  </div>
                )}
                {inscripcion.certificado_generado && (
                  <div>
                    <p className="text-sm text-gray-500">Certificado</p>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Generado el {formatDate(inscripcion.certificado_fecha)}
                    </span>
                  </div>
                )}
                {inscripcion.observaciones && (
                  <div>
                    <p className="text-sm text-gray-500">Observaciones</p>
                    <p className="font-medium">{inscripcion.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "pagos" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Historial de Pagos</h2>
            {inscripcion.pagos && inscripcion.pagos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
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
                        Monto
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Método
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Referencia
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
                    {inscripcion.pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pago.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(pago.fecha_pago)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pago.monto)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pago.metodo_pago.charAt(0).toUpperCase() + pago.metodo_pago.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pago.referencia || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pago.estado === "completado"
                                ? "bg-green-100 text-green-800"
                                : pago.estado === "pendiente"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : pago.estado === "rechazado"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay pagos registrados para esta inscripción
              </div>
            )}

            {/* Botón para registrar nuevo pago */}
            {inscripcion.estado !== "completada" && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => router.push(`/admin/academico/inscripciones/${inscripcion.id}/pago`)}
                  className="px-4 py-2 bg-ciscoBlue text-white rounded-md hover:bg-ciscoDarkBlue"
                >
                  Registrar Pago
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "calificaciones" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Calificaciones del Estudiante</h2>
            {inscripcion.calificaciones && inscripcion.calificaciones.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Evaluación
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tipo
                      </th>
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
                        Calificación
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Comentarios
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inscripcion.calificaciones.map((calificacion) => (
                      <tr key={calificacion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {calificacion.evaluacion_nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calificacion.evaluacion_tipo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(calificacion.fecha_calificacion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                              calificacion.puntuacion >= 7
                                ? "bg-green-100 text-green-800"
                                : calificacion.puntuacion >= 5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {formatNumber(calificacion.puntuacion)}/{formatNumber(calificacion.valor_maximo)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calificacion.comentarios || "N/A"}
                        </td>
                      </tr>
                    ))}
                    {inscripcion.calificacion_final !== null && (
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CALIFICACIÓN FINAL</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                              inscripcion.calificacion_final >= 7
                                ? "bg-green-100 text-green-800"
                                : inscripcion.calificacion_final >= 5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {formatNumber(inscripcion.calificacion_final)}/10
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay calificaciones registradas para esta inscripción
              </div>
            )}

            {/* Botón para registrar nueva calificación */}
            {inscripcion.estado === "activa" && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => router.push(`/admin/academico/inscripciones/${inscripcion.id}/calificacion`)}
                  className="px-4 py-2 bg-ciscoBlue text-white rounded-md hover:bg-ciscoDarkBlue"
                >
                  Registrar Calificación
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "asistencia" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Registro de Asistencia</h2>
            {inscripcion.asistencias && inscripcion.asistencias.length > 0 ? (
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
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Observaciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inscripcion.asistencias.map((asistencia) => (
                      <tr key={asistencia.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(asistencia.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              asistencia.estado === "presente"
                                ? "bg-green-100 text-green-800"
                                : asistencia.estado === "tardanza"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : asistencia.estado === "justificado"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {asistencia.estado.charAt(0).toUpperCase() + asistencia.estado.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asistencia.observaciones || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay registros de asistencia para esta inscripción
              </div>
            )}

            {/* Resumen de asistencia */}
            {inscripcion.resumen_asistencia && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-md font-medium text-gray-800 mb-3">Resumen de Asistencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-md border">
                    <p className="text-sm text-gray-500">Total Clases</p>
                    <p className="text-xl font-bold">{inscripcion.resumen_asistencia.total_clases}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border">
                    <p className="text-sm text-gray-500">Presentes</p>
                    <p className="text-xl font-bold text-green-600">{inscripcion.resumen_asistencia.presentes}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border">
                    <p className="text-sm text-gray-500">Tardanzas</p>
                    <p className="text-xl font-bold text-yellow-600">{inscripcion.resumen_asistencia.tardanzas}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border">
                    <p className="text-sm text-gray-500">Ausencias</p>
                    <p className="text-xl font-bold text-red-600">{inscripcion.resumen_asistencia.ausencias}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón para registrar asistencia */}
            {inscripcion.estado === "activa" && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => router.push(`/admin/academico/inscripciones/${inscripcion.id}/asistencia`)}
                  className="px-4 py-2 bg-ciscoBlue text-white rounded-md hover:bg-ciscoDarkBlue"
                >
                  Registrar Asistencia
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
