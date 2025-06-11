"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import api from "@/libs/api"
import { formatCurrency, formatDate } from "@/libs/utils"

const CourseDetailPage = () => {
  const params = useParams()
  const [curso, setCurso] = useState(null)
  const [paralelos, setParalelos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/cursos/${params.id}/paralelos`)
        setCurso(data.curso)
        setParalelos(data.paralelos || [])
      } catch (err) {
        console.error("Error al cargar detalles del curso:", err)
        setError("Error al cargar los detalles del curso.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCourseDetails()
    }
  }, [params.id])

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

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "planificado":
        return "bg-yellow-100 text-yellow-800"
      case "en_progreso":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !curso) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h2>
          <p className="text-gray-600 mb-6">{error || "El curso que buscas no existe o no está disponible."}</p>
          <Link href="/cursos" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            Volver a cursos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/cursos" className="text-blue-500 hover:text-blue-700">
            ← Volver a cursos
          </Link>
        </nav>

        {/* Header del curso */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="relative h-64 md:h-full">
                <Image
                  src={curso.imagen_portada || `/placeholder.svg?height=300&width=400`}
                  alt={curso.nombre}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-2/3 p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {getCategoryName(curso.categoria)}
                </span>
                <span className="text-sm text-gray-500">Código: {curso.codigo}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{curso.nombre}</h1>
              <p className="text-gray-600 mb-6">{curso.descripcion}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{curso.duracion_semanas}</div>
                  <div className="text-sm text-gray-500">Semanas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{curso.horas_totales}</div>
                  <div className="text-sm text-gray-500">Horas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getLevelName(curso.nivel)}</div>
                  <div className="text-sm text-gray-500">Nivel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(curso.costo_matricula)}</div>
                  <div className="text-sm text-gray-500">Costo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paralelos disponibles */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Paralelos Disponibles</h2>

          {paralelos.length > 0 ? (
            <div className="grid gap-6">
              {paralelos.map((paralelo) => (
                <div
                  key={paralelo.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{paralelo.nombre_paralelo}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(paralelo.estado)}`}
                        >
                          {paralelo.estado.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">Código: {paralelo.codigo_paralelo}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Instructor:</strong>
                          <br />
                          {paralelo.instructor_nombre} {paralelo.instructor_apellido}
                          {paralelo.instructor_especialidad && (
                            <div className="text-xs text-gray-500">{paralelo.instructor_especialidad}</div>
                          )}
                        </div>
                        <div>
                          <strong>Fechas:</strong>
                          <br />
                          {formatDate(paralelo.fecha_inicio)} - {formatDate(paralelo.fecha_fin)}
                        </div>
                        <div>
                          <strong>Horario:</strong>
                          <br />
                          {paralelo.horario}
                          {paralelo.aula && <div className="text-xs text-gray-500">Aula: {paralelo.aula}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="text-center md:text-right">
                      <div className="mb-2">
                        <span className="text-lg font-bold text-gray-900">{paralelo.cupos_disponibles}</span>
                        <span className="text-sm text-gray-500"> / {paralelo.max_estudiantes} cupos</span>
                      </div>

                      {paralelo.tiene_cupos ? (
                        <Link
                          href={`/inscripcion/${paralelo.id}`}
                          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-block"
                        >
                          Inscribirse
                        </Link>
                      ) : (
                        <button disabled className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed">
                          Sin cupos
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay paralelos disponibles</h3>
              <p className="text-gray-500 mb-4">Actualmente no hay paralelos programados para este curso.</p>
              <Link href="/cursos" className="text-blue-500 hover:text-blue-700">
                Ver otros cursos
              </Link>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿Tienes preguntas sobre este curso?</h2>
          <p className="mb-6">
            Nuestro equipo está aquí para ayudarte con cualquier consulta sobre el programa de estudios.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-blue-500 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
