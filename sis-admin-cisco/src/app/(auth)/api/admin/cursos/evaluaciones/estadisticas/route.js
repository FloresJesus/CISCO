import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    // Estadísticas generales de evaluaciones
    const [estadisticas] = await query(`
      SELECT 
        COUNT(e.id) as total_evaluaciones,
        COUNT(CASE WHEN e.estado = 'publicado' THEN 1 END) as evaluaciones_publicadas,
        COUNT(CASE WHEN e.estado = 'borrador' THEN 1 END) as evaluaciones_borrador,
        COUNT(DISTINCT e.curso_id) as cursos_con_evaluaciones,
        COUNT(p.id) as total_preguntas,
        COUNT(DISTINCT re.estudiante_id) as estudiantes_evaluados,
        AVG(re.calificacion) as promedio_calificaciones
      FROM evaluacion e
      LEFT JOIN pregunta p ON e.id = p.evaluacion_id
      LEFT JOIN resultado_evaluacion re ON e.id = re.evaluacion_id AND re.estado = 'completado'
    `)

    // Distribución por tipo de evaluación
    const distribucionTipos = await query(`
      SELECT 
        e.tipo,
        COUNT(e.id) as cantidad,
        COUNT(DISTINCT re.estudiante_id) as estudiantes_participantes,
        AVG(re.calificacion) as promedio_calificacion
      FROM evaluacion e
      LEFT JOIN resultado_evaluacion re ON e.id = re.evaluacion_id AND re.estado = 'completado'
      GROUP BY e.tipo
      ORDER BY cantidad DESC
    `)

    // Evaluaciones más populares
    const evaluacionesPopulares = await query(`
      SELECT 
        e.nombre,
        c.nombre as curso_nombre,
        e.tipo,
        COUNT(DISTINCT re.estudiante_id) as participantes,
        AVG(re.calificacion) as promedio_calificacion,
        COUNT(re.id) as total_intentos
      FROM evaluacion e
      JOIN curso c ON e.curso_id = c.id
      LEFT JOIN resultado_evaluacion re ON e.id = re.evaluacion_id
      WHERE e.estado = 'publicado'
      GROUP BY e.id
      HAVING participantes > 0
      ORDER BY participantes DESC
      LIMIT 10
    `)

    return NextResponse.json({
      success: true,
      data: {
        estadisticas,
        distribucionTipos,
        evaluacionesPopulares,
      },
    })
  } catch (error) {
    console.error("Error en estadísticas de evaluaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
