"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaEdit, FaTrash, FaPlus, FaEye, FaSearch } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function ModulosTable() {
  const router = useRouter()
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moduloToDelete, setModuloToDelete] = useState(null)
  const [cursos, setCursos] = useState([])
  const [selectedCurso, setSelectedCurso] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await api.get("/admin/cursos")
        setCursos(response.data)
      } catch (error) {
        console.error("Error:", error)
        setError("No se pudieron cargar los cursos. Intente nuevamente.")
      }
    }

    fetchCursos()
  }, [])

  useEffect(() => {
    const fetchModulos = async () => {
      setLoading(true)
      try {
        let url = "/admin/modulos"
        if (selectedCurso) {
          url += `?curso_id=${selectedCurso}`
        }
        const response = await api.get(url)
        setModulos(response.data)
      } catch (error) {
        console.error("Error:", error)
        setError("No se pudieron cargar los módulos. Intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchModulos()
  }, [selectedCurso])

  const handleDelete = async () => {
    if (!moduloToDelete) return

    try {
      const response = await api.delete(`/admin/modulos/${moduloToDelete.id}`)

      if (!response.ok) throw new Error("Error al eliminar el módulo")

      setModulos(modulos.filter((modulo) => modulo.id !== moduloToDelete.id))
      alert("Módulo eliminado correctamente")
    } catch (error) {
      console.error("Error:", error)
      alert("No se pudo eliminar el módulo. Intente nuevamente.")
    } finally {
      setDeleteDialogOpen(false)
      setModuloToDelete(null)
    }
  }

  const confirmDelete = (modulo) => {
    setModuloToDelete(modulo)
    setDeleteDialogOpen(true)
  }

  const filteredModulos = modulos.filter((modulo) => modulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  const getCursoNombre = (cursoId) => {
    const curso = cursos.find((c) => c.id === cursoId)
    return curso ? curso.nombre : "Desconocido"
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Módulos</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar módulos..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              className="border rounded-lg px-3 py-2 focus:ring-ciscoBlue focus:border-ciscoBlue"
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
            >
              <option value="">Todos los cursos</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={() => router.push("/admin/cursos/modulos/nuevo")}
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
      ) : filteredModulos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No se encontraron módulos con los criterios de búsqueda.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModulos.map((modulo) => (
                  <tr key={modulo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{modulo.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCursoNombre(modulo.curso_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {modulo.descripcion
                          ? modulo.descripcion.length > 50
                            ? `${modulo.descripcion.substring(0, 50)}...`
                            : modulo.descripcion
                          : "Sin descripción"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{modulo.orden}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(modulo.fecha_creacion)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/cursos/modulos/${modulo.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/cursos/modulos/${modulo.id}/editar`)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => confirmDelete(modulo)}
                          className="text-red-600 hover:text-red-900 p-1"
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
        </>
      )}

      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Está seguro que desea eliminar el módulo "{moduloToDelete?.nombre}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
