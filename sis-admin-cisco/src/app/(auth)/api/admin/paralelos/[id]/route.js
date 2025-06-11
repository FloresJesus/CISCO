import { NextResponse } from "next/server"
import db from "@/libs/db"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Consulta principal del paralelo
    const paraleloQuery = `
      SELECT 
        p.*,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo,
        c.descripcion as curso_descripcion,
        c.categoria as curso_categoria,
        c.nivel as curso_nivel,
        i.nombre as instructor_nombre,
        i.apellido as instructor_apellido,
        i.email as instructor_email,
        COUNT(DISTINCT ins.id) as total_inscritos
      FROM paralelo p
      LEFT JOIN curso c ON p.curso_id = c.id
      LEFT JOIN instructor i ON p.instructor_id = i.id
      LEFT JOIN inscripcion ins ON p.id = ins.paralelo_id AND ins.estado != 'cancelada'
      WHERE p.id = ?
      GROUP BY p.id
    `

    // Consulta de estudiantes con tipo de estudiante
    const estudiantesQuery = `
      SELECT 
        ins.id as inscripcion_id,
        ins.fecha_inscripcion,
        ins.estado,
        ins.calificacion_final as calificacion,
        e.id,
        e.nombre,
        e.apellido,
        e.email,
        e.telefono,
        e.tipo_estudiante,
        COALESCE(
          (SELECT COUNT(*) 
           FROM asistencia a 
           WHERE a.estudiante_id = e.id 
           AND a.paralelo_id = p.id 
           AND a.estado = 'presente'), 0
        ) as asistencias_presentes,
        COALESCE(
          (SELECT COUNT(*) 
           FROM asistencia a 
           WHERE a.estudiante_id = e.id 
           AND a.paralelo_id = p.id), 0
        ) as total_asistencias,
        CASE 
          WHEN (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = p.id) > 0
          THEN ROUND(
            (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = p.id AND a.estado = 'presente') * 100.0 /
            (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = p.id), 1
          )
          ELSE 0
        END as asistencia
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      JOIN paralelo p ON ins.paralelo_id = p.id
      WHERE ins.paralelo_id = ? AND ins.estado != 'cancelada'
      ORDER BY e.apellido, e.nombre
    `

    // Consulta de asistencias por fecha
    const asistenciasQuery = `
      SELECT 
        a.fecha,
        COUNT(DISTINCT a.estudiante_id) as total_estudiantes,
        COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as presentes,
        COUNT(CASE WHEN a.estado = 'ausente' THEN 1 END) as ausentes,
        COUNT(CASE WHEN a.estado = 'justificado' THEN 1 END) as justificados,
        COUNT(CASE WHEN a.estado = 'tardanza' THEN 1 END) as tardanzas,
        ROUND(
          COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) * 100.0 / 
          COUNT(DISTINCT a.estudiante_id), 1
        ) as porcentaje_asistencia,
        'Sin tema' as tema
      FROM asistencia a
      WHERE a.paralelo_id = ?
      GROUP BY a.fecha
      ORDER BY a.fecha DESC
      LIMIT 10
    `

    // Consulta de estadísticas
    const estadisticasQuery = `
      SELECT 
        COUNT(DISTINCT ins.id) as total_estudiantes,
        COUNT(DISTINCT CASE WHEN e.tipo_estudiante = 'interno' THEN ins.id END) as estudiantes_internos,
        COUNT(DISTINCT CASE WHEN e.tipo_estudiante = 'externo' THEN ins.id END) as estudiantes_externos,
        AVG(ins.calificacion_final) as calificacion_promedio,
        AVG(CASE WHEN e.tipo_estudiante = 'interno' THEN ins.calificacion_final END) as promedio_internos,
        AVG(CASE WHEN e.tipo_estudiante = 'externo' THEN ins.calificacion_final END) as promedio_externos,
        COUNT(CASE WHEN ins.calificacion_final >= 7 THEN 1 END) as total_aprobados,
        COUNT(CASE WHEN ins.calificacion_final < 7 AND ins.calificacion_final IS NOT NULL THEN 1 END) as total_reprobados,
        COUNT(CASE WHEN ins.calificacion_final >= 7 AND e.tipo_estudiante = 'interno' THEN 1 END) as aprobados_internos,
        COUNT(CASE WHEN ins.calificacion_final >= 7 AND e.tipo_estudiante = 'externo' THEN 1 END) as aprobados_externos
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      WHERE ins.paralelo_id = ? AND ins.estado != 'cancelada'
    `

    // Ejecutar todas las consultas
    const [paraleloResult, estudiantes, asistencias, estadisticasResult] = await Promise.all([
      db.query(paraleloQuery, [id]),
      db.query(estudiantesQuery, [id]),
      db.query(asistenciasQuery, [id]),
      db.query(estadisticasQuery, [id]),
    ])

    if (!paraleloResult || paraleloResult.length === 0) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    const paralelo = paraleloResult[0]
    const estadisticas = estadisticasResult[0] || {}

    // Formatear estadísticas
    const estadisticasFormateadas = {
      total_estudiantes: estadisticas.total_estudiantes || 0,
      estudiantes_internos: estadisticas.estudiantes_internos || 0,
      estudiantes_externos: estadisticas.estudiantes_externos || 0,
      calificacion_promedio: Number.parseFloat(estadisticas.calificacion_promedio || 0).toFixed(1),
      promedio_internos: Number.parseFloat(estadisticas.promedio_internos || 0).toFixed(1),
      promedio_externos: Number.parseFloat(estadisticas.promedio_externos || 0).toFixed(1),
      total_aprobados: estadisticas.total_aprobados || 0,
      total_reprobados: estadisticas.total_reprobados || 0,
      aprobados_internos: estadisticas.aprobados_internos || 0,
      aprobados_externos: estadisticas.aprobados_externos || 0,
      asistencia_promedio: 0, // Añadido para compatibilidad con el frontend
    }

    const response = {
      ...paralelo,
      estudiantes: estudiantes || [],
      asistencias: asistencias || [],
      estadisticas: estadisticasFormateadas,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al obtener paralelo:", error)
    return NextResponse.json({ error: "Error al obtener el paralelo" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const {
      nombre_paralelo,
      codigo_paralelo,
      fecha_inicio,
      fecha_fin,
      horario,
      aula,
      max_estudiantes,
      estado,
      instructor_id,
    } = body

    // Verificar que el paralelo existe
    const existeQuery = `SELECT id FROM paralelo WHERE id = ?`
    const existeResult = await db.query(existeQuery, [id])

    if (!existeResult || existeResult.length === 0) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    // Verificar que el instructor existe
    if (instructor_id) {
      const instructorQuery = `SELECT id FROM instructor WHERE id = ?`
      const instructorResult = await db.query(instructorQuery, [instructor_id])

      if (!instructorResult || instructorResult.length === 0) {
        return NextResponse.json({ error: "Instructor no encontrado" }, { status: 404 })
      }
    }

    const updateQuery = `
      UPDATE paralelo 
      SET 
        nombre_paralelo = ?,
        codigo_paralelo = ?,
        fecha_inicio = ?,
        fecha_fin = ?,
        horario = ?,
        aula = ?,
        max_estudiantes = ?,
        estado = ?,
        instructor_id = ?
      WHERE id = ?
    `

    await db.query(updateQuery, [
      nombre_paralelo,
      codigo_paralelo,
      fecha_inicio,
      fecha_fin,
      horario,
      aula,
      max_estudiantes,
      estado,
      instructor_id,
      id,
    ])

    return NextResponse.json({ message: "Paralelo actualizado exitosamente" })
  } catch (error) {
    console.error("Error al actualizar paralelo:", error)
    return NextResponse.json({ error: "Error al actualizar el paralelo" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Verificar si hay inscripciones activas
    const inscripcionesQuery = `
      SELECT COUNT(*) as total 
      FROM inscripcion 
      WHERE paralelo_id = ? AND estado IN ('activa')
    `

    const inscripcionesResult = await db.query(inscripcionesQuery, [id])

    if (inscripcionesResult[0].total > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el paralelo porque tiene inscripciones activas" },
        { status: 400 },
      )
    }

    // Eliminar el paralelo
    const deleteQuery = `DELETE FROM paralelo WHERE id = ?`
    await db.query(deleteQuery, [id])

    return NextResponse.json({ message: "Paralelo eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar paralelo:", error)
    return NextResponse.json({ error: "Error al eliminar el paralelo" }, { status: 500 })
  }
}
