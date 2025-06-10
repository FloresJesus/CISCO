import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    // Estadísticas generales de calificaciones
    const [estadisticas] = await query(`
      SELECT 
        COUNT(DISTINCT i.estudiante_id) as total_estudiantes,
        AVG(CASE WHEN i.calificacion_final IS NOT NULL THEN i.calificacion_final END) as promedio_general,
        COUNT(CASE WHEN i.calificacion_final >= 51 THEN 1 END) as aprobados,
        COUNT(CASE WHEN i.calificacion_final IS NOT NULL THEN 1 END) as total_calificados,
        ROUND(COUNT(CASE WHEN i.calificacion_final >= 51 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN i.calificacion_final IS NOT NULL THEN 1 END), 0), 2) as tasa_aprobacion,
        COUNT(DISTINCT p.curso_id) as cursos_activos
      FROM inscripcion i
      JOIN paralelo p ON i.paralelo_id = p.id
      WHERE i.estado IN ('activa', 'completada')
    `)

    return NextResponse.json({
      success: true,
      data: estadisticas,
    })
  } catch (error) {
    console.error("Error en estadísticas de calificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
