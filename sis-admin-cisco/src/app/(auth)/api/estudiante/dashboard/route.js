import { verifyStudentToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Verificar autenticación (adaptado para estudiantes)
    const authResult = await verifyStudentToken(request)
    if (!authResult.success) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = authResult.user.id

    // Obtener información del estudiante
    const [estudiante] = await query(
      `SELECT e.*, u.email 
       FROM estudiante e 
       JOIN usuario u ON e.usuario_id = u.id 
       WHERE e.usuario_id = ?`,
      [userId],
    )

    if (!estudiante) {
      return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Estadísticas de inscripciones
    const [estadisticas] = await query(
      `SELECT 
        COUNT(*) as total_inscripciones,
        SUM(CASE WHEN i.estado = 'activa' THEN 1 ELSE 0 END) as inscripciones_activas,
        SUM(CASE WHEN i.estado = 'completada' THEN 1 ELSE 0 END) as cursos_completados,
        SUM(CASE WHEN i.certificado_generado = 1 THEN 1 ELSE 0 END) as certificados_obtenidos
       FROM inscripcion i 
       WHERE i.estudiante_id = ?`,
      [estudiante.id],
    )

    // Cursos activos
    const cursosActivos = await query(
      `SELECT 
        c.nombre as curso_nombre,
        p.nombre_paralelo,
        p.fecha_inicio,
        p.fecha_fin,
        i.estado,
        i.calificacion_final,
        CONCAT(inst.nombre, ' ', inst.apellido) as instructor_nombre
       FROM inscripcion i
       JOIN paralelo p ON i.paralelo_id = p.id
       JOIN curso c ON p.curso_id = c.id
       JOIN instructor inst ON p.instructor_id = inst.id
       WHERE i.estudiante_id = ? AND i.estado IN ('activa', 'completada')
       ORDER BY p.fecha_inicio DESC
       LIMIT 5`,
      [estudiante.id],
    )

    // Certificados disponibles
    const certificados = await query(
      `SELECT 
        c.nombre as curso_nombre,
        cert.fecha_emision,
        cert.url_verificacion,
        i.calificacion_final
       FROM certificado cert
       JOIN inscripcion i ON cert.inscripcion_id = i.id
       JOIN paralelo p ON i.paralelo_id = p.id
       JOIN curso c ON p.curso_id = c.id
       WHERE i.estudiante_id = ?
       ORDER BY cert.fecha_emision DESC`,
      [estudiante.id],
    )

    // Próximas evaluaciones (simulado - necesitarías implementar según tu sistema)
    const proximasEvaluaciones = await query(
      `SELECT 
        e.nombre as evaluacion_nombre,
        e.fecha_limite,
        c.nombre as curso_nombre,
        p.nombre_paralelo
       FROM evaluacion e
       JOIN modulo_curso mc ON e.modulo_id = mc.id
       JOIN curso c ON mc.curso_id = c.id
       JOIN paralelo p ON p.curso_id = c.id
       JOIN inscripcion i ON i.paralelo_id = p.id
       WHERE i.estudiante_id = ? 
         AND i.estado = 'activa'
         AND e.fecha_limite > NOW()
       ORDER BY e.fecha_limite ASC
       LIMIT 5`,
      [estudiante.id],
    )

    // Promedio de asistencia
    const [asistenciaStats] = await query(
      `SELECT 
        COUNT(*) as total_clases,
        SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) as clases_asistidas
       FROM asistencia a
       JOIN paralelo p ON a.paralelo_id = p.id
       JOIN inscripcion i ON i.paralelo_id = p.id
       WHERE i.estudiante_id = ?`,
      [estudiante.id],
    )

    const porcentajeAsistencia =
      asistenciaStats.total_clases > 0
        ? Math.round((asistenciaStats.clases_asistidas / asistenciaStats.total_clases) * 100)
        : 0

    return Response.json({
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        email: estudiante.email,
        foto_perfil: estudiante.foto_perfil,
        tipo_estudiante: estudiante.tipo_estudiante,
        estado: estudiante.estado,
      },
      estadisticas: {
        ...estadisticas,
        porcentaje_asistencia: porcentajeAsistencia,
      },
      cursosActivos,
      certificados,
      proximasEvaluaciones,
    })
  } catch (error) {
    console.error("Error en dashboard del estudiante:", error)
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
