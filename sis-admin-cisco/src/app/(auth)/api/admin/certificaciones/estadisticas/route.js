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

    // Estadísticas generales de certificaciones
    const [estadisticas] = await query(`
  SELECT 
    COUNT(CASE WHEN cert.id IS NOT NULL THEN 1 END) as certificados_emitidos,
    COUNT(CASE WHEN i.calificacion_final >= 7 AND cert.id IS NULL THEN 1 END) as certificados_pendientes,
    COUNT(DISTINCT CASE WHEN cert.id IS NOT NULL THEN i.estudiante_id END) as estudiantes_certificados,
    COUNT(DISTINCT CASE WHEN i.calificacion_final >= 7 THEN p.curso_id END) as cursos_certificables
  FROM inscripcion i
  JOIN paralelo p ON i.paralelo_id = p.id
  LEFT JOIN certificado cert ON i.id = cert.inscripcion_id
  WHERE i.estado IN ('activa', 'completada')
`)

    return NextResponse.json({
      success: true,
      data: estadisticas,
    })
  } catch (error) {
    console.error("Error en estadísticas de certificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
