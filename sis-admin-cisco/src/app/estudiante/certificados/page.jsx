"use client"

import { useState, useEffect } from "react"
import { FiAward, FiDownload, FiEye, FiCheckCircle, FiCalendar, FiBook, FiStar } from "react-icons/fi"
import { formatDate } from "@/libs/utils"
import CertificadoPreview from "@/components/certificado-preview"

export default function CertificadosEstudiantePage() {
  const [loading, setLoading] = useState(false)
  const [certificados, setCertificados] = useState([])
  const [selectedCert, setSelectedCert] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCertificados()
  }, [])

  const loadCertificados = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/estudiante/certificados", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setCertificados(data.data || [])
      } else {
        setError("Error al cargar certificados")
      }
    } catch (error) {
      console.error("Error loading certificados:", error)
      setError("Error al cargar certificados")
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async (certificadoId, cursoNombre) => {
    setDownloading(certificadoId)
    try {
      const response = await fetch(`/api/estudiante/certificados/${certificadoId}/download`, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `certificado-${cursoNombre.replace(/\s+/g, "-")}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        setError("Error al descargar certificado")
      }
    } catch (error) {
      console.error("Error downloading certificate:", error)
      setError("Error al descargar certificado")
    } finally {
      setDownloading(null)
    }
  }

  const downloadQRCode = async (certificadoId, cursoNombre) => {
    try {
      const response = await fetch(`/api/estudiante/certificados/${certificadoId}/qr`, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `qr-certificado-${cursoNombre.replace(/\s+/g, "-")}.png`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        setError("Error al descargar código QR")
      }
    } catch (error) {
      console.error("Error downloading QR:", error)
      setError("Error al descargar código QR")
    }
  }
  const previewCertificate = (certificado) => {
    setSelectedCert(certificado)
    setShowPreview(true)
  }

  const getGradeColor = (grade) => {
    if (grade >= 9) return "text-green-600 bg-green-50"
    if (grade >= 7) return "text-blue-600 bg-blue-50"
    return "text-yellow-600 bg-yellow-50"
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark flex items-center justify-center gap-3">
            <FiAward className="h-8 w-8 text-accent" />
            Mis Certificados
          </h1>
          <p className="text-gray-600 mt-2">Descarga y comparte tus certificaciones de Cisco Academy</p>
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

        {/* Certificados Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
          </div>
        ) : certificados.length === 0 ? (
          <div className="text-center py-12">
            <FiAward className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes certificados aún</h3>
            <p className="text-gray-600">Completa tus cursos para obtener certificaciones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificados.map((certificado) => (
              <div key={certificado.certificado_id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header del certificado */}
                <div className="bg-gradient-to-br from-ciscoBlue to-ciscoDarkBlue p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <FiAward className="h-8 w-8" />
                    {certificado.firmado_admin && <FiCheckCircle className="h-6 w-6 text-green-300" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">Certificado de Finalización</h3>
                  <p className="text-blue-100 text-sm">Cisco Academy</p>
                </div>

                {/* Contenido del certificado */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{certificado.curso_nombre}</h4>
                      <p className="text-sm text-gray-600">{certificado.curso_codigo}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="h-4 w-4" />
                        <span>{formatDate(certificado.fecha_emision)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiBook className="h-4 w-4" />
                        <span>{certificado.duracion_semanas} sem</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiStar className="h-4 w-4 text-yellow-500" />
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(certificado.calificacion_final)}`}
                        >
                          {Number(certificado.calificacion_final).toFixed(1)}/100
                        </span>
                      </div>
                      {certificado.firmado_admin && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verificado</span>
                      )}
                    </div>

                    {/* Código QR */}
                    <div className="border-t pt-4">
                      <div className="flex justify-center mb-3">
                        <img
                          src={`/api/estudiante/certificados/${certificado.certificado_id}/qr`}
                          alt="Código QR"
                          className="w-24 h-24 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">Escanea para verificar autenticidad</p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="px-6 pb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => previewCertificate(certificado)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiEye className="h-4 w-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => downloadCertificate(certificado.certificado_id, certificado.curso_nombre)}
                      disabled={downloading === certificado.certificado_id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-ciscoBlue text-white rounded-md text-sm font-medium hover:bg-ciscoDarkBlue disabled:opacity-50"
                    >
                      {downloading === certificado.certificado_id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <FiDownload className="h-4 w-4" />
                      )}
                      {downloading === certificado.certificado_id ? "..." : "PDF"}
                    </button>
                    <button
                      onClick={() => downloadQRCode(certificado.certificado_id, certificado.curso_nombre)}
                      className="px-3 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-amber-600"
                      title="Descargar QR"
                    >
                      QR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Vista Previa */}
        {showPreview && selectedCert && (
          <CertificadoPreview certificado={selectedCert} onClose={() => setShowPreview(false)} />
        )}
      </div>
    </div>
  )
}
