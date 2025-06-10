"use client"

import {
  FiDollarSign,
  FiX,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUser,
  FiBook,
  FiCalendar,
  FiCreditCard,
} from "react-icons/fi"

export default function PagoDetalleModal({ pago, inscripciones, estudiantes, cursos, onClose, onEditar, onEliminar }) {
  // Función para obtener nombre de estudiante por inscripción
  const obtenerNombreEstudiante = (inscripcionId) => {
    const inscripcion = inscripciones.find((i) => i.id === inscripcionId)
    if (!inscripcion) return "Desconocido"

    const estudiante = estudiantes.find((e) => e.id === inscripcion.estudiante_id)
    return estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : "Desconocido"
  }

  // Función para obtener nombre de curso por inscripción
  const obtenerNombreCurso = (inscripcionId) => {
    const inscripcion = inscripciones.find((i) => i.id === inscripcionId)
    if (!inscripcion) return "Desconocido"

    const paralelo = inscripcion.paralelo_id
    const curso = cursos.find((c) => c.id === paralelo?.curso_id)
    return curso ? curso.nombre : "Desconocido"
  }

  // Función para renderizar el estado del pago con color
  const renderEstadoPago = (estado) => {
    const estilos = {
      pendiente: "bg-yellow-100 text-yellow-800",
      completado: "bg-green-100 text-green-800",
      rechazado: "bg-red-100 text-red-800",
      reembolsado: "bg-blue-100 text-blue-800",
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estilos[estado] || "bg-gray-100 text-gray-800"}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    )
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Función para formatear monto
  const formatearMonto = (monto) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "BOB",
    }).format(monto)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FiDollarSign className="mr-2 text-blue-600" />
              Detalle del Pago #{pago.id}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Información principal */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Información del Pago</h3>
                <div>{renderEstadoPago(pago.estado)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FiDollarSign className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Monto</p>
                    <p className="font-medium">{formatearMonto(pago.monto)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCalendar className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Pago</p>
                    <p className="font-medium">{formatearFecha(pago.fecha_pago)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCreditCard className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Método de Pago</p>
                    <p className="font-medium">
                      {pago.metodo_pago.charAt(0).toUpperCase() + pago.metodo_pago.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCreditCard className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Referencia</p>
                    <p className="font-medium">{pago.referencia || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del estudiante y curso */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información de la Inscripción</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FiUser className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Estudiante</p>
                    <p className="font-medium">{obtenerNombreEstudiante(pago.inscripcion_id)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiBook className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Curso</p>
                    <p className="font-medium">{obtenerNombreCurso(pago.inscripcion_id)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {pago.observaciones && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Observaciones</h3>
                <p className="text-gray-700">{pago.observaciones}</p>
              </div>
            )}

            {/* Comprobante */}
            {pago.comprobante && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Comprobante</h3>
                <div className="flex items-center">
                  <a
                    href={pago.comprobante}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FiDownload className="mr-1" /> Ver comprobante
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onEliminar(pago.id)}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100"
            >
              <FiTrash2 className="inline mr-2" /> Eliminar
            </button>
            <button
              type="button"
              onClick={onEditar}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FiEdit className="inline mr-2" /> Editar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
