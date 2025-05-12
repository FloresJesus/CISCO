"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaEdit, FaTrash, FaEye, FaSearch, FaPlus, FaChevronLeft, FaChevronRight, FaUsers } from "react-icons/fa"
import api from "@/libs/api"
import { formatCurrency } from "@/libs/utils"

export default function CursosTable() {
  const router = useRouter()
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [filtroNivel, setFiltroNivel] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchCursos = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", pagination.page)
      params.append("limit", pagination.limit)

      if (searchQuery) {
        params.append("query", searchQuery)
      }

      if (filtroCategoria) {
        params.append("categoria", filtroCategoria)
      }

      if (filtroNivel) {
        params.append("nivel", filtroNivel)
      }

      const { data } = await api.get(`/api/admin/cursos?${params.toString()}`)
      setCursos(data.cursos)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }))
    } catch (err) {
      console.error("Error al cargar cursos:", err)
      setError("Error al cargar los cursos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCursos()
  }, [pagination.page, pagination.limit, filtroCategoria, filtroNivel])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchCursos()
  }

  const handleChangePage = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await api.delete(`/api/admin/cursos/${id}`)
      fetchCursos()
    } catch (err) {
      console.error("Error al eliminar curso:", err)
      alert("Error al eliminar el curso. " + (err.response?.data?.error || "Por favor, intenta de nuevo."))
    }
  }

  const getNivelBadgeClass = (nivel) => {
    switch (nivel) {
      case "introductorio":
        return "bg-green-100 text-green-800"
      case "intermedio":
        return "bg-blue-100 text-blue-800"
      case "avanzado":
        return "bg-orange-100 text-orange-800"
      case "experto":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoriaBadgeClass = (categoria) => {
    switch (categoria) {
      case "ccna":
        return "bg-blue-100 text-blue-800"
      case "cyberops":
        return "bg-purple-100 text-purple-800"
      case "devnet":
        return "bg-green-100 text-green-800"
      case "iot":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "disponible":
        return "bg-green-100 text-green-800"
      case "no_disponible":
        return "bg-red-100 text-red-800"
      case "en_desarrollo":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Cursos</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Buscar curso..."
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
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <option value="">Todas las categorías</option>
              <option value="ccna">CCNA</option>
              <option value="cyberops">CyberOps</option>
              <option value="devnet">DevNet</option>
              <option value="iot">IoT</option>
              <option value="otros">Otros</option>
            </select>

            <select
              className="border rounded-lg px-3 py-2 focus:ring-ciscoBlue focus:border-ciscoBlue"
              value={filtroNivel}
              onChange={(e) => {
                setFiltroNivel(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <option value="">Todos los niveles</option>
              <option value="introductorio">Introductorio</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              <option value="experto">Experto</option>
            </select>

            <button
              onClick={() => router.push("/admin/cursos/nuevo")}
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
      ) : cursos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No se encontraron cursos con los criterios de búsqueda.</div>
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
                    Curso
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Código
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoría
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nivel
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
                    Costo
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
                {cursos.map((curso) => (
                  <tr key={curso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{curso.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {curso.duracion_semanas} semanas | {curso.horas_totales} horas
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{curso.codigo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoriaBadgeClass(curso.categoria)}`}
                      >
                        {curso.categoria.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNivelBadgeClass(curso.nivel)}`}
                      >
                        {curso.nivel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(curso.estado)}`}
                      >
                        {curso.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(curso.costo_matricula)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/cursos/${curso.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/cursos/${curso.id}/paralelos`)}
                          className="text-green-600 hover:text-green-900"
                          title="Ver paralelos"
                        >
                          <FaUsers />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/cursos/${curso.id}/editar`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(curso.id)}
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
              Mostrando {cursos.length} de {pagination.total} resultados
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
