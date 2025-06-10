"use client"

import { useState, useEffect } from "react"
import { FiDollarSign, FiX, FiCalendar, FiCreditCard, FiFileText } from "react-icons/fi"

export default function PagoModal({ pago, inscripciones, estudiantes, cursos, onClose, onGuardar }) {
  const [formData, setFormData] = useState({
    inscripcion_id: "",
    monto: "",
    fecha_pago: new Date().toISOString().split("T")[0],
    metodo_pago: "transferencia",
    referencia: "",
    estado: "pendiente",
    comprobante: "",
    observaciones: "",
  })
  const [errores, setErrores] = useState({})
  const [inscripcionesDisponibles, setInscripcionesDisponibles] = useState([])

  // Si es edición, cargar datos del pago
  useEffect(() => {
    if (pago) {
      setFormData({
        ...pago,
        fecha_pago: new Date(pago.fecha_pago).toISOString().split("T")[0],
      })
    }

    // Filtrar inscripciones disponibles (activas)
    if (inscripciones) {
      const disponibles = inscripciones.filter((i) => i.estado === "activa" || (pago && i.id === pago.inscripcion_id))
      setInscripcionesDisponibles(disponibles)
    }
  }, [pago, inscripciones])

  // Manejar cambios en el formulario
  const handleChange = (campo, valor) => {
    setFormData({
      ...formData,
      [campo]: valor,
    })

    // Limpiar error del campo
    if (errores[campo]) {
      setErrores({
        ...errores,
        [campo]: null,
      })
    }
  }

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.inscripcion_id) {
      nuevosErrores.inscripcion_id = "Debe seleccionar una inscripción"
    }

    if (!formData.monto || Number.parseFloat(formData.monto) <= 0) {
      nuevosErrores.monto = "El monto debe ser mayor a 0"
    }

    if (!formData.fecha_pago) {
      nuevosErrores.fecha_pago = "Debe ingresar una fecha de pago"
    }

    if (!formData.metodo_pago) {
      nuevosErrores.metodo_pago = "Debe seleccionar un método de pago"
    }

    if (!formData.estado) {
      nuevosErrores.estado = "Debe seleccionar un estado"
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validarFormulario()) {
      // Convertir monto a número
      const pagoFinal = {
        ...formData,
        monto: Number.parseFloat(formData.monto),
      }

      onGuardar(pagoFinal)
    }
  }

  // Función para obtener nombre de estudiante por inscripción
  const obtenerNombreEstudiante = (inscripcionId) => {
    const inscripcion = inscripciones.find((i) => i.id === Number.parseInt(inscripcionId))
    if (!inscripcion) return "Desconocido"

    const estudiante = estudiantes.find((e) => e.id === inscripcion.estudiante_id)
    return estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : "Desconocido"
  }

  // Función para obtener nombre de curso por inscripción
  const obtenerNombreCurso = (inscripcionId) => {
    const inscripcion = inscripciones.find((i) => i.id === Number.parseInt(inscripcionId))
    if (!inscripcion) return "Desconocido"

    const paralelo = inscripcion.paralelo_id
    const curso = cursos.find((c) => c.id === paralelo?.curso_id)
    return curso ? curso.nombre : "Desconocido"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FiDollarSign className="mr-2 text-blue-600" />
              {pago ? "Editar Pago" : "Registrar Nuevo Pago"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Inscripción */}
              <div>
                <label htmlFor="inscripcion_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Inscripción
                </label>
                <select
                  id="inscripcion_id"
                  value={formData.inscripcion_id.toString()}
                  onChange={(e) => handleChange("inscripcion_id", Number.parseInt(e.target.value))}
                  disabled={pago !== null} // No permitir cambiar inscripción en edición
                  className={`w-full px-3 py-2 border ${
                    errores.inscripcion_id ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Seleccione una inscripción</option>
                  {inscripcionesDisponibles.map((inscripcion) => (
                    <option key={inscripcion.id} value={inscripcion.id.toString()}>
                      {obtenerNombreEstudiante(inscripcion.id)} - {obtenerNombreCurso(inscripcion.id)}
                    </option>
                  ))}
                </select>
                {errores.inscripcion_id && <p className="text-red-500 text-xs mt-1">{errores.inscripcion_id}</p>}
              </div>

              {/* Monto */}
              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto (Bs)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">Bs</span>
                  <input
                    id="monto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monto}
                    onChange={(e) => handleChange("monto", e.target.value)}
                    className={`w-full pl-8 px-3 py-2 border ${
                      errores.monto ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errores.monto && <p className="text-red-500 text-xs mt-1">{errores.monto}</p>}
              </div>

              {/* Fecha de pago */}
              <div>
                <label htmlFor="fecha_pago" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Pago
                </label>
                <div className="relative">
                  <input
                    id="fecha_pago"
                    type="date"
                    value={formData.fecha_pago}
                    onChange={(e) => handleChange("fecha_pago", e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errores.fecha_pago ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <FiCalendar className="absolute right-3 top-2.5 text-gray-500" />
                </div>
                {errores.fecha_pago && <p className="text-red-500 text-xs mt-1">{errores.fecha_pago}</p>}
              </div>

              {/* Método de pago */}
              <div>
                <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  id="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={(e) => handleChange("metodo_pago", e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errores.metodo_pago ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="otro">Otro</option>
                </select>
                {errores.metodo_pago && <p className="text-red-500 text-xs mt-1">{errores.metodo_pago}</p>}
              </div>

              {/* Referencia */}
              <div>
                <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia
                </label>
                <div className="relative">
                  <input
                    id="referencia"
                    type="text"
                    value={formData.referencia || ""}
                    onChange={(e) => handleChange("referencia", e.target.value)}
                    placeholder="Número de transacción, recibo, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FiCreditCard className="absolute right-3 top-2.5 text-gray-500" />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errores.estado ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="reembolsado">Reembolsado</option>
                </select>
                {errores.estado && <p className="text-red-500 text-xs mt-1">{errores.estado}</p>}
              </div>

              {/* Comprobante */}
              <div>
                <label htmlFor="comprobante" className="block text-sm font-medium text-gray-700 mb-1">
                  Comprobante (URL)
                </label>
                <div className="relative">
                  <input
                    id="comprobante"
                    type="text"
                    value={formData.comprobante || ""}
                    onChange={(e) => handleChange("comprobante", e.target.value)}
                    placeholder="URL del comprobante"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FiFileText className="absolute right-3 top-2.5 text-gray-500" />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones || ""}
                  onChange={(e) => handleChange("observaciones", e.target.value)}
                  placeholder="Observaciones adicionales sobre el pago"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {pago ? "Actualizar Pago" : "Registrar Pago"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
