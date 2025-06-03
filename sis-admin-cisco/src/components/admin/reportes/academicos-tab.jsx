"use client"

import { useState } from "react"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { FiBookOpen, FiUsers, FiAward, FiTrendingUp, FiFilter } from "react-icons/fi"
import { formatPercentage } from "@/libs/utils"

export default function AcademicosTab({ data, loading, onFilterChange }) {
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

  const estadisticas = data?.estadisticasGenerales || {}
  const rendimientoCursos = data?.rendimientoPorCurso || []
  const rendimientoInstructores = data?.rendimientoPorInstructor || []
  const evolucion = data?.evolucionInscripciones || []
  const categorias = data?.distribucionCategorias || []

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
          <div className="bg-gradient-to-br from-ciscoBlue to-ciscoDarkBlue px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Total Cursos</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiBookOpen className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.total_cursos || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">{estadisticas.total_paralelos || 0} paralelos</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-animate to-ciscoBlue px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Inscripciones</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiUsers className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.total_inscripciones || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">{estadisticas.cursos_activos || 0} activas</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-accent to-amber-500 px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Completados</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiAward className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.cursos_completados || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Cursos finalizados</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Promedio</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">
              {estadisticas.promedio_calificaciones ? Number(estadisticas.promedio_calificaciones).toFixed(1) : "0.0"}
            </div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Calificaciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución de inscripciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Evolución de Inscripciones</h3>
            <p className="text-sm text-gray-600">Inscripciones por mes en el último año</p>
          </div>
          <div className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucion}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="inscripciones" stroke="#049FD9" strokeWidth={2} />
                  <Line type="monotone" dataKey="completadas" stroke="#00BCEB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Distribución por categorías */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Distribución por Categorías</h3>
            <p className="text-sm text-gray-600">Inscripciones por categoría de curso</p>
          </div>
          <div className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorias.map((item) => ({
                      name: item.categoria.toUpperCase(),
                      value: item.total_inscripciones,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categorias.map((entry, index) => (
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

      {/* Tablas de rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento por curso */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Rendimiento por Curso</h3>
            <p className="text-sm text-gray-600">Estadísticas de cada curso</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {rendimientoCursos.slice(0, 5).map((curso, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{curso.curso}</p>
                    <p className="text-sm text-gray-600">{curso.codigo}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 mb-1">
                      {curso.total_estudiantes} estudiantes
                    </span>
                    <p className="text-sm">
                      Aprobación:{" "}
                      <span className="font-medium text-green-600">{formatPercentage(curso.tasa_aprobacion || 0)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rendimiento por instructor */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Rendimiento por Instructor</h3>
            <p className="text-sm text-gray-600">Estadísticas de cada instructor</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {rendimientoInstructores.slice(0, 5).map((instructor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{instructor.instructor}</p>
                    <p className="text-sm text-gray-600">{instructor.paralelos_asignados} paralelos</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 mb-1">
                      {instructor.total_estudiantes} estudiantes
                    </span>
                    <p className="text-sm">
                      Aprobación:{" "}
                      <span className="font-medium text-green-600">
                        {formatPercentage(instructor.tasa_aprobacion || 0)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
