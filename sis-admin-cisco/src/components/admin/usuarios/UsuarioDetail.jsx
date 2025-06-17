"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { FaEdit, FaArrowLeft, FaEnvelope, FaPhone, FaCalendarAlt, FaUserTag, FaIdCard } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function UsuarioDetail({ usuario: initialUsuario }) {
  const router = useRouter()
  const [usuario, setUsuario] = useState(initialUsuario)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("info")

  const fetchUsuarioData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/admin/usuarios/${initialUsuario.id}`)
      setUsuario(data)
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err)
      setError("Error al cargar los datos del usuario. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarioData()
  }, [initialUsuario.id])

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

  if (loading && !usuario) {
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
          onClick={fetchUsuarioData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const detalles = usuario.detalles || {}
  const nombreCompleto =
    detalles.nombre && detalles.apellido ? `${detalles.nombre} ${detalles.apellido}` : usuario.email

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
            <h1 className="text-2xl font-bold text-gray-800">{nombreCompleto}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/usuarios/${usuario.id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaEdit /> Editar
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
          {usuario.rol === "estudiante" && (
            <button
              onClick={() => setActiveTab("cursos")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "cursos"
                  ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Cursos
            </button>
          )}
          {usuario.rol === "instructor" && (
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
          )}
          <button
            onClick={() => setActiveTab("actividad")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "actividad"
                ? "border-b-2 border-ciscoBlue text-ciscoBlue"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Actividad
          </button>
        </nav>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Información de la Cuenta</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FaEnvelope className="text-gray-400" />
                      <p className="font-medium">{usuario.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rol</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${getRolBadgeClass(
                        usuario.rol,
                      )}`}
                    >
                      {usuario.rol}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${
                        usuario.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Registro</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FaCalendarAlt className="text-gray-400" />
                      <p className="font-medium">{formatDate(usuario.fecha_creacion)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Último Acceso</p>
                    <p className="font-medium">{usuario.ultimo_acceso ? formatDate(usuario.ultimo_acceso) : "Nunca"}</p>
                  </div>
                </div>
              </div>

              {detalles && (
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-3">Información Personal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium">{detalles.nombre || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Apellido</p>
                      <p className="font-medium">{detalles.apellido || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <div className="flex items-center gap-2 mt-1">
                        {detalles.telefono && <FaPhone className="text-gray-400" />}
                        <p className="font-medium">{detalles.telefono || "No especificado"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CI</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-medium">{detalles.ci||"CI no registrado"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                      <p className="font-medium">
                        {detalles.fecha_nacimiento ? formatDate(detalles.fecha_nacimiento) : "No especificada"}
                      </p>
                    </div>
                    {detalles.estado && (
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${getEstadoBadgeClass(
                            detalles.estado,
                          )}`}
                        >
                          {detalles.estado}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {usuario.rol === "instructor" && detalles && (
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-3">Información Profesional</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Especialidad</p>
                      <div className="flex items-center gap-2 mt-1">
                        <FaUserTag className="text-gray-400" />
                        <p className="font-medium">{detalles.especialidad || "No especificada"}</p>
                      </div>
                    </div>
                    {detalles.certificaciones_cisco && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Certificaciones Cisco</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FaIdCard className="text-gray-400" />
                          <p className="font-medium">{detalles.certificaciones_cisco}</p>
                        </div>
                      </div>
                    )}
                    {detalles.biografia && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Biografía</p>
                        <p className="mt-1 text-gray-700 whitespace-pre-line">{detalles.biografia}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-3">Foto de Perfil</h2>
              <div className="border rounded-lg overflow-hidden">
                {detalles.foto_perfil ? (
                  <Image
                    src={detalles.foto_perfil || "/placeholder.svg"}
                    alt={nombreCompleto}
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="bg-gray-100 h-64 flex items-center justify-center">
                    <p className="text-gray-500">Sin foto de perfil</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cursos" && usuario.rol === "estudiante" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Cursos Inscritos</h2>
            {usuario.cursos && usuario.cursos.length > 0 ? (
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
                    {usuario.cursos.map((inscripcion) => (
                      <tr key={inscripcion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inscripcion.curso_nombre}</div>
                          <div className="text-sm text-gray-500">{inscripcion.curso_codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{inscripcion.paralelo_nombre}</div>
                          <div className="text-sm text-gray-500">{inscripcion.paralelo_codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(inscripcion.fecha_inscripcion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              inscripcion.estado === "activa"
                                ? "bg-green-100 text-green-800"
                                : inscripcion.estado === "completada"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {inscripcion.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {inscripcion.calificacion_final !== null
                            ? `${inscripcion.calificacion_final.toFixed(1)}/10`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/inscripciones/${inscripcion.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                Este estudiante no está inscrito en ningún curso
              </div>
            )}
          </div>
        )}

        {activeTab === "paralelos" && usuario.rol === "instructor" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Paralelos Asignados</h2>
            {usuario.paralelos && usuario.paralelos.length > 0 ? (
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
                        Paralelo
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
                        Estudiantes
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
                    {usuario.paralelos.map((paralelo) => (
                      <tr key={paralelo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{paralelo.curso_nombre}</div>
                          <div className="text-sm text-gray-500">{paralelo.curso_codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{paralelo.nombre_paralelo}</div>
                          <div className="text-sm text-gray-500">{paralelo.codigo_paralelo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(paralelo.fecha_inicio)}</div>
                          <div className="text-sm text-gray-500">hasta {formatDate(paralelo.fecha_fin)}</div>
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
                            {paralelo.estado.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {paralelo.total_inscritos} / {paralelo.max_estudiantes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/paralelos/${paralelo.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                Este instructor no tiene paralelos asignados
              </div>
            )}
          </div>
        )}

        {activeTab === "actividad" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">Registro de Actividad</h2>
            {usuario.actividad && usuario.actividad.length > 0 ? (
              <div className="space-y-4">
                {usuario.actividad.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            log.accion === "login"
                              ? "bg-green-100 text-green-800"
                              : log.accion === "logout"
                                ? "bg-blue-100 text-blue-800"
                                : log.accion === "crear"
                                  ? "bg-purple-100 text-purple-800"
                                  : log.accion === "actualizar"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.accion.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {log.accion.charAt(0).toUpperCase() + log.accion.slice(1)}{" "}
                            {log.entidad && `- ${log.entidad.charAt(0).toUpperCase() + log.entidad.slice(1)}`}
                          </p>
                          <p className="text-sm text-gray-500">{log.detalles}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(log.fecha)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                No hay registros de actividad para este usuario
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
