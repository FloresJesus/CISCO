"use client"

import { useState, useEffect } from "react"
import { FiDollarSign, FiPlus, FiSearch, FiFilter, FiDownload, FiRefreshCw } from "react-icons/fi"
import PagoModal from "@/components/admin/pagos/pago-modal"
import PagoDetalleModal from "@/components/admin/pagos/pago-detalle-modal"
import api from "@/libs/api"

export default function PagosPage() {
  const [pagos, setPagos] = useState([])
  const [loading, setPagosLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [detalleModalOpen, setDetalleModalOpen] = useState(false)
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null)
  const [filtros, setFiltros] = useState({
    estado: "",
    metodo_pago: "",
    fecha_desde: "",
    fecha_hasta: "",
    busqueda: "",
  })
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 0,
  })
  const [estudiantes, setEstudiantes] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [cursos, setCursos] = useState([])
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    cargarPagos()
    cargarEstudiantes()
    cargarInscripciones()
    cargarCursos()
  }, [paginacion.pagina, filtros])

  // Función para cargar pagos con filtros
  const cargarPagos = async () => {
    try {
      setPagosLoading(true)
      const params = new URLSearchParams({
        pagina: paginacion.pagina,
        limite: paginacion.limite,
        ...filtros,
      })

      const response = await api.get(`/admin/pagos?${params.toString()}`)
      setPagos(response.data.data)
      setPaginacion({
        ...paginacion,
        total: response.data.pagination.total,
        totalPaginas: response.data.pagination.totalPages,
      })
    } catch (err) {
      console.error("Error al cargar pagos:", err)
      setError("Error al cargar los pagos. Por favor, intente nuevamente.")
    } finally {
      setPagosLoading(false)
    }
  }

  // Cargar datos relacionados
  const cargarEstudiantes = async () => {
    try {
      const response = await api.get("/admin/estudiantes")
      setEstudiantes(response.data.estudiantes)
    } catch (err) {
      console.error("Error al cargar estudiantes:", err)
    }
  }

  const cargarInscripciones = async () => {
    try {
      const response = await api.get("/admin/inscripciones")
      console.log("Inscripciones cargadas:", response.data)
      setInscripciones(response.data.inscripciones)
    } catch (err) {
      console.error("Error al cargar inscripciones:", err)
    }
  }

  const cargarCursos = async () => {
    try {
      const response = await api.get("/admin/cursos")
      setCursos(response.data.cursos)
    } catch (err) {
      console.error("Error al cargar cursos:", err)
    }
  }

  // Funciones para manejar pagos
  const handleCrearPago = async (nuevoPago) => {
    try {
      await api.post("/admin/pagos", nuevoPago)
      setModalOpen(false)
      cargarPagos()
    } catch (err) {
      console.error("Error al crear pago:", err)
      alert("Error al crear el pago. Por favor, intente nuevamente.")
    }
  }

  const handleActualizarPago = async (pagoActualizado) => {
    try {
      await api.put(`/admin/pagos/${pagoActualizado.id}`, pagoActualizado)
      setModalOpen(false)
      setDetalleModalOpen(false)
      cargarPagos()
    } catch (err) {
      console.error("Error al actualizar pago:", err)
      alert("Error al actualizar el pago. Por favor, intente nuevamente.")
    }
  }

  const handleEliminarPago = async (id) => {
    if (!confirm("¿Está seguro que desea eliminar este pago? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await api.delete(`/admin/pagos/${id}`)
      setDetalleModalOpen(false)
      cargarPagos()
    } catch (err) {
      console.error("Error al eliminar pago:", err)
      alert("Error al eliminar el pago. Por favor, intente nuevamente.")
    }
  }

  // Funciones para manejar filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros({
      ...filtros,
      [campo]: valor,
    })
    setPaginacion({
      ...paginacion,
      pagina: 1, // Resetear a primera página al filtrar
    })
  }

  const limpiarFiltros = () => {
    setFiltros({
      estado: "",
      metodo_pago: "",
      fecha_desde: "",
      fecha_hasta: "",
      busqueda: "",
    })
  }

  // Función para exportar pagos
  const exportarPagos = async () => {
    try {
      const params = new URLSearchParams(filtros)
      window.open(`/admin/pagos/export?${params.toString()}`, "_blank")
    } catch (err) {
      console.error("Error al exportar pagos:", err)
      alert("Error al exportar los pagos. Por favor, intente nuevamente.")
    }
  }

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

    return inscripcion.curso_nombre || "Desconocido"
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

  // Función para renderizar el método de pago
  const renderMetodoPago = (metodo) => {
    const iconos = {
      transferencia: "💸",
      tarjeta: "💳",
      efectivo: "💵",
      otro: "🔄",
    }

    return (
      <span>
        {iconos[metodo] || "🔄"} {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiDollarSign className="mr-2 text-blue-600" /> Hitorial de Pagos
        </h1>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por referencia o estudiante..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiFilter className="mr-2" /> Filtros
          </button>
          {/*<button
            onClick={exportarPagos}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiDownload className="mr-2" /> Exportar
          </button>
          <button
            onClick={cargarPagos}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiRefreshCw className="mr-2" /> Actualizar
          </button>*/}
        </div>

        {/* Panel de filtros avanzados */}
        {mostrarFiltros && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange("estado", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="reembolsado">Reembolsado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                <select
                  value={filtros.metodo_pago}
                  onChange={(e) => handleFiltroChange("metodo_pago", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los métodos</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
                <input
                  type="date"
                  value={filtros.fecha_desde}
                  onChange={(e) => handleFiltroChange("fecha_desde", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
                <input
                  type="date"
                  value={filtros.fecha_hasta}
                  onChange={(e) => handleFiltroChange("fecha_hasta", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Limpiar Filtros
              </button>
              <button
                onClick={() => setMostrarFiltros(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de pagos */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    Cargando pagos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron pagos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setPagoSeleccionado(pago)
                      setDetalleModalOpen(true)
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {obtenerNombreEstudiante(pago.inscripcion_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {obtenerNombreCurso(pago.inscripcion_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatearMonto(pago.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(pago.fecha_pago)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderMetodoPago(pago.metodo_pago)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderEstadoPago(pago.estado)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pago.referencia || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{pagos.length}</span> de{" "}
          <span className="font-medium">{paginacion.total}</span> pagos
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 border border-gray-300 rounded-md ${
              paginacion.pagina === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            disabled={paginacion.pagina === 1}
            onClick={() => setPaginacion({ ...paginacion, pagina: paginacion.pagina - 1 })}
          >
            Anterior
          </button>
          <button
            className={`px-4 py-2 border border-gray-300 rounded-md ${
              paginacion.pagina >= paginacion.totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            disabled={paginacion.pagina >= paginacion.totalPaginas}
            onClick={() => setPaginacion({ ...paginacion, pagina: paginacion.pagina + 1 })}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal para crear/editar pago */}
      {modalOpen && (
        <PagoModal
          pago={pagoSeleccionado}
          inscripciones={inscripciones}
          estudiantes={estudiantes}
          cursos={cursos}
          onClose={() => setModalOpen(false)}
          onGuardar={pagoSeleccionado ? handleActualizarPago : handleCrearPago}
        />
      )}

      {/* Modal para ver detalles de pago */}
      {detalleModalOpen && pagoSeleccionado && (
        <PagoDetalleModal
          pago={pagoSeleccionado}
          inscripciones={inscripciones}
          estudiantes={estudiantes}
          cursos={cursos}
          onClose={() => setDetalleModalOpen(false)}
          onEditar={() => {
            setDetalleModalOpen(false)
            setModalOpen(true)
          }}
          onEliminar={handleEliminarPago}
        />
      )}
    </div>
  )
}
// This code is a React component for managing payments in an admin dashboard.