"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaEdit, FaTrash, FaEye, FaSearch, FaPlus, FaChevronLeft, FaChevronRight, FaUsers } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function ParalelosList({ cursoId, cursoNombre }) {
  const router = useRouter()
  const [paralelos, setParalelos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchParalelos = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", pagination.page)
      params.append("limit", pagination.limit)

      if (searchQuery) {
        params.append("query", searchQuery)
      }

      if (filtroEstado) {
        params.append("estado", filtroEstado)
      }

      const { data } = await api.get(`/admin/paralelos?${params.toString()}`)
      setParalelos(data.paralelos)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }))
    } catch (err) {
      console.error("Error al cargar paralelos:", err)
      setError("Error al cargar los paralelos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParalelos()
  }, [pagination.page, pagination.limit, filtroEstado])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchParalelos()
  }

  const handleChangePage = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este paralelo? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await api.delete(`/admin/paralelos/${id}`)
      fetchParalelos()
    } catch (err) {
      console.error("Error al eliminar paralelo:", err)
      alert("Error al eliminar el paralelo. " + (err.response?.data?.error || "Por favor, intenta de nuevo."))
    }
  }

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
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
    switch (modalidad) {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Paralelos del Curso</h2>
          <p className="text-gray-600">{cursoNombre}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Buscar paralelo..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch />
              </button>
            </form>
          </div>

          <div className="flex gap-2">
            <select
              className="border rounded-lg px-3 py-2 focus:ring-ciscoBlue focus:border-ciscoBlue"
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <option value="">Todos los estados</option>
              <option value="planificado">Planificado</option>
              <option value="en_progreso">En progreso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <button
              onClick={() => router.push(`/admin/cursos/paralelos/nuevo`)}
              className="bg-ciscoBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ciscoDarkBlue transition-colors"
            >
              <FaPlus /> Nuevo
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
        </div>
      ) : paralelos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No se encontraron paralelos con los criterios de búsqueda.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Paralelo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Instructor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fechas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Modalidad
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
                    Inscritos
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
                {paralelos.map((paralelo) => (
                  <tr key={paralelo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{paralelo.nombre_paralelo}</div>
                          <div className="text-xs text-gray-500">{paralelo.codigo_paralelo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paralelo.instructor_nombre} {paralelo.instructor_apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(paralelo.fecha_inicio)}</div>
                      <div className="text-xs text-gray-500">hasta {formatDate(paralelo.fecha_fin)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getModalidadBadgeClass(paralelo.modalidad)}`}
                      >
                        {paralelo.modalidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(paralelo.estado)}`}
                      >
                        {paralelo.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paralelo.total_inscritos || 0} / {paralelo.max_estudiantes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/paralelos/${paralelo.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/paralelos/${paralelo.id}/estudiantes`)}
                          className="text-green-600 hover:text-green-900"
                          title="Ver estudiantes"
                        >
                          <FaUsers />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/paralelos/${paralelo.id}/editar`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(paralelo.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Mostrando {paralelos.length} de {pagination.total} resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleChangePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaChevronLeft size={14} />
              </button>
              <div className="px-3 py-1 bg-white border rounded-md">
                {pagination.page} de {pagination.totalPages}
              </div>
              <button
                onClick={() => handleChangePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === pagination.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
