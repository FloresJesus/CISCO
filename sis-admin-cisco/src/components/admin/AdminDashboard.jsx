"use client"

import { useState, useEffect } from "react"
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
} from "react-icons/fi"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import api from "@/libs/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    estudiantes: { total: 0, nuevos: 0, porcentaje: 0 },
    cursos: { total: 0, activos: 0, porcentaje: 0 },
    inscripciones: { total: 0, pendientes: 0, porcentaje: 0 },
    ingresos: { total: 0, mes: 0, porcentaje: 0 },
  })

  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [upcomingCourses, setUpcomingCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Obtener estadísticas
        const statsResponse = await api.get("/admin/dashboard/stats")
        setStats(statsResponse.data)

        // Obtener inscripciones recientes
        const enrollmentsResponse = await api.get("/admin/dashboard/inscripciones")
        setRecentEnrollments(enrollmentsResponse.data)

        // Obtener próximos cursos
        const coursesResponse = await api.get("/admin/dashboard/cursos")
        setUpcomingCourses(coursesResponse.data)

        setIsLoading(false)
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
        setError("No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.")
        setIsLoading(false)

        // Cargar datos de respaldo para demostración en caso de error
        setStats({
          estudiantes: { total: 245, nuevos: 18, porcentaje: 7.3 },
          cursos: { total: 12, activos: 8, porcentaje: 66.7 },
          inscripciones: { total: 320, pendientes: 45, porcentaje: 14.1 },
          ingresos: { total: 28500, mes: 4200, porcentaje: -5.2 },
        })

        setRecentEnrollments([
          {
            id: 1,
            student: "María González",
            course: "CCNA: Introduction to Networks",
            date: "2023-05-01",
            status: "completada",
          },
          { id: 2, student: "Carlos Rodríguez", course: "CyberOps Associate", date: "2023-05-02", status: "activa" },
          { id: 3, student: "Ana Martínez", course: "DevNet Associate", date: "2023-05-03", status: "activa" },
          {
            id: 4,
            student: "Juan López",
            course: "CCNA: Switching & Routing",
            date: "2023-05-04",
            status: "pendiente",
          },
          { id: 5, student: "Pedro Sánchez", course: "IoT Fundamentals", date: "2023-05-05", status: "pendiente" },
        ])

        setUpcomingCourses([
          {
            id: 1,
            name: "CCNA: Introduction to Networks",
            start: "2023-05-15",
            instructor: "Roberto Méndez",
            enrolled: 18,
            capacity: 25,
          },
          {
            id: 2,
            name: "CyberOps Associate",
            start: "2023-05-22",
            instructor: "Laura Gómez",
            enrolled: 12,
            capacity: 20,
          },
          {
            id: 3,
            name: "DevNet Associate",
            start: "2023-06-01",
            instructor: "Miguel Ángel Torres",
            enrolled: 8,
            capacity: 15,
          },
        ])
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Estudiantes"
          icon={<FiUsers className="w-6 h-6" />}
          value={stats.estudiantes.total}
          change={stats.estudiantes.nuevos}
          changeText={`${stats.estudiantes.nuevos} nuevos`}
          trend={stats.estudiantes.porcentaje}
          trendText={`${stats.estudiantes.porcentaje}% este mes`}
          color="bg-gradient-to-br from-ciscoBlue to-ciscoDarkBlue"
        />

        <StatCard
          title="Cursos"
          icon={<FiBookOpen className="w-6 h-6" />}
          value={stats.cursos.total}
          change={stats.cursos.activos}
          changeText={`${stats.cursos.activos} activos`}
          trend={stats.cursos.porcentaje}
          trendText={`${stats.cursos.porcentaje}% de ocupación`}
          color="bg-gradient-to-br from-animate to-ciscoBlue"
        />

        <StatCard
          title="Inscripciones"
          icon={<FiCalendar className="w-6 h-6" />}
          value={stats.inscripciones.total}
          change={stats.inscripciones.pendientes}
          changeText={`${stats.inscripciones.pendientes} pendientes`}
          trend={stats.inscripciones.porcentaje}
          trendText={`${stats.inscripciones.porcentaje}% requieren acción`}
          color="bg-gradient-to-br from-accent to-amber-500"
        />

        <StatCard
          title="Ingresos"
          icon={<FiDollarSign className="w-6 h-6" />}
          value={`Bs. ${stats.ingresos.total.toLocaleString()}`}
          change={`Bs. ${stats.ingresos.mes.toLocaleString()}`}
          changeText={`Bs. ${stats.ingresos.mes.toLocaleString()} este mes`}
          trend={stats.ingresos.porcentaje}
          trendText={`${Math.abs(stats.ingresos.porcentaje)}% vs mes anterior`}
          trendDirection={stats.ingresos.porcentaje >= 0 ? "up" : "down"}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">Inscripciones Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estudiante
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Curso
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEnrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {enrollment.student}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enrollment.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(enrollment.date), "dd MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        enrollment.status === "completada"
                          ? "bg-green-100 text-green-800"
                          : enrollment.status === "activa"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a
                      href={`/admin/academico/inscripciones/${enrollment.id}`}
                      className="text-ciscoBlue hover:text-ciscoDarkBlue"
                    >
                      Ver detalles
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <a
            href="/admin/academico/inscripciones"
            className="text-sm font-medium text-ciscoBlue hover:text-ciscoDarkBlue"
          >
            Ver todas las inscripciones →
          </a>
        </div>
      </div>

      {/* Upcoming Courses */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-dark">Próximos Cursos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Curso
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha Inicio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Instructor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Inscritos
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingCourses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(course.start), "dd MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.instructor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span>
                        {course.enrolled}/{course.capacity}
                      </span>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-ciscoBlue h-2.5 rounded-full"
                          style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a
                      href={`/admin/cursos/paralelos/${course.id}`}
                      className="text-ciscoBlue hover:text-ciscoDarkBlue"
                    >
                      Ver detalles
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <a href="/admin/cursos/paralelos" className="text-sm font-medium text-ciscoBlue hover:text-ciscoDarkBlue">
            Ver todos los cursos →
          </a>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, icon, value, change, changeText, trend, trendText, trendDirection = "up", color }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`${color} px-4 py-2 flex items-center justify-between`}>
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <div className="p-2 bg-white bg-opacity-30 rounded-full">{icon}</div>
      </div>
      <div className="px-4 py-4">
        <div className="text-2xl font-bold text-dark">{value}</div>
        <div className="mt-1 flex items-center text-sm">
          <span className="text-gray-500">{changeText}</span>
          <span className="ml-2 flex items-center text-xs font-medium">
            {trendDirection === "up" ? (
              <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : trendDirection === "down" ? (
              <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
            ) : (
              <FiAlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
            )}
            <span
              className={
                trendDirection === "up"
                  ? "text-green-500"
                  : trendDirection === "down"
                    ? "text-red-500"
                    : "text-yellow-500"
              }
            >
              {trendText}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
