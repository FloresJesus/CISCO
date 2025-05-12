"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaEdit, FaTrash, FaEye, FaSearch, FaUserPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function UsuariosTable({ rolFiltro = "", titulo = "Gestión de Usuarios" }) {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroRol, setFiltroRol] = useState(rolFiltro)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchUsuarios = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", pagination.page)
      params.append("limit", pagination.limit)

      if (searchQuery) {
        params.append("query", searchQuery)
      }

      if (filtroRol) {
        params.append("rol", filtroRol)
      }

      const { data } = await api.get(`/admin/usuarios?${params.toString()}`)
      setUsuarios(data.usuarios)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }))
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
      setError("Error al cargar los usuarios. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [pagination.page, pagination.limit, filtroRol])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsuarios()
  }

  const handleChangePage = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await api.delete(`/api/admin/usuarios/${id}`)
      fetchUsuarios()
    } catch (err) {
      console.error("Error al eliminar usuario:", err)
      alert("Error al eliminar el usuario. " + (err.response?.data?.error || "Por favor, intenta de nuevo."))
    }
  }

  const getRolBadgeClass = (rol) => {
    switch (rol) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "instructor":
        return "bg-blue-100 text-blue-800"
      case "estudiante":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800"
      case "inactivo":
        return "bg-red-100 text-red-800"
      case "suspendido":
        return "bg-yellow-100 text-yellow-800"
      case "egresado":
        return "bg-purple-100 text-purple-800"
      case "vacaciones":
        return "bg-blue-100 text-blue-800"
      case "licencia":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Buscar usuario..."
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
            {!rolFiltro && (
              <select
                className="border rounded-lg px-3 py-2 focus:ring-ciscoBlue focus:border-ciscoBlue"
                value={filtroRol}
                onChange={(e) => {
                  setFiltroRol(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
              >
                <option value="">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="instructor">Instructores</option>
                <option value="estudiante">Estudiantes</option>
              </select>
            )}

            <button
              onClick={() => {
                if (rolFiltro === "admin") {
                  router.push("/admin/usuarios/administradores/nuevo")
                } else if (rolFiltro === "instructor") {
                  router.push("/admin/usuarios/instructores/nuevo")
                } else if (rolFiltro === "estudiante") {
                  router.push("/admin/usuarios/estudiantes/nuevo")
                } else {
                  router.push("/admin/usuarios/nuevo")
                }
              }}
              className="bg-ciscoBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ciscoDarkBlue transition-colors"
            >
              <FaUserPlus /> Nuevo
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No se encontraron usuarios con los criterios de búsqueda.</div>
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
                    Usuario
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rol
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
                    Fecha Registro
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
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{usuario.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRolBadgeClass(usuario.rol)}`}
                      >
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(usuario.estado)}`}
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(usuario.fecha_creacion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/usuarios/${usuario.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/usuarios/${usuario.id}/editar`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
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
              Mostrando {usuarios.length} de {pagination.total} resultados
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
