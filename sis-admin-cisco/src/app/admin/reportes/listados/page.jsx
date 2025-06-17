"use client"

import { useState, useEffect } from "react"
import { Filter, Download, FileText, Users, BookOpen, Award, BarChart3, TrendingUp } from "lucide-react"
import { formatDate, formatCurrency } from "@/libs/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import AdminAuthCheck from "@/components/admin/AdminAuthCheck"
import api from "@/libs/api"

export default function EstadisticasReportesPage() {
  const [selectedReport, setSelectedReport] = useState("pagos")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({})
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    curso: "",
    paralelo: "",
    instructor: "",
    estado: "",
    tipoEstudiante: "",
    categoria: "",
    nivel: "",
    metodoPago: "",
  })
  const [options, setOptions] = useState({
    cursos: [],
    paralelos: [],
    instructores: [],
  })

  // Tipos de reportes disponibles
  const reportTypes = [
    { id: "pagos", name: "Pagos de Matrícula", icon: TrendingUp, color: "from-green-500 to-green-600" },
    { id: "personas", name: "Personas Académicas", icon: Users, color: "from-blue-500 to-blue-600" },
    { id: "cursos", name: "Listado de Cursos", icon: BookOpen, color: "from-purple-500 to-purple-600" },
    { id: "cursos-paralelos", name: "Cursos por Paralelos", icon: FileText, color: "from-indigo-500 to-indigo-600" },
    {
      id: "cursos-instructores",
      name: "Cursos con Instructores",
      icon: Award,
      color: "from-yellow-500 to-yellow-600",
    },
    { id: "completo", name: "Curso + Paralelo + Instructor", icon: BarChart3, color: "from-red-500 to-red-600" },
    { id: "notas", name: "Notas + Curso + Paralelo", icon: FileText, color: "from-pink-500 to-pink-600" },
    { id: "aprobados-reprobados", name: "Aprobados/Reprobados", icon: BarChart3, color: "from-teal-500 to-teal-600" },
    { id: "porcentajes", name: "% Aprobado/Reprobado", icon: TrendingUp, color: "from-orange-500 to-orange-600" },
    { id: "egresados", name: "Egresados del Curso", icon: Award, color: "from-emerald-500 to-emerald-600" },
  ]

  // Cargar opciones para filtros
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [cursosRes, paralelosRes, instructoresRes] = await Promise.all([
          api.get("/admin/cursos"),
          api.get("/admin/paralelos"),
          api.get("/admin/instructores"),
        ])

        setOptions({
          cursos: cursosRes.data.cursos || [],
          paralelos: paralelosRes.data.paralelos || [],
          instructores: instructoresRes.data.instructores || [],
        })
      } catch (error) {
        console.error("Error cargando opciones:", error)
        if (error.response?.status === 401) {
          // El interceptor ya maneja la redirección
          return
        }
      }
    }
    loadOptions()
  }, [])

  // Cargar datos del reporte seleccionado
  const loadReportData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value)
      })

      const response = await api.get(`/admin/reportes/listado/${selectedReport}?${params}`)
      setData(response.data)
    } catch (error) {
      console.error(`Error cargando reporte ${selectedReport}:`, error)
      if (error.response?.status === 401) {
        // El interceptor ya maneja la redirección
        return
      }
      // Mostrar mensaje de error al usuario
      setData({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReportData()
  }, [selectedReport])

  // Función para aplicar filtros manualmente
  const handleApplyFilters = () => {
    loadReportData()
  }

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      fechaInicio: "",
      fechaFin: "",
      curso: "",
      paralelo: "",
      instructor: "",
      estado: "",
      tipoEstudiante: "",
      categoria: "",
      nivel: "",
      metodoPago: "",
    })
  }

  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    const reportInfo = reportTypes.find((r) => r.id === selectedReport)

    // Insertar logos
    doc.addImage("/images/cisco2.png", "PNG", 10, 10, 40, 20)
    doc.setFont("helvetica", "normal")
    doc.addImage("/images/utologo.png", "PNG", 170, 10, 20, 20)

    // Título
    doc.setFontSize(20)
    doc.text("REPORTE", 110, 20, { align: "center" })
    doc.text(reportInfo.name, 110, 30, { align: "center" })

    // Información de filtros
    doc.setFontSize(10)
    let yPos = 45
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, yPos)
    yPos += 5

    if (filters.fechaInicio || filters.fechaFin) {
      doc.text(`Período: ${filters.fechaInicio || "Inicio"} - ${filters.fechaFin || "Fin"}`, 20, yPos)
      yPos += 5
    }
    if (filters.curso) {
      const curso = options.cursos.find((c) => c.id.toString() === filters.curso)
      doc.text(`Curso: ${curso?.nombre || filters.curso}`, 20, yPos)
      yPos += 5
    }
    if (filters.tipoEstudiante) {
      doc.text(`Tipo de Estudiante: ${filters.tipoEstudiante.toUpperCase()}`, 20, yPos)
      yPos += 5
    }

    yPos += 10

    // Generar tabla según el tipo de reporte
    generatePDFTable(doc, yPos)

    // Descargar
    doc.save(`${selectedReport}-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  const generatePDFTable = (doc, startY) => {
    const reportData = data[selectedReport] || []

    if (reportData.length === 0) {
      doc.text("No hay datos para mostrar", 20, startY)
      return
    }

    switch (selectedReport) {
      case "pagos":
        autoTable(doc, {
          startY,
          head: [["ID", "Estudiante", "Curso", "Tipo", "Monto", "Método", "Fecha", "Estado"]],
          body: reportData.map((item) => [
            item.id,
            `${item.estudiante_nombre} ${item.estudiante_apellido}`,
            item.curso_nombre,
            item.tipo_estudiante?.toUpperCase() || "N/A",
            formatCurrency(item.monto),
            item.metodo_pago,
            formatDate(item.fecha_pago),
            item.estado,
          ]),
        })
        break

      case "personas":
        autoTable(doc, {
          startY,
          head: [["Nombre", "Email", "Rol", "Tipo", "Estado", "Fecha Registro"]],
          body: reportData.map((item) => [
            `${item.nombre} ${item.apellido}`,
            item.email,
            item.rol,
            item.tipo_estudiante?.toUpperCase() || "N/A",
            item.estado,
            formatDate(item.fecha_registro),
          ]),
        })
        break

      case "cursos":
        autoTable(doc, {
          startY,
          head: [["Código", "Nombre", "Nivel", "Categoría", "Duración", "Costo", "Estado"]],
          body: reportData.map((item) => [
            item.codigo,
            item.nombre,
            item.nivel,
            item.categoria,
            `${item.duracion_semanas} sem`,
            formatCurrency(item.costo_matricula),
            item.estado,
          ]),
        })
        break

      case "cursos-paralelos":
        autoTable(doc, {
          startY,
          head: [["Curso", "Paralelo", "Fecha Inicio", "Fecha Fin", "Horario", "Aula", "Inscritos", "Estado"]],
          body: reportData.map((item) => [
            item.curso_nombre,
            item.nombre_paralelo,
            formatDate(item.fecha_inicio),
            formatDate(item.fecha_fin),
            item.horario || "N/A",
            item.aula || "N/A",
            `${item.total_inscritos}/${item.max_estudiantes}`,
            item.paralelo_estado,
          ]),
        })
        break

      case "cursos-instructores":
        autoTable(doc, {
          startY,
          head: [["Curso", "Instructor", "Email", "Especialidad", "Paralelos", "Estudiantes"]],
          body: reportData.map((item) => [
            item.curso_nombre,
            `${item.instructor_nombre} ${item.instructor_apellido}`,
            item.instructor_email,
            item.especialidad || "N/A",
            item.total_paralelos,
            item.total_estudiantes,
          ]),
        })
        break

      case "completo":
        autoTable(doc, {
          startY,
          head: [["Curso", "Paralelo", "Instructor", "Período", "Inscritos", "Aprobados", "Promedio", "Estado"]],
          body: reportData.map((item) => [
            item.curso_nombre,
            item.nombre_paralelo,
            `${item.instructor_nombre} ${item.instructor_apellido}`,
            `${formatDate(item.fecha_inicio)} - ${formatDate(item.fecha_fin)}`,
            item.total_inscritos,
            item.aprobados,
            item.promedio_notas || "N/A",
            item.paralelo_estado,
          ]),
        })
        break

      case "notas":
        autoTable(doc, {
          startY,
          head: [["Estudiante", "Curso", "Paralelo", "Instructor", "Nota", "Estado", "Certificado"]],
          body: reportData.map((item) => [
            `${item.estudiante_nombre} ${item.estudiante_apellido}`,
            item.curso_nombre,
            item.paralelo_nombre || "N/A",
            `${item.instructor_nombre} ${item.instructor_apellido}`,
            item.calificacion_final ? `${item.calificacion_final}/100` : "Pendiente",
            item.calificacion_final >= 51 ? "Aprobado" : "Reprobado",
            item.certificado_generado ? "Generado" : "Pendiente",
          ]),
        })
        break

      case "aprobados-reprobados":
        autoTable(doc, {
          startY,
          head: [["Curso", "Paralelo", "Instructor", "Total", "Aprobados", "Reprobados", "% Aprobados"]],
          body: reportData.map((item) => [
            item.curso_nombre,
            item.nombre_paralelo,
            `${item.instructor_nombre} ${item.instructor_apellido}`,
            item.total_estudiantes,
            item.aprobados,
            item.reprobados,
            `${item.porcentaje_aprobados || 0}%`,
          ]),
        })
        break

      case "porcentajes":
        autoTable(doc, {
          startY,
          head: [["Curso", "Total", "Aprobados", "% Aprobados", "Reprobados", "% Reprobados", "Promedio"]],
          body: reportData.map((item) => [
            item.curso_nombre,
            item.total_estudiantes,
            item.aprobados,
            `${item.porcentaje_aprobados || 0}%`,
            item.reprobados,
            `${item.porcentaje_reprobados || 0}%`,
            item.promedio_general || "N/A",
          ]),
        })
        break

      case "egresados":
        autoTable(doc, {
          startY,
          head: [["Estudiante", "Curso", "Paralelo", "Instructor", "Nota", "Certificado", "Fecha Egreso"]],
          body: reportData.map((item) => [
            `${item.estudiante_nombre} ${item.estudiante_apellido}`,
            item.curso_nombre,
            item.paralelo_nombre,
            `${item.instructor_nombre} ${item.instructor_apellido}`,
            `${item.calificacion_final}/100`,
            item.certificado_generado ? "Generado" : "Pendiente",
            formatDate(item.certificado_fecha),
          ]),
        })
        break

      default:
        autoTable(doc, {
          startY,
          head: [["Información"]],
          body: [["No se pudo generar la tabla para este tipo de reporte"]],
        })
    }
  }

  // Función para obtener filtros específicos según el reporte
  const getSpecificFilters = () => {
    switch (selectedReport) {
      case "pagos":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                value={filters.metodoPago}
                onChange={(e) => setFilters((prev) => ({ ...prev, metodoPago: e.target.value }))}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Pago</label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="rechazado">Rechazado</option>
                <option value="reembolsado">Reembolsado</option>
              </select>
            </div>
          </>
        )

      case "cursos":
      case "cursos-paralelos":
      case "cursos-instructores":
      case "porcentajes":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters((prev) => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                <option value="ccna">CCNA</option>
                <option value="cyberops">CyberOps</option>
                <option value="devnet">DevNet</option>
                <option value="iot">IoT</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select
                value={filters.nivel}
                onChange={(e) => setFilters((prev) => ({ ...prev, nivel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los niveles</option>
                <option value="introductorio">Introductorio</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
                <option value="experto">Experto</option>
              </select>
            </div>
          </>
        )

      case "notas":
      case "aprobados-reprobados":
      case "completo":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paralelo</label>
              <select
                value={filters.paralelo}
                onChange={(e) => setFilters((prev) => ({ ...prev, paralelo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los paralelos</option>
                {options.paralelos.map((paralelo) => (
                  <option key={paralelo.id} value={paralelo.id}>
                    {paralelo.nombre_paralelo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <select
                value={filters.instructor}
                onChange={(e) => setFilters((prev) => ({ ...prev, instructor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los instructores</option>
                {options.instructores.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.nombre} {instructor.apellido}
                  </option>
                ))}
              </select>
            </div>
          </>
        )

      default:
        return null
    }
  }

  const getTipoEstudianteBadge = (tipo) => {
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          tipo === "interno" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"
        }`}
      >
        {tipo?.toUpperCase() || "N/A"}
      </span>
    )
  }

  const getEstadoBadge = (estado) => {
    const colors = {
      activo: "bg-green-100 text-green-800",
      completado: "bg-blue-100 text-blue-800",
      pendiente: "bg-yellow-100 text-yellow-800",
      cancelado: "bg-red-100 text-red-800",
      disponible: "bg-green-100 text-green-800",
      en_progreso: "bg-blue-100 text-blue-800",
      planificado: "bg-gray-100 text-gray-800",
    }

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[estado] || "bg-gray-100 text-gray-800"}`}
      >
        {estado?.replace("_", " ").toUpperCase()}
      </span>
    )
  }

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    const reportData = data[selectedReport] || []

    if (reportData.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No hay datos disponibles</div>
          <p className="text-gray-400">Intenta ajustar los filtros para obtener resultados</p>
        </div>
      )
    }

    switch (selectedReport) {
      case "pagos":
        return renderPagosTable(reportData)
      case "personas":
        return renderPersonasTable(reportData)
      case "cursos":
        return renderCursosTable(reportData)
      case "cursos-paralelos":
        return renderCursosParalelosTable(reportData)
      case "cursos-instructores":
        return renderCursosInstructoresTable(reportData)
      case "completo":
        return renderCompletoTable(reportData)
      case "notas":
        return renderNotasTable(reportData)
      case "aprobados-reprobados":
        return renderAprobadosTable(reportData)
      case "porcentajes":
        return renderPorcentajesTable(reportData)
      case "egresados":
        return renderEgresadosTable(reportData)
      default:
        return <div className="text-center py-8 text-gray-500">Selecciona un tipo de reporte</div>
    }
  }

  const renderPagosTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((pago) => (
            <tr key={pago.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{pago.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium">
                    {pago.estudiante_nombre} {pago.estudiante_apellido}
                  </div>
                  <div className="text-sm text-gray-500">{pago.estudiante_email}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{pago.curso_nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap">{getTipoEstudianteBadge(pago.tipo_estudiante)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {formatCurrency(pago.monto)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{pago.metodo_pago}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(pago.fecha_pago)}</td>
              <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(pago.estado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderPersonasTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((persona, index) => (
            <tr key={`${persona.rol}-${persona.id}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">
                  {persona.nombre} {persona.apellido}
                </div>
                {persona.telefono && <div className="text-sm text-gray-500">{persona.telefono}</div>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{persona.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    persona.rol === "instructor"
                      ? "bg-blue-100 text-blue-800"
                      : persona.rol === "estudiante"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {persona.rol.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {persona.tipo_estudiante ? getTipoEstudianteBadge(persona.tipo_estudiante) : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(persona.estado)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(persona.fecha_registro)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCursosTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((curso) => (
            <tr key={curso.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{curso.codigo}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{curso.nombre}</div>
                <div className="text-sm text-gray-500">{curso.descripcion?.substring(0, 50)}...</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    curso.nivel === "introductorio"
                      ? "bg-green-100 text-green-800"
                      : curso.nivel === "intermedio"
                        ? "bg-yellow-100 text-yellow-800"
                        : curso.nivel === "avanzado"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {curso.nivel.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {curso.categoria.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {curso.duracion_semanas} sem / {curso.horas_totales} hrs
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {formatCurrency(curso.costo_matricula)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(curso.estado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCursosParalelosTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paralelo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Fin</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aula</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscritos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={`${item.paralelo_id}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{item.curso_nombre}</div>
                <div className="text-sm text-gray-500">{item.curso_codigo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{item.nombre_paralelo}</div>
                <div className="text-sm text-gray-500">{item.codigo_paralelo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(item.fecha_inicio)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(item.fecha_fin)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{item.horario}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{item.aula || "N/A"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="font-medium">{item.total_inscritos}</span>
                <span className="text-gray-500">/{item.max_estudiantes}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(item.paralelo_estado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCursosInstructoresTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paralelos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiantes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={`${item.instructor_id}-${item.curso_codigo}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{item.curso_nombre}</div>
                <div className="text-sm text-gray-500">{item.curso_codigo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">
                  {item.instructor_nombre} {item.instructor_apellido}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{item.instructor_email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{item.especialidad || "N/A"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.total_paralelos}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.total_estudiantes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCompletoTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paralelo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscritos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aprobados</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={`${item.codigo_paralelo}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{item.curso_nombre}</div>
                <div className="text-sm text-gray-500">{item.curso_codigo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{item.nombre_paralelo}</div>
                <div className="text-sm text-gray-500">{item.aula}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">
                  {item.instructor_nombre} {item.instructor_apellido}
                </div>
                <div className="text-sm text-gray-500">{item.especialidad}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div>{formatDate(item.fecha_inicio)}</div>
                <div className="text-gray-500">{formatDate(item.fecha_fin)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.total_inscritos}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium">
                {item.aprobados}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.promedio_notas || "N/A"}</td>
              <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(item.paralelo_estado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderNotasTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paralelo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota Final</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((nota, index) => (
            <tr key={`${nota.estudiante_id}-${nota.inscripcion_id}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">
                  {nota.estudiante_nombre} {nota.estudiante_apellido}
                </div>
                <div className="text-sm text-gray-500">{getTipoEstudianteBadge(nota.tipo_estudiante)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{nota.curso_nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{nota.paralelo_nombre || "N/A"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {nota.instructor_nombre} {nota.instructor_apellido}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {nota.calificacion_final ? (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      nota.calificacion_final >= 51
                        ? "bg-green-100 text-green-800"
                        : nota.calificacion_final >= 40
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {nota.calificacion_final}/100
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Pendiente
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    nota.calificacion_final >= 51 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {nota.calificacion_final >= 51 ? "Aprobado" : "Reprobado"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {nota.certificado_generado ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Generado
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Pendiente
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderAprobadosTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paralelo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aprobados</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reprobados</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Aprobados</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={`${item.codigo_paralelo}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{item.curso_nombre}</div>
                <div className="text-sm text-gray-500">{item.curso_codigo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{item.nombre_paralelo}</div>
                <div className="text-sm text-gray-500">{item.codigo_paralelo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {item.instructor_nombre} {item.instructor_apellido}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div>{formatDate(item.fecha_inicio)}</div>
                <div className="text-gray-500">{formatDate(item.fecha_fin)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{item.total_estudiantes}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                {item.aprobados}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                {item.reprobados}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {item.porcentaje_aprobados || 0}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderPorcentajesTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Estudiantes</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aprobados</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Aprobados</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reprobados</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Reprobados</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Promedio</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((curso) => (
            <tr key={curso.curso_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{curso.curso_nombre}</div>
                <div className="text-sm text-gray-500">{curso.curso_codigo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{curso.total_estudiantes}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                {curso.aprobados}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {curso.porcentaje_aprobados || 0}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                {curso.reprobados}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  {curso.porcentaje_reprobados || 0}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                {curso.promedio_general || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderEgresadosTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paralelo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nota Final</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Certificado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Egreso</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((egresado, index) => (
            <tr key={`${egresado.estudiante_nombre}-${egresado.curso_codigo}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">
                  {egresado.estudiante_nombre} {egresado.estudiante_apellido}
                </div>
                <div className="text-sm text-gray-500">{getTipoEstudianteBadge(egresado.tipo_estudiante)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{egresado.curso_nombre}</div>
                <div className="text-sm text-gray-500">{egresado.curso_codigo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{egresado.paralelo_nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {egresado.instructor_nombre} {egresado.instructor_apellido}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {egresado.calificacion_final}/100
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {egresado.certificado_generado ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Generado
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(egresado.certificado_fecha)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reportes</h1>
            <p className="text-gray-600">Genera reportes detallados con filtros personalizados</p>
          </div>
        </div>

        {/* Selector de Tipo de Reporte */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Seleccionar Tipo de Reporte</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {reportTypes.map((report) => {
                const IconComponent = report.icon
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedReport === report.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center mb-3 mx-auto`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 text-center">{report.name}</h4>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Filtros de Búsqueda</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? "Cargando..." : "Aplicar Filtros"}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtros básicos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={filters.fechaInicio}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={filters.fechaFin}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fechaFin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                <select
                  value={filters.curso}
                  onChange={(e) => setFilters((prev) => ({ ...prev, curso: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los cursos</option>
                  {options.cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Estudiante</label>
                <select
                  value={filters.tipoEstudiante}
                  onChange={(e) => setFilters((prev) => ({ ...prev, tipoEstudiante: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="interno">Interno</option>
                  <option value="externo">Externo</option>
                </select>
              </div>

              {/* Filtros específicos según el reporte */}
              {getSpecificFilters()}
            </div>
          </div>
        </div>

        {/* Contenido del Reporte */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {reportTypes.find((r) => r.id === selectedReport)?.name}
              </h3>
              <p className="text-sm text-gray-600">{data[selectedReport]?.length || 0} registros encontrados</p>
            </div>
            <button
              onClick={exportToPDF}
              disabled={!data[selectedReport]?.length || loading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </button>
          </div>
          <div className="p-6">{renderReportContent()}</div>
        </div>
      </div>
    </AdminAuthCheck>
  )
}
