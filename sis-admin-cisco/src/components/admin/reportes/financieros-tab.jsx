"use client"

import { useState } from "react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { FiDollarSign, FiCreditCard, FiTrendingUp, FiAlertCircle, FiFilter, FiClock } from "react-icons/fi"
import { formatCurrency } from "@/libs/utils"

export default function FinancierosTab({ data, loading, onFilterChange }) {
  const [filtros, setFiltros] = useState({
    periodo: "mes",
    fechaInicio: "",
    fechaFin: "",
  })

  const handleFilterChange = (key, value) => {
    const newFiltros = { ...filtros, [key]: value }
    setFiltros(newFiltros)
    onFilterChange(newFiltros)
  }

  const COLORS = ["#049FD9", "#1D428A", "#00BCEB", "#FF6B00", "#005073"]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
              <div className="h-20 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const resumen = data?.resumenGeneral || {}
  const ingresosMes = data?.ingresosPorMes || []
  const ingresosCurso = data?.ingresosPorCurso || []
  const metodosPago = data?.metodosPago || []
  const estadoPagos = data?.estadoPagos || []
  const pagosPendientes = data?.pagosPendientes || []

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark flex items-center gap-2">
            <FiFilter className="w-5 h-5" />
            Filtros
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <select
                value={filtros.periodo}
                onChange={(e) => handleFilterChange("periodo", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              >
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
                <option value="trimestre">Último trimestre</option>
                <option value="año">Último año</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltros({ periodo: "mes", fechaInicio: "", fechaFin: "" })
                  onFilterChange({ periodo: "mes", fechaInicio: "", fechaFin: "" })
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Ingresos Confirmados</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiDollarSign className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(resumen.ingresos_confirmados || 0)}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Pagos completados</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Ingresos Pendientes</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiClock className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(resumen.ingresos_pendientes || 0)}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Por cobrar</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-ciscoBlue to-ciscoDarkBlue px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Total Pagos</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiCreditCard className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{resumen.total_pagos || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Transacciones</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-animate to-ciscoBlue px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Ticket Promedio</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{formatCurrency(resumen.ticket_promedio || 0)}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Por transacción</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución de ingresos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Evolución de Ingresos</h3>
            <p className="text-sm text-gray-600">Ingresos mensuales en el último año</p>
          </div>
          <div className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosMes}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]} />
                  <Bar dataKey="ingresos" fill="#049FD9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Métodos de Pago</h3>
            <p className="text-sm text-gray-600">Distribución por método de pago</p>
          </div>
          <div className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metodosPago.map((item) => ({
                      name: item.metodo_pago,
                      value: item.cantidad_transacciones,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {metodosPago.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas de datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por curso */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Ingresos por Curso</h3>
            <p className="text-sm text-gray-600">Cursos con mayores ingresos</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {ingresosCurso.slice(0, 5).map((curso, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{curso.curso}</p>
                    <p className="text-sm text-gray-600">{curso.codigo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(curso.ingresos_totales)}</p>
                    <p className="text-sm text-gray-600">{curso.total_pagos} pagos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagos pendientes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-yellow-500" />
              Pagos Pendientes
            </h3>
            <p className="text-sm text-gray-600">Pagos que requieren seguimiento</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pagosPendientes.slice(0, 5).map((pago, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{pago.estudiante}</p>
                    <p className="text-sm text-gray-600">{pago.curso}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{formatCurrency(pago.monto)}</p>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pago.dias_vencido > 30 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {pago.dias_vencido} días
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estado de pagos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">Estado de Pagos</h3>
          <p className="text-sm text-gray-600">Distribución de pagos por estado</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {estadoPagos.map((estado, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <p className="text-sm font-medium text-gray-600 capitalize">{estado.estado.replace("_", " ")}</p>
                <p className="text-2xl font-bold text-dark">{estado.cantidad}</p>
                <p className="text-sm text-gray-500">{formatCurrency(estado.monto_total)}</p>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 mt-2">
                  {estado.porcentaje}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
