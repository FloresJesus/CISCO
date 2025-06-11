import { NextResponse } from "next/server"
import db from "@/libs/db"

export async function GET(request, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const query = searchParams.get("query") || ""
    const tipoEstudiante = searchParams.get("tipo_estudiante") || ""
    const estado = searchParams.get("estado") || ""

    const offset = (page - 1) * limit

    // Consulta base para obtener estudiantes inscritos en el paralelo
    let sqlQuery = `
      SELECT 
        ins.id AS inscripcion_id,
        ins.fecha_inscripcion,
        ins.estado AS estado_inscripcion,
        ins.calificacion_final,
        ins.certificado_generado,
        e.id AS estudiante_id,
        e.nombre,
        e.apellido,
        e.email,
        e.telefono,
        e.tipo_estudiante,
        e.estado as estado_estudiante,
        e.fecha_registro,
        u.ultimo_acceso,
        COALESCE(
          (SELECT COUNT(*) 
           FROM asistencia a 
           WHERE a.estudiante_id = e.id 
           AND a.paralelo_id = ins.paralelo_id 
           AND a.estado = 'presente'), 0
        ) as asistencias_presentes,
        COALESCE(
          (SELECT COUNT(*) 
           FROM asistencia a 
           WHERE a.estudiante_id = e.id 
           AND a.paralelo_id = ins.paralelo_id), 0
        ) as total_asistencias,
        CASE 
          WHEN (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id) > 0
          THEN ROUND(
            (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id AND a.estado = 'presente') * 100.0 /
            (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id), 1
          )
          ELSE 0
        END as porcentaje_asistencia
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      LEFT JOIN usuario u ON e.usuario_id = u.id
      WHERE ins.paralelo_id = ?
    `

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      WHERE ins.paralelo_id = ?
    `

    const queryParams = [id]
    const countParams = [id]

    // Filtro por búsqueda de texto
    if (query) {
      const searchCondition = ` AND (e.nombre LIKE ? OR e.apellido LIKE ? OR e.email LIKE ?)`
      sqlQuery += searchCondition
      countQuery += searchCondition
      const searchTerm = `%${query}%`
      queryParams.push(searchTerm, searchTerm, searchTerm)
      countParams.push(searchTerm, searchTerm, searchTerm)
    }

    // Filtro por tipo de estudiante
    if (tipoEstudiante) {
      const tipoCondition = ` AND e.tipo_estudiante = ?`
      sqlQuery += tipoCondition
      countQuery += tipoCondition
      queryParams.push(tipoEstudiante)
      countParams.push(tipoEstudiante)
    }

    // Filtro por estado de inscripción
    if (estado) {
      const estadoCondition = ` AND ins.estado = ?`
      sqlQuery += estadoCondition
      countQuery += estadoCondition
      queryParams.push(estado)
      countParams.push(estado)
    }

    // Ordenar y paginar
    sqlQuery += ` ORDER BY e.apellido, e.nombre LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    // Ejecutar consultas
    const [estudiantes, countResult] = await Promise.all([
      db.query(sqlQuery, queryParams),
      db.query(countQuery, countParams),
    ])

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    // Obtener estadísticas por tipo de estudiante
    const estadisticasQuery = `
      SELECT 
        e.tipo_estudiante,
        COUNT(*) as total,
        AVG(ins.calificacion_final) as promedio_calificacion,
        COUNT(CASE WHEN ins.calificacion_final >= 7 THEN 1 END) as aprobados,
        COUNT(CASE WHEN ins.calificacion_final < 7 AND ins.calificacion_final IS NOT NULL THEN 1 END) as reprobados,
        AVG(
          CASE 
            WHEN (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id) > 0
            THEN (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id AND a.estado = 'presente') * 100.0 /
                 (SELECT COUNT(*) FROM asistencia a WHERE a.estudiante_id = e.id AND a.paralelo_id = ins.paralelo_id)
            ELSE 0
          END
        ) as promedio_asistencia
      FROM inscripcion ins
      JOIN estudiante e ON ins.estudiante_id = e.id
      WHERE ins.paralelo_id = ? AND ins.estado != 'cancelada'
      GROUP BY e.tipo_estudiante
    `

    const estadisticas = await db.query(estadisticasQuery, [id])

    return NextResponse.json({
      estudiantes: estudiantes.map((est) => ({
        ...est,
        porcentaje_asistencia: Number.parseFloat(est.porcentaje_asistencia || 0).toFixed(1),
      })),
      estadisticas: estadisticas.map((stat) => ({
        ...stat,
        promedio_calificacion: Number.parseFloat(stat.promedio_calificacion || 0).toFixed(1),
        promedio_asistencia: Number.parseFloat(stat.promedio_asistencia || 0).toFixed(1),
        porcentaje_aprobacion: stat.total > 0 ? Number.parseFloat((stat.aprobados / stat.total) * 100).toFixed(1) : 0,
      })),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error al obtener estudiantes del paralelo:", error)
    return NextResponse.json({ error: "Error al obtener los estudiantes del paralelo" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { estudiante_id } = body

    // Verificar que el paralelo existe y tiene capacidad
    const paraleloQuery = `
      SELECT 
        p.*,
        COUNT(ins.id) as inscritos_actuales
      FROM paralelo p
      LEFT JOIN inscripcion ins ON p.id = ins.paralelo_id AND ins.estado != 'cancelada'
      WHERE p.id = ?
      GROUP BY p.id
    `

    const paraleloResult = await db.query(paraleloQuery, [id])

    if (!paraleloResult || paraleloResult.length === 0) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    const paralelo = paraleloResult[0]

    if (paralelo.inscritos_actuales >= paralelo.max_estudiantes) {
      return NextResponse.json({ error: "El paralelo ha alcanzado su capacidad máxima" }, { status: 400 })
    }

    // Verificar que el estudiante existe
    const estudianteQuery = `SELECT * FROM estudiante WHERE id = ?`
    const estudianteResult = await db.query(estudianteQuery, [estudiante_id])

    if (!estudianteResult || estudianteResult.length === 0) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Verificar que el estudiante no esté ya inscrito en este paralelo
    const inscripcionExistente = `
      SELECT * FROM inscripcion 
      WHERE estudiante_id = ? AND paralelo_id = ? AND estado != 'cancelada'
    `

    const inscripcionResult = await db.query(inscripcionExistente, [estudiante_id, id])

    if (inscripcionResult && inscripcionResult.length > 0) {
      return NextResponse.json({ error: "El estudiante ya está inscrito en este paralelo" }, { status: 400 })
    }

    // Crear la inscripción
    const insertQuery = `
      INSERT INTO inscripcion (
        estudiante_id, 
        paralelo_id, 
        fecha_inscripcion, 
        estado
      ) VALUES (?, ?, NOW(), 'activa')
    `

    const result = await db.query(insertQuery, [estudiante_id, id])

    return NextResponse.json({
      message: "Estudiante inscrito exitosamente",
      inscripcion_id: result.insertId,
    })
  } catch (error) {
    console.error("Error al inscribir estudiante:", error)
    return NextResponse.json({ error: "Error al inscribir el estudiante" }, { status: 500 })
  }
}
