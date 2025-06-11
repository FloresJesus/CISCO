"use client"
import { useState, useEffect } from "react"
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaFileDownload,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa"
import api from "@/libs/api"
import { formatDate, formatCurrency } from "@/libs/utils"

export default function EstudiantePagos() {
  const [pagos, setPagos] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPagos()
  }, [])

  const fetchPagos = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/estudiante/pagos")
      console.log("Datos de pagos:", data)
      setPagos(data.pagos)
      setEstadisticas(data.estadisticas)
    } catch (err) {
      console.error("Error al cargar pagos:", err)
      setError("Error al cargar los pagos")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      completado: "bg-green-100 text-green-800",
      pendiente: "bg-yellow-100 text-yellow-800",
      rechazado: "bg-red-100 text-red-800",
      reembolsado: "bg-blue-100 text-blue-800",
    }
    return badges[estado] || "bg-gray-100 text-gray-800"
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "completado":
        return <FaCheckCircle className="text-green-500" />
      case "pendiente":
        return <FaClock className="text-yellow-500" />
      case "rechazado":
        return <FaTimesCircle className="text-red-500" />
      case "reembolsado":
        return <FaMoneyBillWave className="text-blue-500" />
      default:
        return <FaClock className="text-gray-500" />
    }
  }

  const getMetodoPagoIcon = (metodo) => {
    switch (metodo) {
      case "tarjeta":
        return <FaCreditCard className="text-blue-500" />
      case "transferencia":
        return <FaMoneyBillWave className="text-green-500" />
      case "efectivo":
        return <FaMoneyBillWave className="text-yellow-500" />
      default:
        return <FaMoneyBillWave className="text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pagos</h1>
          <p className="text-gray-600">Revisa tu historial de pagos y estado de matrículas</p>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pagado</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.total_completado)}</p>
                </div>
                <FaMoneyBillWave className="text-blue-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendiente</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.total_pendiente)}</p>
                </div>
                <FaClock className="text-yellow-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.pagos_completados}</p>
                </div>
                <FaCheckCircle className="text-green-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.pagos_pendientes}</p>
                </div>
                <FaTimesCircle className="text-red-500 text-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Lista de Pagos */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button onClick={fetchPagos} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Reintentar
            </button>
          </div>
        ) : pagos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCreditCard className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pagos registrados</h3>
            <p className="text-gray-600">Los pagos aparecerán aquí una vez que realices matrículas en cursos</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pago.curso_nombre}</div>
                        <div className="text-sm text-gray-500">{pago.nombre_paralelo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(pago.monto)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getMetodoPagoIcon(pago.metodo_pago)}
                          <span className="text-sm text-gray-900 capitalize">{pago.metodo_pago}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pago.fecha_pago)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(pago.estado)}
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(pago.estado)}`}
                          >
                            {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {pago.referencia && (
                            <button
                              onClick={() => navigator.clipboard.writeText(pago.referencia)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copiar referencia"
                            >
                              <FaEye />
                            </button>
                          )}
                          {pago.comprobante && (
                            <button
                              onClick={() => window.open(pago.comprobante, "_blank")}
                              className="text-green-600 hover:text-green-900"
                              title="Ver comprobante"
                            >
                              <FaFileDownload />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}