"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaEdit, FaTrash, FaEye, FaSearch, FaUserPlus, FaChevronLeft, FaChevronRight, FaFileAlt } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function InscripcionesList() {
  const router = useRouter()
  const [inscripciones, setInscripciones] = useState([])
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

  const fetchInscripciones = async () => {
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

      const { data } = await api.get(`/admin/inscripciones?${params.toString()}`)
      setInscripciones(data.inscripciones || data)

      // Si la API devuelve información de paginación, actualizarla
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch (err) {
      console.error("Error al cargar inscripciones:", err)
      setError("Error al cargar las inscripciones. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInscripciones()
  }, [pagination.page, pagination.limit, filtroEstado])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchInscripciones()
  }

  const handleChangePage = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta inscripción? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await api.delete(`/admin/inscripciones/${id}`)
      fetchInscripciones()
    } catch (err) {
      console.error("Error al eliminar inscripción:", err)
      alert("Error al eliminar la inscripción. " + (err.response?.data?.error || "Por favor, intenta de nuevo."))
    }
  }

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Inscripciones</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Buscar inscripción..."
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
              <option value="activa">Activa</option>
              <option value="completada">Completada</option>
              <option value="suspendida">Suspendida</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <button
              onClick={() => router.push("/admin/academico/inscripciones/nueva")}
              className="bg-ciscoBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ciscoDarkBlue transition-colors"
            >
              <FaUserPlus /> Nueva Inscripción
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
        </div>
      ) : inscripciones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron inscripciones con los criterios de búsqueda.
        </div>
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
                    ID
                  </th>
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
                    Curso
                  </th>
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
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inscripciones.map((inscripcion) => (
                  <tr key={inscripcion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inscripcion.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inscripcion.estudiante_nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{inscripcion.curso_nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{inscripcion.paralelo_nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inscripcion.fecha_inscripcion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(
                          inscripcion.estado,
                        )}`}
                      >
                        {inscripcion.estado.charAt(0).toUpperCase() + inscripcion.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/academico/inscripciones/${inscripcion.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/academico/inscripciones/${inscripcion.id}/editar`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        {inscripcion.estado === "completada" && (
                          <button
                            onClick={() => router.push(`/admin/academico/inscripciones/${inscripcion.id}/certificado`)}
                            className="text-green-600 hover:text-green-900"
                            title="Certificado"
                          >
                            <FaFileAlt />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(inscripcion.id)}
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
              Mostrando {inscripciones.length} de {pagination.total} resultados
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
