import { verifyStudentToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await verifyStudentToken(request)
    if (!authResult.success) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = authResult.user.id
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado") || ""
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    // Obtener estudiante
    const [estudiante] = await query("SELECT id FROM estudiante WHERE usuario_id = ?", [userId])

    if (!estudiante) {
      return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Construir query base
    let baseQuery = `
      SELECT 
        i.id as inscripcion_id,
        i.estado as inscripcion_estado,
        i.fecha_inscripcion,
        i.calificacion_final,
        i.certificado_generado,
        c.id as curso_id,
        c.nombre as curso_nombre,
        c.descripcion as curso_descripcion,
        c.categoria,
        c.nivel,
        c.horas_totales,
        c.imagen_portada,
        p.id as paralelo_id,
        p.nombre_paralelo,
        p.fecha_inicio,
        p.fecha_fin,
        p.horario,
        p.aula,
        p.estado as paralelo_estado,
        CONCAT(inst.nombre, ' ', inst.apellido) as instructor_nombre,
        inst.especialidad as instructor_especialidad,
        (SELECT COUNT(*) FROM asistencia a WHERE a.paralelo_id = p.id AND a.estudiante_id = i.estudiante_id AND a.estado = 'presente') as clases_asistidas,
        (SELECT COUNT(*) FROM asistencia a WHERE a.paralelo_id = p.id AND a.estudiante_id = i.estudiante_id) as total_clases
      FROM inscripcion i
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      JOIN instructor inst ON p.instructor_id = inst.id
      WHERE i.estudiante_id = ?
    `

    const queryParams = [estudiante.id]

    if (estado) {
      baseQuery += " AND i.estado = ?"
      queryParams.push(estado)
    }

    baseQuery += " ORDER BY i.fecha_inscripcion DESC"

    // Ejecutar query con paginación
    const offset = (page - 1) * limit
    const paginatedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`

    const cursos = await query(paginatedQuery, queryParams)

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_table`
    const [{ total }] = await query(countQuery, queryParams)

    // Calcular porcentaje de asistencia para cada curso
    const cursosConAsistencia = cursos.map((curso) => ({
      ...curso,
      porcentaje_asistencia:
        curso.total_clases > 0 ? Math.round((curso.clases_asistidas / curso.total_clases) * 100) : 0,
    }))

    return Response.json({
      cursos: cursosConAsistencia,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error al obtener cursos del estudiante:", error)
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
