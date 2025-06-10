"use client"

import { useState, useEffect } from "react"
import { FiAward, FiDownload, FiEye, FiFilter, FiFileText, FiUsers, FiCheckCircle, FiClock, FiX } from "react-icons/fi"
import { formatDate } from "@/libs/utils"
import api from "@/libs/api"

export default function CertificacionesPage() {
  const [loading, setLoading] = useState(false)
  const [certificaciones, setCertificaciones] = useState([])
  const [cursos, setCursos] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [selectedCert, setSelectedCert] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [filtros, setFiltros] = useState({
    curso_id: "",
    estudiante_id: "",
    estado: "",
    fecha_inicio: "",
    fecha_fin: "",
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (cursos.length > 0) {
      loadCertificaciones()
    }
  }, [filtros, cursos])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [cursosRes, estudiantesRes, estadisticasRes] = await Promise.all([
        api.get("/admin/cursos"),
        api.get("/admin/estudiantes"),
        api.get("/admin/certificaciones/estadisticas"),
      ])

      setCursos(cursosRes.data.cursos || [])
      setEstudiantes(estudiantesRes.data.estudiantes || [])
      setEstadisticas(estadisticasRes.data.data || {})
    } catch (error) {
      console.error("Error loading initial data:", error)
      setError("Error al cargar datos iniciales")
    } finally {
      setLoading(false)
    }
  }

  const loadCertificaciones = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filtros).forEach((key) => {
        if (filtros[key]) {
          params.append(key, filtros[key])
        }
      })

      const response = await api.get(`/admin/certificaciones?${params.toString()}`)
      console.log("Certificaciones response:", response.data.data)
      setCertificaciones(response.data.data || [])
    } catch (error) {
      console.error("Error loading certificaciones:", error)
      setError("Error al cargar certificaciones")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }))
  }

  const generateCertificate = async (inscripcionId) => {
    try {
      setLoading(true)
      const response = await api.post(`/admin/certificaciones/generar/${inscripcionId}`)

      if (response.data.success) {
        await loadCertificaciones()
        setError(null)
      }
    } catch (error) {
      console.error("Error generating certificate:", error)
      setError("Error al generar certificado")
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async (certificacionId) => {
    try {
      const response = await api.get(`/admin/certificaciones/download/${certificacionId}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `certificado-${certificacionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading certificate:", error)
      setError("Error al descargar certificado")
    }
  }

  const previewCertificate = async (certificacion) => {
    setSelectedCert(certificacion)
    setShowPreview(true)
  }

  const exportCertificates = async (format) => {
    try {
      const params = new URLSearchParams()
      Object.keys(filtros).forEach((key) => {
        if (filtros[key]) {
          params.append(key, filtros[key])
        }
      })

      const response = await api.get(`/admin/certificaciones/export?format=${format}&${params.toString()}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `certificaciones.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting certificates:", error)
      setError("Error al exportar certificaciones")
    }
  }

  const getStatusColor = (estado) => {
    switch (estado) {
      case "emitido":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "revocado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
              <FiAward className="h-8 w-8 text-accent" />
              Gestión de Certificaciones
            </h1>
            <p className="text-gray-600 mt-2">Administra y supervisa las certificaciones de los estudiantes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportCertificates("excel")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
            >
              <FiDownload className="h-4 w-4" />
              Excel
            </button>
            <button
              onClick={() => exportCertificates("pdf")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
            >
              <FiFileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setError(null)}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Certificados Emitidos</h3>
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                <FiCheckCircle className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-2xl font-bold text-green-600">{estadisticas.certificados_emitidos || 0}</div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-500">Certificados válidos</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Pendientes</h3>
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                <FiClock className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.certificados_pendientes || 0}</div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-500">Por generar</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-ciscoBlue to-ciscoDarkBlue px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Estudiantes Certificados</h3>
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                <FiUsers className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-2xl font-bold text-dark">{estadisticas.estudiantes_certificados || 0}</div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-500">Únicos</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-accent to-amber-500 px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Cursos Certificables</h3>
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                <FiAward className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-2xl font-bold text-dark">{estadisticas.cursos_certificables || 0}</div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-500">Disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark flex items-center gap-2">
              <FiFilter className="w-5 h-5" />
              Filtros
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                <select
                  value={filtros.curso_id}
                  onChange={(e) => handleFilterChange("curso_id", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                >
                  <option value="">Todos los cursos</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                <select
                  value={filtros.estudiante_id}
                  onChange={(e) => handleFilterChange("estudiante_id", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                >
                  <option value="">Todos los estudiantes</option>
                  {estudiantes.map((estudiante) => (
                    <option key={estudiante.id} value={estudiante.id}>
                      {estudiante.nombre} {estudiante.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFilterChange("estado", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                >
                  <option value="">Todos los estados</option>
                  <option value="emitido">Emitido</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="revocado">Revocado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input
                  type="date"
                  value={filtros.fecha_inicio}
                  onChange={(e) => handleFilterChange("fecha_inicio", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() =>
                    setFiltros({ curso_id: "", estudiante_id: "", estado: "", fecha_inicio: "", fecha_fin: "" })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Certificaciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Certificaciones de Estudiantes</h3>
            <p className="text-sm text-gray-600">Gestiona las certificaciones y diplomas</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación Final
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Certificación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Emisión
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código Verificación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ciscoBlue mx-auto"></div>
                    </td>
                  </tr>
                ) : certificaciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No se encontraron certificaciones
                    </td>
                  </tr>
                ) : (
                  certificaciones.map((cert) => (
                    <tr key={cert.certificado_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cert.estudiante_nombre} {cert.estudiante_apellido}
                          </div>
                          <div className="text-sm text-gray-500">{cert.estudiante_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cert.curso_nombre}</div>
                        <div className="text-sm text-gray-500">{cert.curso_codigo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {Number(cert.calificacion_final).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(cert.estado_certificacion)}`}
                        >
                          {cert.estado_certificacion
                            ? cert.estado_certificacion.charAt(0).toUpperCase() + cert.estado_certificacion.slice(1)
                            : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {cert.fecha_emision ? formatDate(cert.fecha_emision) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {cert.url_verificacion ? (
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {cert.url_verificacion.split("/").pop()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {cert.estado_certificacion === "emitido" ? (
                            <>
                              <button
                                onClick={() => previewCertificate(cert)}
                                className="text-ciscoBlue hover:text-ciscoDarkBlue p-1"
                                title="Ver certificado"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => downloadCertificate(cert.certificado_id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Descargar certificado"
                              >
                                <FiDownload className="h-4 w-4" />
                              </button>
                            </>
                          ) : cert.calificacion_final >= 7 ? (
                            <button
                              onClick={() => generateCertificate(cert.inscripcion_id)}
                              className="text-accent hover:text-amber-600 p-1"
                              title="Generar certificado"
                            >
                              <FiAward className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">No elegible</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Vista Previa */}
        {showPreview && selectedCert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-dark">Vista Previa del Certificado</h3>
                <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                {/* Aquí iría la vista previa del certificado */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <FiAward className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-dark mb-2">Certificado de Finalización</h4>
                  <p className="text-gray-600 mb-4">
                    Se certifica que{" "}
                    <strong>
                      {selectedCert.estudiante_nombre} {selectedCert.estudiante_apellido}
                    </strong>
                  </p>
                  <p className="text-gray-600 mb-4">ha completado satisfactoriamente el curso</p>
                  <p className="text-lg font-semibold text-ciscoBlue mb-4">{selectedCert.curso_nombre}</p>
                  <p className="text-gray-600 mb-4">
                    con una calificación final de <strong>{Number(selectedCert.calificacion_final).toFixed(1)}</strong>
                  </p>
                  <p className="text-sm text-gray-500">URL de verificación: {selectedCert.url_verificacion}</p>
                  <p className="text-sm text-gray-500">Fecha de emisión: {formatDate(selectedCert.fecha_emision)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => downloadCertificate(selectedCert.certificado_id)}
                  className="px-4 py-2 bg-ciscoBlue text-white rounded-md text-sm font-medium hover:bg-ciscoDarkBlue"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
