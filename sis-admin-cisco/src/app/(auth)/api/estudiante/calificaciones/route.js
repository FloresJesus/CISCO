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
    const cursoId = searchParams.get("cursoId")

    // Obtener estudiante
    const [estudiante] = await query("SELECT id FROM estudiante WHERE usuario_id = ?", [userId])

    if (!estudiante) {
      return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    let baseQuery = `
      SELECT 
        cal.id,
        cal.puntuacion,
        cal.fecha_calificacion,
        cal.comentarios,
        e.nombre as evaluacion_nombre,
        e.tipo as evaluacion_tipo,
        e.valor_maximo,
        e.fecha_publicacion,
        e.fecha_limite,
        mc.titulo as modulo_titulo,
        c.nombre as curso_nombre,
        p.nombre_paralelo,
        i.calificacion_final
      FROM calificacion cal
      JOIN evaluacion e ON cal.evaluacion_id = e.id
      JOIN modulo_curso mc ON e.modulo_id = mc.id
      JOIN curso c ON mc.curso_id = c.id
      JOIN inscripcion i ON cal.inscripcion_id = i.id
      JOIN paralelo p ON i.paralelo_id = p.id
      WHERE i.estudiante_id = ?
    `

    const queryParams = [estudiante.id]

    if (cursoId) {
      baseQuery += " AND c.id = ?"
      queryParams.push(cursoId)
    }

    baseQuery += " ORDER BY e.fecha_publicacion DESC"

    const calificaciones = await query(baseQuery, queryParams)

    // Estadísticas generales
    const [estadisticas] = await query(
      `
      SELECT 
        COUNT(*) as total_evaluaciones,
        AVG(cal.puntuacion) as promedio_general,
        COUNT(CASE WHEN cal.puntuacion >= 7 THEN 1 END) as evaluaciones_aprobadas,
        COUNT(CASE WHEN cal.puntuacion < 7 THEN 1 END) as evaluaciones_reprobadas
      FROM calificacion cal
      JOIN evaluacion e ON cal.evaluacion_id = e.id
      JOIN modulo_curso mc ON e.modulo_id = mc.id
      JOIN inscripcion i ON cal.inscripcion_id = i.id
      WHERE i.estudiante_id = ?
    `,
      [estudiante.id],
    )

    // Promedios por curso
    const promediosPorCurso = await query(
      `
      SELECT 
        c.id as curso_id,
        c.nombre as curso_nombre,
        AVG(cal.puntuacion) as promedio_curso,
        COUNT(cal.id) as total_evaluaciones,
        i.calificacion_final
      FROM calificacion cal
      JOIN evaluacion e ON cal.evaluacion_id = e.id
      JOIN modulo_curso mc ON e.modulo_id = mc.id
      JOIN curso c ON mc.curso_id = c.id
      JOIN inscripcion i ON cal.inscripcion_id = i.id
      WHERE i.estudiante_id = ?
      GROUP BY c.id, c.nombre, i.calificacion_final
      ORDER BY c.nombre
    `,
      [estudiante.id],
    )

    return Response.json({
      calificaciones,
      estadisticas: {
        ...estadisticas,
        promedio_general: estadisticas.promedio_general
          ? Number.parseFloat(estadisticas.promedio_general.toFixed(2))
          : 0,
      },
      promediosPorCurso: promediosPorCurso.map((curso) => ({
        ...curso,
        promedio_curso: curso.promedio_curso ? Number.parseFloat(curso.promedio_curso.toFixed(2)) : 0,
      })),
    })
  } catch (error) {
    console.error("Error al obtener calificaciones:", error)
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
