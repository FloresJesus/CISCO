import { verifyStudentToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    const authResult = await verifyStudentToken(request)
    if (!authResult.success) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = authResult.user.id
    const { searchParams } = new URL(request.url)
    const paraleloId = searchParams.get("paraleloId")
    const mes = searchParams.get("mes")
    const año = searchParams.get("año")

    // Obtener estudiante
    const [estudiante] = await query("SELECT id FROM estudiante WHERE usuario_id = ?", [userId])

    if (!estudiante) {
      return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    let baseQuery = `
      SELECT 
        a.id,
        a.fecha,
        a.estado,
        a.observaciones,
        c.nombre as curso_nombre,
        p.nombre_paralelo,
        p.horario
      FROM asistencia a
      JOIN paralelo p ON a.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      WHERE a.estudiante_id = ?
    `

    const queryParams = [estudiante.id]

    if (paraleloId) {
      baseQuery += " AND p.id = ?"
      queryParams.push(paraleloId)
    }

    if (mes && año) {
      baseQuery += " AND MONTH(a.fecha) = ? AND YEAR(a.fecha) = ?"
      queryParams.push(mes, año)
    }

    baseQuery += " ORDER BY a.fecha DESC"

    const asistencias = await query(baseQuery, queryParams)

    // Estadísticas de asistencia
    const [estadisticas] = await query(
      `
      SELECT 
        COUNT(*) as total_clases,
        SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) as clases_asistidas,
        SUM(CASE WHEN a.estado = 'ausente' THEN 1 ELSE 0 END) as clases_ausentes,
        SUM(CASE WHEN a.estado = 'justificado' THEN 1 ELSE 0 END) as faltas_justificadas,
        SUM(CASE WHEN a.estado = 'tardanza' THEN 1 ELSE 0 END) as tardanzas
      FROM asistencia a
      JOIN paralelo p ON a.paralelo_id = p.id
      JOIN inscripcion i ON i.paralelo_id = p.id
      WHERE i.estudiante_id = ?
    `,
      [estudiante.id],
    )

    // Asistencia por curso
    const asistenciaPorCurso = await query(
      `
      SELECT 
        c.id as curso_id,
        c.nombre as curso_nombre,
        p.nombre_paralelo,
        COUNT(*) as total_clases,
        SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) as clases_asistidas,
        ROUND((SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje_asistencia
      FROM asistencia a
      JOIN paralelo p ON a.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      WHERE a.estudiante_id = ?
      GROUP BY c.id, c.nombre, p.nombre_paralelo
      ORDER BY c.nombre
    `,
      [estudiante.id],
    )

    const porcentajeGeneral =
      estadisticas.total_clases > 0 ? Math.round((estadisticas.clases_asistidas / estadisticas.total_clases) * 100) : 0

    return Response.json({
      asistencias,
      estadisticas: {
        ...estadisticas,
        porcentaje_general: porcentajeGeneral,
      },
      asistenciaPorCurso,
    })
  } catch (error) {
    console.error("Error al obtener asistencias:", error)
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
