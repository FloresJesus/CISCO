"use client"

import { useState, useEffect } from "react"
import { FiDownload, FiFileText, FiDollarSign } from "react-icons/fi"
import FinancierosTab from "@/components/admin/reportes/financieros-tab"
import api from "@/libs/api"

export default function ReportesFinancierosPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (filters) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()

      if (filters) {
        Object.keys(filters).forEach((key) => {
          if (filters[key]) {
            params.append(key, filters[key])
          }
        })
      }

      const response = await api.get(`/admin/reportes/financieros?${params.toString()}`)

      if (response.data.success) {
        setData(response.data.data)
      } else {
        setError(response.data.error || "Error al cargar datos")
      }
    } catch (error) {
      console.error("Error loading financial data:", error)
      setError("Error al cargar los datos financieros")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filters) => {
    loadData(filters)
  }

  const exportReport = async (format) => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/reportes/financieros/export?format=${format}`, {
        responseType: "blob",
      })

      // Crear y descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `reporte-financiero.${format}`)
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
              <FiDollarSign className="h-8 w-8 text-green-600" />
              Reportes Financieros
            </h1>
            <p className="text-gray-600 mt-2">Análisis de ingresos, pagos y estadísticas financieras</p>
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
            <FinancierosTab data={data} loading={loading} onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
