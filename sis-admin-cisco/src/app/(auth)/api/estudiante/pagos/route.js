import { verifyStudentToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    const authResult = await verifyStudentToken(request)
    if (!authResult.success) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = authResult.user.id

    // Obtener estudiante
    const [estudiante] = await query("SELECT id FROM estudiante WHERE usuario_id = ?", [userId])

    if (!estudiante) {
      return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Obtener pagos del estudiante
    const pagos = await query(
      `
      SELECT 
        p.id,
        p.monto,
        p.fecha_pago,
        p.metodo_pago,
        p.referencia,
        p.estado,
        p.comprobante,
        p.observaciones,
        c.nombre as curso_nombre,
        par.nombre_paralelo,
        i.fecha_inscripcion
      FROM pago p
      JOIN inscripcion i ON p.inscripcion_id = i.id
      JOIN paralelo par ON i.paralelo_id = par.id
      JOIN curso c ON par.curso_id = c.id
      WHERE i.estudiante_id = ?
      ORDER BY p.fecha_pago DESC
    `,
      [estudiante.id],
    )

    // Estadísticas de pagos
    const [estadisticas] = await query(
      `
      SELECT 
        COUNT(*) as total_pagos,
        SUM(p.monto) as total_pagado,
        SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as total_completado,
        SUM(CASE WHEN p.estado = 'pendiente' THEN p.monto ELSE 0 END) as total_pendiente,
        COUNT(CASE WHEN p.estado = 'completado' THEN 1 END) as pagos_completados,
        COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pagos_pendientes
      FROM pago p
      JOIN inscripcion i ON p.inscripcion_id = i.id
      WHERE i.estudiante_id = ?
    `,
      [estudiante.id],
    )

    return Response.json({
      pagos,
      estadisticas,
    })
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
