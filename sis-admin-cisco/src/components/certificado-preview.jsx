"use client"

import { useState } from "react"
import { FiDownload, FiX } from "react-icons/fi"

export default function CertificadoPreview({ certificado, onClose }) {
  const [downloading, setDownloading] = useState(false)

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/estudiante/certificados/${certificado.certificado_id}/download`, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `certificado-${certificado.curso_codigo}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        alert("Error al descargar el certificado")
      }
    } catch (error) {
      console.error("Error downloading certificate:", error)
      alert("Error al descargar el certificado")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">Vista Previa del Certificado</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Certificado Preview */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-ciscoBlue to-ciscoDarkBlue p-8 rounded-lg">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              {/* Header del certificado */}
              <div className="text-center mb-8">
                <div className="text-2xl font-bold text-ciscoDarkBlue mb-2">🌐 CISCO ACADEMY</div>
                <h1 className="text-3xl font-bold text-ciscoDarkBlue mb-4">CERTIFICADO DE FINALIZACIÓN</h1>
                <div className="w-32 h-1 bg-ciscoBlue mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">Se certifica que</p>
              </div>

              {/* Nombre del estudiante */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-ciscoBlue mb-4">[NOMBRE DEL ESTUDIANTE]</h2>
                <p className="text-gray-700 text-lg mb-4">ha completado satisfactoriamente el curso</p>
                <h3 className="text-2xl font-bold text-ciscoDarkBlue mb-2">{certificado.curso_nombre}</h3>
                <p className="text-gray-600">
                  Código: {certificado.curso_codigo} | Duración: {certificado.duracion_semanas} semanas
                </p>
              </div>

              {/* Calificación */}
              <div className="text-center mb-8">
                <p className="text-xl font-bold text-accent">
                  Calificación Final: {Number(certificado.calificacion_final).toFixed(1)}/10
                </p>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-ciscoBlue pt-6 flex justify-between items-end">
                <div className="text-left">
                  <p className="text-sm text-gray-600 mb-2">
                    Fecha de emisión: {new Date(certificado.fecha_emision).toLocaleDateString("es-ES")}
                  </p>
                  <p className="text-xs text-gray-500">URL: {certificado.url_verificacion}</p>
                </div>
                <div className="text-center">
                  <img
                    src={`/api/estudiante/certificados/${certificado.certificado_id}/qr`}
                    alt="Código QR"
                    className="w-20 h-20 border border-gray-300 rounded mb-1"
                  />
                  <p className="text-xs text-gray-500">Verificar autenticidad</p>
                </div>
              </div>

              {/* Sello de verificación */}
              {certificado.firmado_admin && (
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg">✓</div>
                      <div className="text-xs">VERIFICADO</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-ciscoBlue text-white rounded-md text-sm font-medium hover:bg-ciscoDarkBlue disabled:opacity-50"
          >
            {downloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <FiDownload className="h-4 w-4" />
            )}
            {downloading ? "Generando..." : "Descargar PDF"}
          </button>
        </div>
      </div>
    </div>
  )
}
