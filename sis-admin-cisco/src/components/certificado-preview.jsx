"use client"

import { useState } from "react"
import { FiDownload, FiX } from "react-icons/fi"

export default function CertificadoPreview({ certificado, onClose }) {
  const [downloading, setDownloading] = useState(false)
  console.log(certificado)

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

        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">
            Vista Previa del Certificado
          </h3>
          <button 
            onClick={() => setShowPreview(false)} 
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        {/* Contenedor del PDF */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`/api/estudiante/certificados/${certificado.certificado_id}/preview`}
            className="w-full h-screen min-h-[600px] border-0"
            title="Vista previa del certificado"
          />
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
