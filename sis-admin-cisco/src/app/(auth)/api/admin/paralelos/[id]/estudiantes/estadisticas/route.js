import { NextResponse } from "next/server"
import db from "@/libs/db"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Estadísticas generales por tipo de estudiante
    const estadisticasGeneralesQuery = `
      SELECT 
        e.tipo_estudiante,
        COUNT(*) as total_estudiantes,
        AVG(ins.calificacion_final) as promedio_calificacion,
        COUNT(CASE WHEN ins.calificacion_final >= 7 THEN 1 END) as aprobados,
        COUNT(CASE WHEN ins.calificacion_final < 7 AND ins.calificacion_final IS NOT NULL THEN 1 END) as reprobados,
        COUNT(CASE WHEN ins.calificacion_final IS NULL THEN 1 END) as sin_calificar,
        AVG(
          CASE 
            WHEN (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id) > 0
            THEN (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id AND a.estado = 'presente') * 100.0 /
                 (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id)
            ELSE 0
          END
        ) as promedio_asistencia,
        COUNT(CASE WHEN ins.certificado_generado = 1 THEN 1 END) as certificados_generados
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      WHERE ins.paralelo_id = ? AND ins.estado != 'cancelada'
      GROUP BY e.tipo_estudiante
    `

    // Distribución de calificaciones por tipo
    const distribucionCalificacionesQuery = `
      SELECT 
        e.tipo_estudiante,
        CASE 
          WHEN ins.calificacion_final >= 9 THEN 'Excelente (9-10)'
          WHEN ins.calificacion_final >= 8 THEN 'Muy Bueno (8-8.9)'
          WHEN ins.calificacion_final >= 7 THEN 'Bueno (7-7.9)'
          WHEN ins.calificacion_final >= 6 THEN 'Regular (6-6.9)'
          WHEN ins.calificacion_final < 6 THEN 'Insuficiente (<6)'
          ELSE 'Sin Calificar'
        END as rango_calificacion,
        COUNT(*) as cantidad
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      WHERE ins.paralelo_id = ? AND ins.estado != 'cancelada'
      GROUP BY e.tipo_estudiante, rango_calificacion
      ORDER BY e.tipo_estudiante, ins.calificacion_final DESC
    `

    // Distribución de asistencia por tipo
    const distribucionAsistenciaQuery = `
      SELECT 
        e.tipo_estudiante,
        CASE 
          WHEN asistencia_porcentaje >= 90 THEN 'Excelente (90-100%)'
          WHEN asistencia_porcentaje >= 80 THEN 'Muy Buena (80-89%)'
          WHEN asistencia_porcentaje >= 70 THEN 'Buena (70-79%)'
          WHEN asistencia_porcentaje >= 60 THEN 'Regular (60-69%)'
          ELSE 'Deficiente (<60%)'
        END as rango_asistencia,
        COUNT(*) as cantidad
      FROM (
        SELECT 
          e.tipo_estudiante,
          CASE 
            WHEN (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id) > 0
            THEN (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id AND a.estado = 'presente') * 100.0 /
                 (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id)
            ELSE 0
          END as asistencia_porcentaje
        FROM inscripcion ins
        JOIN estudiante e ON ins.estudiante_id = e.id
        WHERE ins.paralelo_id = ? AND ins.estado != 'cancelada'
      ) as asistencias_calculadas
      GROUP BY tipo_estudiante, rango_asistencia
      ORDER BY tipo_estudiante
    `

    // Evolución temporal de inscripciones por tipo
    const evolucionInscripcionesQuery = `
      SELECT 
        e.tipo_estudiante,
        DATE(ins.fecha_inscripcion) as fecha,
        COUNT(*) as inscripciones_dia
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      WHERE ins.paralelo_id = ? AND ins.estado != 'cancelada'
      GROUP BY e.tipo_estudiante, DATE(ins.fecha_inscripcion)
      ORDER BY fecha
    `

    // Comparativa de rendimiento por estado del estudiante
    const rendimientoPorEstadoQuery = `
      SELECT 
        e.tipo_estudiante,
        e.estado as estado_estudiante,
        COUNT(*) as total,
        AVG(ins.calificacion_final) as promedio_calificacion,
        COUNT(CASE WHEN ins.calificacion_final >= 7 THEN 1 END) as aprobados
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      WHERE ins.paralelo_id = ? AND ins.estado != 'cancelada'
      GROUP BY e.tipo_estudiante, e.estado
      ORDER BY e.tipo_estudiante, e.estado
    `

    // Ejecutar todas las consultas
    const [
      estadisticasGenerales,
      distribucionCalificaciones,
      distribucionAsistencia,
      evolucionInscripciones,
      rendimientoPorEstado,
    ] = await Promise.all([
      db.query(estadisticasGeneralesQuery, [id]),
      db.query(distribucionCalificacionesQuery, [id]),
      db.query(distribucionAsistenciaQuery, [id]),
      db.query(evolucionInscripcionesQuery, [id]),
      db.query(rendimientoPorEstadoQuery, [id]),
    ])

    // Formatear estadísticas generales
    const estadisticasFormateadas = estadisticasGenerales.map((stat) => ({
      ...stat,
      promedio_calificacion: Number.parseFloat(stat.promedio_calificacion || 0).toFixed(2),
      promedio_asistencia: Number.parseFloat(stat.promedio_asistencia || 0).toFixed(1),
      porcentaje_aprobacion:
        stat.total_estudiantes > 0 ? Number.parseFloat((stat.aprobados / stat.total_estudiantes) * 100).toFixed(1) : 0,
      porcentaje_certificados:
        stat.total_estudiantes > 0
          ? Number.parseFloat((stat.certificados_generados / stat.total_estudiantes) * 100).toFixed(1)
          : 0,
    }))

    // Calcular totales generales
    const totales = {
      total_estudiantes: estadisticasGenerales.reduce((sum, stat) => sum + stat.total_estudiantes, 0),
      total_aprobados: estadisticasGenerales.reduce((sum, stat) => sum + stat.aprobados, 0),
      total_reprobados: estadisticasGenerales.reduce((sum, stat) => sum + stat.reprobados, 0),
      promedio_general:
        estadisticasGenerales.length > 0
          ? Number.parseFloat(
              estadisticasGenerales.reduce((sum, stat) => sum + (stat.promedio_calificacion || 0), 0) /
                estadisticasGenerales.length,
            ).toFixed(2)
          : 0,
    }

    return NextResponse.json({
      estadisticas_generales: estadisticasFormateadas,
      distribucion_calificaciones: distribucionCalificaciones,
      distribucion_asistencia: distribucionAsistencia,
      evolucion_inscripciones: evolucionInscripciones,
      rendimiento_por_estado: rendimientoPorEstado.map((r) => ({
        ...r,
        promedio_calificacion: Number.parseFloat(r.promedio_calificacion || 0).toFixed(2),
        porcentaje_aprobacion: r.total > 0 ? Number.parseFloat((r.aprobados / r.total) * 100).toFixed(1) : 0,
      })),
      totales,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas del paralelo:", error)
    return NextResponse.json({ error: "Error al obtener las estadísticas del paralelo" }, { status: 500 })
  }
}
