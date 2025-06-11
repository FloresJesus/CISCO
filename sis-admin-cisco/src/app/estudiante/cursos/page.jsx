"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaBook, FaCalendarAlt, FaUser, FaChartBar, FaCertificate, FaEye, FaSearch } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function EstudianteCursos() {
  const router = useRouter()
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchCursos()
  }, [pagination.page, filtroEstado])

  const fetchCursos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      })

      if (filtroEstado) {
        params.append("estado", filtroEstado)
      }

      const { data } = await api.get(`/estudiante/cursos?${params}`)
      setCursos(data.cursos)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }))
    } catch (err) {
      console.error("Error al cargar cursos:", err)
      setError("Error al cargar los cursos")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      activa: "bg-green-100 text-green-800",
      completada: "bg-blue-100 text-blue-800",
      cancelada: "bg-red-100 text-red-800",
      suspendida: "bg-yellow-100 text-yellow-800",
    }
    return badges[estado] || "bg-gray-100 text-gray-800"
  }

  const getNivelBadge = (nivel) => {
    const badges = {
      introductorio: "bg-green-100 text-green-800",
      intermedio: "bg-yellow-100 text-yellow-800",
      avanzado: "bg-orange-100 text-orange-800",
      experto: "bg-red-100 text-red-800",
    }
    return badges[nivel] || "bg-gray-100 text-gray-800"
  }

  const filteredCursos = cursos.filter(
    (curso) =>
      curso.curso_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.instructor_nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Cursos</h1>
          <p className="text-gray-600">Gestiona tus cursos inscritos y revisa tu progreso</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cursos o instructores..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
              >
                <option value="">Todos los estados</option>
                <option value="activa">Activos</option>
                <option value="completada">Completados</option>
                <option value="cancelada">Cancelados</option>
                <option value="suspendida">Suspendidos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Cursos */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button onClick={fetchCursos} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Reintentar
            </button>
          </div>
        ) : filteredCursos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes cursos inscritos</h3>
            <p className="text-gray-600 mb-6">Explora nuestro catálogo y encuentra el curso perfecto para ti</p>
            <button
              onClick={() => router.push("/cursos")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Explorar Cursos
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCursos.map((curso) => (
              <div
                key={curso.inscripcion_id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{curso.curso_nombre}</h3>
                          <p className="text-gray-600 mb-3">{curso.curso_descripcion}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(curso.inscripcion_estado)}`}
                            >
                              {curso.inscripcion_estado.charAt(0).toUpperCase() + curso.inscripcion_estado.slice(1)}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getNivelBadge(curso.nivel)}`}
                            >
                              {curso.nivel.charAt(0).toUpperCase() + curso.nivel.slice(1)}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              {curso.categoria.toUpperCase()}
                            </span>
                            {curso.certificado_generado && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                <FaCertificate className="inline mr-1" />
                                Certificado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaUser className="text-blue-500" />
                          <span>{curso.instructor_nombre}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCalendarAlt className="text-green-500" />
                          <span>
                            {formatDate(curso.fecha_inicio)} - {formatDate(curso.fecha_fin)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaChartBar className="text-yellow-500" />
                          <span>Asistencia: {curso.porcentaje_asistencia}%</span>
                        </div>
                        {curso.calificacion_final && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCertificate className="text-purple-500" />
                            <span>Nota Final: {curso.calificacion_final}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Paralelo:</span>
                            <p className="text-gray-600">{curso.nombre_paralelo}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Horario:</span>
                            <p className="text-gray-600">{curso.horario}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Aula:</span>
                            <p className="text-gray-600">{curso.aula || "Virtual"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                      <button
                        onClick={() => router.push(`/estudiante/cursos/${curso.curso_id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
                      >
                        <FaEye />
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => router.push(`/estudiante/calificaciones?cursoId=${curso.curso_id}`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium"
                      >
                        <FaChartBar />
                        Calificaciones
                      </button>
                      {curso.certificado_generado && (
                        <button
                          onClick={() => router.push(`/estudiante/certificados`)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
                        >
                          <FaCertificate />
                          Certificado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}