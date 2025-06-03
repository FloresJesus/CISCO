"use client"

import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { FiUsers, FiBookOpen, FiAward, FiActivity, FiTrendingUp, FiUserCheck } from "react-icons/fi"
import { formatPercentage } from "@/libs/utils"

export default function EstadisticasTab({ data, loading }) {
  const COLORS = ["#049FD9", "#1D428A", "#00BCEB", "#FF6B00", "#005073"]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
  const crecimiento = data?.crecimientoUsuarios || []
  const roles = data?.distribucionRoles || []
  const actividad = data?.actividadUsuarios || []
  const cursos = data?.estadisticasCursos || []
  const finalizacion = data?.tasaFinalizacion || []
  const distribucion = data?.distribucionEstudiantes || []
  const rendimiento = data?.rendimientoGeneral || {}

  return (
    <div className="space-y-6">
      {/* Métricas principales del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-ciscoBlue to-ciscoDarkBlue px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Usuarios Activos</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiUsers className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.usuarios_activos || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Total en el sistema</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-animate to-ciscoBlue px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Estudiantes Activos</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiUserCheck className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.estudiantes_activos || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Estudiantes registrados</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-accent to-amber-500 px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Cursos Disponibles</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiBookOpen className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.cursos_disponibles || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">En catálogo</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Instructores Activos</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiAward className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.instructores_activos || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Profesores disponibles</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Paralelos Activos</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiActivity className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.paralelos_activos || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Clases en progreso</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-br from-ciscoDarkBlue to-ciscoBlue px-4 py-2 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Inscripciones Activas</h3>
            <div className="p-2 bg-white bg-opacity-30 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="text-2xl font-bold text-dark">{estadisticas.inscripciones_activas || 0}</div>
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500">Estudiantes cursando</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crecimiento de usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Crecimiento de Usuarios</h3>
            <p className="text-sm text-gray-600">Nuevos usuarios registrados por mes</p>
          </div>
          <div className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crecimiento}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="nuevos_usuarios" stroke="#049FD9" strokeWidth={2} />
                  <Line type="monotone" dataKey="usuarios_acumulados" stroke="#1D428A" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Distribución por roles */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Distribución por Roles</h3>
            <p className="text-sm text-gray-600">Usuarios por tipo de rol</p>
          </div>
          <div className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roles.map((item) => ({
                      name: item.rol.charAt(0).toUpperCase() + item.rol.slice(1),
                      value: item.cantidad,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {roles.map((entry, index) => (
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

      {/* Actividad de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">Actividad de Usuarios</h3>
          <p className="text-sm text-gray-600">Último acceso de usuarios activos</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {actividad.map((periodo, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <p className="text-sm font-medium text-gray-600">{periodo.periodo_actividad}</p>
                <p className="text-2xl font-bold text-dark">{periodo.cantidad_usuarios}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-ciscoBlue h-2 rounded-full"
                      style={{ width: `${(periodo.cantidad_usuarios / estadisticas.usuarios_activos) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rendimiento académico general */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">Rendimiento Académico General</h3>
          <p className="text-sm text-gray-600">Distribución de calificaciones finales</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <p className="text-sm font-medium text-green-700">Excelente (9-10)</p>
              <p className="text-2xl font-bold text-green-600">{rendimiento.excelente || 0}</p>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700 mt-2">
                {formatPercentage(((rendimiento.excelente || 0) / (rendimiento.total_calificaciones || 1)) * 100)}
              </span>
            </div>
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <p className="text-sm font-medium text-blue-700">Bueno (7-8.9)</p>
              <p className="text-2xl font-bold text-blue-600">{rendimiento.bueno || 0}</p>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700 mt-2">
                {formatPercentage(((rendimiento.bueno || 0) / (rendimiento.total_calificaciones || 1)) * 100)}
              </span>
            </div>
            <div className="text-center p-4 border rounded-lg bg-yellow-50">
              <p className="text-sm font-medium text-yellow-700">Regular (5-6.9)</p>
              <p className="text-2xl font-bold text-yellow-600">{rendimiento.regular || 0}</p>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-700 mt-2">
                {formatPercentage(((rendimiento.regular || 0) / (rendimiento.total_calificaciones || 1)) * 100)}
              </span>
            </div>
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <p className="text-sm font-medium text-red-700">Deficiente (&lt;5)</p>
              <p className="text-2xl font-bold text-red-600">{rendimiento.deficiente || 0}</p>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700 mt-2">
                {formatPercentage(((rendimiento.deficiente || 0) / (rendimiento.total_calificaciones || 1)) * 100)}
              </span>
            </div>
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Promedio General</p>
              <p className="text-2xl font-bold text-gray-600">
                {rendimiento.promedio_general ? Number(rendimiento.promedio_general).toFixed(1) : "0.0"}
              </p>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700 mt-2">
                {rendimiento.total_calificaciones || 0} calificaciones
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasa de finalización por curso */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Tasa de Finalización por Curso</h3>
            <p className="text-sm text-gray-600">Porcentaje de estudiantes que completan cada curso</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {finalizacion.slice(0, 5).map((curso, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{curso.curso}</p>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {curso.total_inscripciones} estudiantes
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Finalización: {formatPercentage(curso.tasa_finalizacion || 0)}</span>
                    <span>Cancelación: {formatPercentage(curso.tasa_cancelacion || 0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-ciscoBlue h-2 rounded-full"
                      style={{ width: `${curso.tasa_finalizacion || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribución de estudiantes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-dark">Distribución de Estudiantes</h3>
            <p className="text-sm text-gray-600">Estudiantes internos vs externos</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {distribucion.map((tipo, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{tipo.tipo_estudiante}</p>
                    <p className="text-sm text-gray-600">{formatPercentage(tipo.porcentaje)} del total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-dark">{tipo.cantidad}</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-ciscoBlue h-2 rounded-full" style={{ width: `${tipo.porcentaje}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de cursos por categoría */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">Estadísticas por Categoría y Nivel</h3>
          <p className="text-sm text-gray-600">Distribución de cursos, paralelos e inscripciones</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cursos
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paralelos
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscripciones
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cursos.map((curso, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {curso.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{curso.nivel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {curso.total_cursos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {curso.total_paralelos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {curso.total_inscripciones}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {curso.duracion_promedio ? `${Number(curso.duracion_promedio).toFixed(1)} sem` : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
