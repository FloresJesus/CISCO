"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSave, FaArrowLeft, FaSpinner, FaUserGraduate, FaBook, FaCalendarAlt, FaCreditCard } from "react-icons/fa"
import api from "@/libs/api"
import { formatDate } from "@/libs/utils"

export default function InscripcionForm({ inscripcion = null }) {
  const router = useRouter()
  const isEditing = !!inscripcion

  // Estados para los datos del formulario
  const [formData, setFormData] = useState({
    estudiante_id: "",
    curso_id: "",
    paralelo_id: "",
    metodo_pago: "",
    referencia: "",
    monto: "",
    observaciones: "",
  })

  // Estados para las listas de selección
  const [estudiantes, setEstudiantes] = useState([])
  const [cursos, setCursos] = useState([])
  const [paralelos, setParalelos] = useState([])
  const [metodosPago, setMetodosPago] = useState([
    { id: "transferencia", nombre: "Transferencia Bancaria" },
    { id: "efectivo", nombre: "Efectivo" },
    { id: "tarjeta", nombre: "Tarjeta de Crédito/Débito" },
    { id: "otro", nombre: "Otro Método" },
  ])

  // Estados para información adicional
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [paraleloSeleccionado, setParaleloSeleccionado] = useState(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null)

  // Estados para manejo de UI
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Cargar estudiantes
        const estudiantesRes = await api.get("/admin/estudiantes")
        setEstudiantes(estudiantesRes.data.estudiantes || estudiantesRes.data)

        // Cargar cursos
        const cursosRes = await api.get("/admin/cursos/disponibles")
        setCursos(cursosRes.data.cursos || cursosRes.data)
        console.log(cursosRes)
        // Si estamos editando, cargar datos de la inscripción
        if (isEditing && inscripcion) {
          setFormData({
            estudiante_id: inscripcion.estudiante_id.toString(),
            curso_id: inscripcion.curso_id.toString(),
            paralelo_id: inscripcion.paralelo_id.toString(),
            metodo_pago: inscripcion.pago?.metodo_pago || "",
            referencia: inscripcion.pago?.referencia || "",
            monto: inscripcion.pago?.monto?.toString() || "",
            observaciones: inscripcion.observaciones || "",
          })

          // Cargar paralelos del curso
          const paralelosRes = await api.get(`/admin/cursos/${inscripcion.curso_id}/paralelos`)
          setParalelos(paralelosRes.data.paralelos || paralelosRes.data)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error)
        setError("No se pudieron cargar los datos necesarios. Por favor, intente nuevamente.")
        setLoading(false)
      }
    }

    fetchData()
  }, [isEditing, inscripcion])

  // Cargar paralelos cuando se selecciona un curso
  useEffect(() => {
    const fetchParalelos = async () => {
      if (!formData.curso_id) {
        setParalelos([])
        setFormData((prev) => ({ ...prev, paralelo_id: "" }))
        return
      }

      try {
        const res = await api.get(`/admin/cursos/${formData.curso_id}/paralelos`)
        setParalelos(res.data)

        // Encontrar el curso seleccionado
        const curso = cursos.find((c) => c.id.toString() === formData.curso_id)
        setCursoSeleccionado(curso)

        // Limpiar selección de paralelo
        setFormData((prev) => ({ ...prev, paralelo_id: "" }))
        setParaleloSeleccionado(null)
      } catch (error) {
        console.error("Error al cargar paralelos:", error)
        setError("No se pudieron cargar los paralelos disponibles.")
      }
    }

    fetchParalelos()
  }, [formData.curso_id, cursos])

  // Actualizar información del paralelo seleccionado
  useEffect(() => {
    if (!formData.paralelo_id) {
      setParaleloSeleccionado(null)
      return
    }

    const paralelo = paralelos.find((p) => p.id.toString() === formData.paralelo_id)
    setParaleloSeleccionado(paralelo)

    // Si el curso tiene un costo definido, actualizar el monto
    if (cursoSeleccionado && cursoSeleccionado.costo_matricula) {
      setFormData((prev) => ({ ...prev, monto: cursoSeleccionado.costo_matricula.toString() }))
    }
  }, [formData.paralelo_id, paralelos, cursoSeleccionado])

  // Actualizar información del estudiante seleccionado
  useEffect(() => {
    if (!formData.estudiante_id) {
      setEstudianteSeleccionado(null)
      return
    }

    const estudiante = estudiantes.find((e) => e.id.toString() === formData.estudiante_id)
    setEstudianteSeleccionado(estudiante)
  }, [formData.estudiante_id, estudiantes])

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones básicas
    if (!formData.estudiante_id || !formData.paralelo_id) {
      setError("Por favor, complete todos los campos obligatorios.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Crear objeto de inscripción
      const inscripcionData = {
        estudiante_id: Number.parseInt(formData.estudiante_id),
        paralelo_id: Number.parseInt(formData.paralelo_id),
        fecha_inscripcion: new Date().toISOString().split('T')[0],
        estado: formData.metodo_pago ? "completada" : "activa",
        observaciones: formData.observaciones,
        pago: formData.metodo_pago
          ? {
              monto: Number.parseFloat(formData.monto),
              fecha_pago: new Date().toISOString().split('T')[0],
              metodo_pago: formData.metodo_pago,
              referencia: formData.referencia,
              estado: "completado",
            }
          : null,
      }

      // Enviar datos al servidor
      if (isEditing) {
        await api.put(`/admin/inscripciones/${inscripcion.id}`, inscripcionData)
      } else {
        await api.post("/admin/inscripciones", inscripcionData)
      }

      // Mostrar mensaje de éxito
      setSuccess(true)

      // Limpiar formulario después de 2 segundos y redirigir
      setTimeout(() => {
        router.push("/admin/academico/inscripciones")
      }, 2000)
    } catch (error) {
      console.error("Error al procesar la inscripción:", error)
      setError(
        error.response?.data?.error || "Ocurrió un error al procesar la inscripción. Por favor, intente nuevamente.",
      )
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Inscripción exitosa</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>La inscripción se ha procesado correctamente. Redirigiendo...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Editar Inscripción" : "Nueva Inscripción"}</h2>
          <button
            onClick={() => router.push("/admin/academico/inscripciones")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Sección de Estudiante */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FaUserGraduate className="mr-2 text-ciscoBlue" />
              Información del Estudiante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="estudiante_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Estudiante <span className="text-red-500">*</span>
                </label>
                <select
                  id="estudiante_id"
                  name="estudiante_id"
                  value={formData.estudiante_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {estudiantes.map((estudiante) => (
                    <option key={estudiante.id} value={estudiante.id.toString()}>
                      {estudiante.nombre} {estudiante.apellido} - {estudiante.email}
                    </option>
                  ))}
                </select>
              </div>

              {estudianteSeleccionado && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Estudiante</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {estudianteSeleccionado.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Teléfono:</strong> {estudianteSeleccionado.telefono || "No especificado"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Estado:</strong>{" "}
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        estudianteSeleccionado.estado === "activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {estudianteSeleccionado.estado}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Curso */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FaBook className="mr-2 text-ciscoBlue" />
              Información del Curso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="curso_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Curso <span className="text-red-500">*</span>
                </label>
                <select
                  id="curso_id"
                  name="curso_id"
                  value={formData.curso_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id.toString()}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {cursoSeleccionado && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Curso</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Código:</strong> {cursoSeleccionado.codigo}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duración:</strong> {cursoSeleccionado.duracion_semanas} semanas
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Nivel:</strong> {cursoSeleccionado.nivel}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Costo:</strong> Bs. {cursoSeleccionado.costo_matricula}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Paralelo */}
          {formData.curso_id && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-ciscoBlue" />
                Información del Paralelo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="paralelo_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Paralelo <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paralelo_id"
                    name="paralelo_id"
                    value={formData.paralelo_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                    required
                  >
                    <option value="">Seleccionar paralelo</option>
                    {paralelos.length > 0 ? (
                      paralelos.map((paralelo) => (
                        <option key={paralelo.id} value={paralelo.id.toString()}>
                          {paralelo.nombre_paralelo} - {formatDate(paralelo.fecha_inicio)}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No hay paralelos disponibles para este curso
                      </option>
                    )}
                  </select>
                </div>

                {paraleloSeleccionado && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Paralelo</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Horario:</strong> {paraleloSeleccionado.horario}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Instructor:</strong> {paraleloSeleccionado.instructor_nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Cupos:</strong> {paraleloSeleccionado.inscritos}/{paraleloSeleccionado.max_estudiantes}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Fechas:</strong> {formatDate(paraleloSeleccionado.fecha_inicio)} -{" "}
                      {formatDate(paraleloSeleccionado.fecha_fin)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Aula:</strong> {paraleloSeleccionado.aula || "No asignada"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sección de Pago */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FaCreditCard className="mr-2 text-ciscoBlue" />
              Información de Pago
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  id="metodo_pago"
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                >
                  <option value="">Pago pendiente</option>
                  {metodosPago.map((metodo) => (
                    <option key={metodo.id} value={metodo.id}>
                      {metodo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto (Bs.)
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  step="0.01"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                />
              </div>

              {formData.metodo_pago && (
                <div className="md:col-span-2">
                  <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia de Pago
                  </label>
                  <input
                    type="text"
                    id="referencia"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    placeholder="Ej: TRX-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
              placeholder="Ingrese cualquier información adicional relevante"
            ></textarea>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/admin/academico/inscripciones")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ciscoBlue hover:bg-ciscoDarkBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Procesando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> {isEditing ? "Actualizar" : "Registrar"} Inscripción
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
