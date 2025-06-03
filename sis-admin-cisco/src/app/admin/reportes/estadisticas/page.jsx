"use client"

import { useState, useEffect } from "react"
import { FiDownload, FiFileText, FiTrendingUp } from "react-icons/fi"
import EstadisticasTab from "@/components/admin/reportes/estadisticas-tab"
import api from "@/libs/api"

export default function ReportesEstadisticasPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/admin/reportes/estadisticas")

      if (response.data.success) {
        setData(response.data.data)
      } else {
        setError(response.data.error || "Error al cargar datos")
      }
    } catch (error) {
      console.error("Error loading statistics data:", error)
      setError("Error al cargar las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format) => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/reportes/estadisticas/export?format=${format}`, {
        responseType: "blob",
      })

      // Crear y descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `reporte-estadisticas.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting report:", error)
      setError("Error al exportar el reporte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
              <FiTrendingUp className="h-8 w-8 text-purple-600" />
              Reportes de Estadísticas
            </h1>
            <p className="text-gray-600 mt-2">Estadísticas generales del sistema y análisis de usuarios</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportReport("excel")}
              disabled={loading || !data}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="h-4 w-4" />
              Excel
            </button>
            <button
              onClick={() => exportReport("pdf")}
              disabled={loading || !data}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onClick={() => loadData()}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido del reporte */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <EstadisticasTab data={data} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
