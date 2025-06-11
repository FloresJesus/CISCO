"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import api from "@/libs/api"
import { formatCurrency } from "@/libs/utils"

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar cursos desde la API
  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()

      if (activeTab !== "all") {
        params.append("categoria", activeTab)
      }

      if (searchTerm.trim()) {
        params.append("busqueda", searchTerm.trim())
      }

      const { data } = await api.get(`/cursos/publicos?${params.toString()}`)
      setCourses(data.cursos || [])
    } catch (err) {
      console.error("Error al cargar cursos:", err)
      setError("Error al cargar los cursos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [activeTab])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses()
  }

  // Mapear categorías de BD a nombres amigables
  const getCategoryName = (category) => {
    switch (category) {
      case "ccna":
        return "Redes CCNA"
      case "cyberops":
        return "Ciberseguridad"
      case "devnet":
        return "Desarrollo"
      case "iot":
        return "Internet de las Cosas"
      case "otros":
        return "Otros"
      default:
        return category
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "ccna":
        return "bg-blue-100 text-blue-800"
      case "cyberops":
        return "bg-red-100 text-red-800"
      case "devnet":
        return "bg-purple-100 text-purple-800"
      case "iot":
        return "bg-green-100 text-green-800"
      case "otros":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelName = (level) => {
    switch (level) {
      case "introductorio":
        return "Principiante"
      case "intermedio":
        return "Intermedio"
      case "avanzado":
        return "Avanzado"
      case "experto":
        return "Experto"
      default:
        return level
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Cursos CISCO</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Capacítate con los programas oficiales de CISCO Networking Academy y obtén certificaciones reconocidas
            mundialmente.
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            {/* Barra de búsqueda */}
            <div className="relative w-full sm:w-96">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>
            </div>

            {/* Filtros por categoría */}
            <div className="flex space-x-2 overflow-x-auto pb-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTab === "all" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTab("ccna")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTab === "ccna" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                CCNA
              </button>
              <button
                onClick={() => setActiveTab("cyberops")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTab === "cyberops" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Ciberseguridad
              </button>
              <button
                onClick={() => setActiveTab("devnet")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTab === "devnet" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                DevNet
              </button>
              <button
                onClick={() => setActiveTab("iot")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTab === "iot" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                IoT
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : courses.length > 0 ? (
          /* Listado de cursos */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <Image
                    src={course.imagen_portada || `/placeholder.svg?height=200&width=400`}
                    alt={course.nombre}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {course.tiene_paralelos && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Disponible
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(course.categoria)}`}
                    >
                      {getCategoryName(course.categoria)}
                    </span>
                    <span className="text-xs text-gray-500">{course.horas_totales} horas</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.nombre}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.descripcion}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Nivel: {getLevelName(course.nivel)}</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(course.costo_matricula)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{course.duracion_semanas} semanas</span>
                    <Link
                      href={`/cursos/${course.id}`}
                      className="text-sm font-medium text-blue-500 hover:text-blue-700"
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Sin resultados */
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o categorías</p>
            <button
              onClick={() => {
                setActiveTab("all")
                setSearchTerm("")
                fetchCourses()
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Mostrar todos los cursos
            </button>
          </div>
        )}

        {/* CTA al final */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar tu capacitación?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Únete a miles de estudiantes que han transformado sus carreras con nuestras certificaciones CISCO.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-500 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Regístrate ahora
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CoursesPage
