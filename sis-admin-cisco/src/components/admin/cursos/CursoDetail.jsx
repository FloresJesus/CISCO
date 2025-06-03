"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { FaEdit, FaArrowLeft, FaUsers, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa"
import api from "@/libs/api"
import { formatCurrency, formatDate } from "@/libs/utils"

export default function CursoDetail({ curso: initialCurso }) {
  const router = useRouter()
  const [curso, setCurso] = useState(initialCurso)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("info")
  const [expandedModulos, setExpandedModulos] = useState({})

  const fetchCursoData = async () => {
    // Solo intentamos cargar datos si tenemos un ID válido
    if (!initialCurso?.id) {
      console.error("No se puede cargar el curso: ID no válido", initialCurso)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/admin/cursos/${initialCurso.id}`)

      // Verificar que los datos recibidos sean válidos
      if (!data || Object.keys(data).length === 0) {
        console.error("API devolvió datos vacíos o inválidos", data)
        setError("La API devolvió datos vacíos o inválidos. Por favor, intenta de nuevo.")
        return
      }

      // Mantener los datos iniciales si la API devuelve undefined
      setCurso((prevCurso) => {
        // Combinar los datos previos con los nuevos, manteniendo los previos si los nuevos son undefined
        return {
          ...prevCurso,
          ...data,
          // Asegurarse de que las propiedades críticas no sean undefined
          nombre: data.nombre || prevCurso.nombre,
          codigo: data.codigo || prevCurso.codigo,
          categoria: data.categoria || prevCurso.categoria,
          nivel: data.nivel || prevCurso.nivel,
          estado: data.estado || prevCurso.estado,
          // Mantener arrays si vienen vacíos
          modulos: data.modulos?.length > 0 ? data.modulos : prevCurso.modulos,
          paralelos: data.paralelos?.length > 0 ? data.paralelos : prevCurso.paralelos,
        }
      })
    } catch (err) {
      console.error("Error al cargar datos del curso:", err)
      setError("Error al cargar los datos del curso. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Asegurarse de que initialCurso tenga datos antes de intentar cargar más
    if (initialCurso && Object.keys(initialCurso).length > 0) {
      // Evitar que se sobrescriban los datos iniciales si ya tenemos datos
      if (!curso || Object.keys(curso).length === 0) {
        setCurso(initialCurso)
      }

      // Solo cargar datos adicionales si tenemos un ID
      if (initialCurso.id) {
        fetchCursoData()
      }
    }
  }, [initialCurso])

  const toggleModulo = (moduloId) => {
    setExpandedModulos((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }))
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
    // Añadir verificación para evitar error cuando categoria es undefined
    if (!categoria) return "bg-gray-100 text-gray-800"

    switch (categoria.toLowerCase()) {
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
    // Añadir verificación para evitar error cuando estado es undefined
    if (!estado) return "bg-gray-100 text-gray-800"

    switch (estado.toLowerCase()) {
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

  if (loading && !curso) {
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
        <button onClick={fetchCursoData} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200">
          Reintentar
        </button>
      </div>
    )
  }

  // Asegurarse de que siempre tengamos datos para mostrar
  const cursoData = curso || initialCurso || {}

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
            <h1 className="text-2xl font-bold text-gray-800">{cursoData.nombre || "Curso sin nombre"}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/cursos/${cursoData.id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaEdit /> Editar
            </button>
            <button
              onClick={() => router.push(`/admin/cursos/${cursoData.id}/paralelos`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FaUsers /> Paralelos
            </button>
            <button
              onClick={() => router.push(`/admin/cursos/${cursoData.id}/paralelos/nuevo`)}
              className="flex items-center gap-2 px-4 py-2 bg-ciscoBlue text-white rounded-md hover:bg-ciscoDarkBlue"
            >
              <FaPlus /> Nuevo Paralelo
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
            onClick={() => setActiveTab("modulos")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "modulos"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Módulos
          </button>
          <button
            onClick={() => setActiveTab("paralelos")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "paralelos"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Paralelos
          </button>
          <button
            onClick={() => setActiveTab("estadisticas")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "estadisticas"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Estadísticas
          </button>
        </nav>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Detalles del Curso</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Código</p>
                    <p className="font-medium">{cursoData.codigo || "Sin código"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Categoría</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoriaBadgeClass(
                        cursoData.categoria,
                      )}`}
                    >
                      {cursoData.categoria ? cursoData.categoria.toUpperCase() : "Sin categoría"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nivel</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getNivelBadgeClass(
                        cursoData.nivel,
                      )}`}
                    >
                      {cursoData.nivel || "Sin nivel"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(
                        cursoData.estado,
                      )}`}
                    >
                      {cursoData.estado ? cursoData.estado.replace("_", " ") : "Sin estado"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duración</p>
                    <p className="font-medium">{cursoData.duracion_semanas || 0} semanas</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Horas Totales</p>
                    <p className="font-medium">{cursoData.horas_totales || 0} horas</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Costo de Matrícula</p>
                    <p className="font-medium">{formatCurrency(cursoData.costo_matricula || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Creación</p>
                    <p className="font-medium">
                      {cursoData.fecha_creacion ? formatDate(cursoData.fecha_creacion) : "Sin fecha"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Descripción</h2>
                <p className="text-gray-700 whitespace-pre-line">{cursoData.descripcion || "Sin descripción"}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-3">Imagen del Curso</h2>
              <div className="border rounded-lg overflow-hidden">
                {cursoData.imagen_portada ? (
                  <Image
                    src={cursoData.imagen_portada || "/placeholder.svg"}
                    alt={cursoData.nombre || "Imagen del curso"}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="bg-gray-100 h-48 flex items-center justify-center">
                    <p className="text-gray-500">Sin imagen</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "modulos" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-800">Módulos del Curso</h2>
              <button
                onClick={() => router.push(`/admin/cursos/${cursoData.id}/editar`)}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <FaEdit /> Editar Módulos
              </button>
            </div>

            {cursoData.modulos && cursoData.modulos.length > 0 ? (
              <div className="space-y-4">
                {cursoData.modulos.map((modulo, index) => (
                  <div key={modulo.id || index} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                      onClick={() => toggleModulo(modulo.id || index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-ciscoBlue text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <h3 className="font-medium">{modulo.titulo || `Módulo ${index + 1}`}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{modulo.duracion_horas || 0} horas</span>
                        {expandedModulos[modulo.id || index] ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>
                    {expandedModulos[modulo.id || index] && (
                      <div className="p-4 border-t">
                        <p className="text-gray-700 whitespace-pre-line">{modulo.descripcion || "Sin descripción"}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay módulos definidos para este curso
              </div>
            )}
          </div>
        )}

        {activeTab === "paralelos" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-800">Paralelos del Curso</h2>
              <button
                onClick={() => router.push(`/admin/cursos/${cursoData.id}/paralelos/nuevo`)}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                <FaPlus /> Nuevo Paralelo
              </button>
            </div>

            {cursoData.paralelos && cursoData.paralelos.length > 0 ? (
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
                    {cursoData.paralelos.map((paralelo) => (
                      <tr key={paralelo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {paralelo.nombre_paralelo || "Sin nombre"}
                          </div>
                          <div className="text-sm text-gray-500">{paralelo.codigo_paralelo || "Sin código"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {paralelo.instructor_nombre || "Sin instructor"} {paralelo.instructor_apellido || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {paralelo.fecha_inicio ? formatDate(paralelo.fecha_inicio) : "Sin fecha"}
                          </div>
                          <div className="text-sm text-gray-500">
                            hasta {paralelo.fecha_fin ? formatDate(paralelo.fecha_fin) : "Sin fecha"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              paralelo.estado === "planificado"
                                ? "bg-yellow-100 text-yellow-800"
                                : paralelo.estado === "en_progreso"
                                  ? "bg-green-100 text-green-800"
                                  : paralelo.estado === "completado"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {paralelo.estado ? paralelo.estado.replace("_", " ") : "Sin estado"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {paralelo.total_inscritos || 0} / {paralelo.max_estudiantes || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/paralelos/${paralelo.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => router.push(`/admin/paralelos/${paralelo.id}/editar`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay paralelos para este curso
              </div>
            )}
          </div>
        )}

        {activeTab === "estadisticas" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Estadísticas del Curso</h2>

            {cursoData.estadisticas ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-sm text-blue-500 mb-1">Total de Paralelos</p>
                  <p className="text-3xl font-bold text-blue-700">{cursoData.estadisticas.total_paralelos || 0}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-sm text-green-500 mb-1">Estudiantes Inscritos</p>
                  <p className="text-3xl font-bold text-green-700">{cursoData.estadisticas.total_inscripciones || 0}</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-lg">
                  <p className="text-sm text-emerald-500 mb-1">Estudiantes Aprobados</p>
                  <p className="text-3xl font-bold text-emerald-700">{cursoData.estadisticas.total_aprobados || 0}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg">
                  <p className="text-sm text-red-500 mb-1">Estudiantes Reprobados</p>
                  <p className="text-3xl font-bold text-red-700">{cursoData.estadisticas.total_reprobados || 0}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay estadísticas disponibles
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
