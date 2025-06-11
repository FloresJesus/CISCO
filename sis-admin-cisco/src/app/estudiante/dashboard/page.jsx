"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaBook, FaCertificate, FaChartBar, FaDownload, FaEye, FaClock, FaCheckCircle } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function EstudianteDashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/estudiante/dashboard")
      setDashboardData(data)
    } catch (err) {
      console.error("Error al cargar dashboard:", err)
      setError("Error al cargar la información del dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { estudiante, estadisticas, cursosActivos, certificados, proximasEvaluaciones } = dashboardData

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido, {estudiante.nombre}!</h1>
          <p className="text-gray-600">Aquí tienes un resumen de tu progreso académico</p>
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cursos Inscritos</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.total_inscripciones}</p>
              </div>
              <FaBook className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.inscripciones_activas}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificados</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.certificados_obtenidos}</p>
              </div>
              <FaCertificate className="text-purple-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asistencia</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.porcentaje_asistencia}%</p>
              </div>
              <FaChartBar className="text-yellow-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cursos Activos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Mis Cursos</h2>
              <button
                onClick={() => router.push("/estudiante/cursos")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos →
              </button>
            </div>

            {cursosActivos.length > 0 ? (
              <div className="space-y-4">
                {cursosActivos.map((curso, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{curso.curso_nombre}</h3>
                        <p className="text-sm text-gray-600 mb-2">{curso.nombre_paralelo}</p>
                        <p className="text-xs text-gray-500">Instructor: {curso.instructor_nombre}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(curso.fecha_inicio)} - {formatDate(curso.fecha_fin)}
                          </span>
                          {curso.calificacion_final && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Nota: {curso.calificacion_final}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          curso.estado === "activa"
                            ? "bg-green-100 text-green-800"
                            : curso.estado === "completada"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {curso.estado === "activa"
                          ? "Activo"
                          : curso.estado === "completada"
                            ? "Completado"
                            : curso.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaBook className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>No tienes cursos activos</p>
                <button
                  onClick={() => router.push("/cursos")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Explorar Cursos
                </button>
              </div>
            )}
          </div>

          {/* Certificados */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Mis Certificados</h2>
              <button
                onClick={() => router.push("/estudiante/certificados")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos →
              </button>
            </div>

            {certificados.length > 0 ? (
              <div className="space-y-4">
                {certificados.slice(0, 3).map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{cert.curso_nombre}</h3>
                        <p className="text-sm text-gray-600">Emitido: {formatDate(cert.fecha_emision)}</p>
                        <p className="text-xs text-green-600 font-medium">Calificación: {cert.calificacion_final}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`/verificar-certificado/${cert.url_verificacion}`, "_blank")}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="Ver certificado"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => router.push(`/estudiante/certificados/${cert.url_verificacion}/download`)}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="Descargar"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaCertificate className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>No tienes certificados disponibles</p>
                <p className="text-sm mt-2">Completa tus cursos para obtener certificados</p>
              </div>
            )}
          </div>
        </div>

        {/* Próximas Evaluaciones */}
        {proximasEvaluaciones.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Próximas Evaluaciones</h2>
              <button
                onClick={() => router.push("/estudiante/evaluaciones")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proximasEvaluaciones.map((evaluacion, index) => (
                <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{evaluacion.evaluacion_nombre}</h3>
                      <p className="text-sm text-gray-600 mb-2">{evaluacion.curso_nombre}</p>
                      <p className="text-xs text-gray-500">{evaluacion.nombre_paralelo}</p>
                    </div>
                    <FaClock className="text-orange-500" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-orange-600 font-medium">
                      Fecha límite: {formatDate(evaluacion.fecha_limite)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
