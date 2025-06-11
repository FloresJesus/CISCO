import { NextResponse } from "next/server"
import { query } from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const searchQuery = searchParams.get("query") || ""
    const estado = searchParams.get("estado") || ""
    const cursoId = searchParams.get("cursoId") || ""

    // Construir la consulta base
    let sqlQuery = `
      SELECT 
        p.id, 
        p.nombre_paralelo, 
        p.codigo_paralelo, 
        p.fecha_inicio, 
        p.fecha_fin, 
        p.estado, 
        p.max_estudiantes,
        p.aula,
        p.horario,
        c.nombre AS curso_nombre,
        i.nombre AS instructor_nombre,
        i.apellido AS instructor_apellido,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) AS total_inscritos
      FROM paralelo p
      LEFT JOIN curso c ON p.curso_id = c.id
      LEFT JOIN instructor i ON p.instructor_id = i.id
      WHERE 1=1
    `

    // Construir parámetros para la consulta
    const params = []

    // Filtrar por curso si se proporciona cursoId
    if (cursoId) {
      sqlQuery += " AND p.curso_id = ?"
      params.push(cursoId)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      sqlQuery += " AND (p.nombre_paralelo LIKE ? OR p.codigo_paralelo LIKE ? OR c.nombre LIKE ?)"
      params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`)
    }

    // Filtrar por estado
    if (estado) {
      sqlQuery += " AND p.estado = ?"
      params.push(estado)
    }

    // Consulta para contar el total de registros
    const countQuery = `SELECT COUNT(*) AS total FROM (${sqlQuery}) AS count_table`
    const countResult = await query(countQuery, params)
    const total = countResult[0]?.total || 0

    // Añadir ordenamiento y paginación a la consulta principal
    sqlQuery += " ORDER BY p.fecha_inicio DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    // Ejecutar la consulta principal
    const paralelos = await query(sqlQuery, params)

    // Calcular el total de páginas
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      paralelos,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error al obtener paralelos:", error)
    return NextResponse.json({ error: "Error al obtener los paralelos" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const data = await request.json()

    // Validar datos requeridos
    const requiredFields = [
      "nombre_paralelo",
      "codigo_paralelo",
      "curso_id",
      "instructor_id",
      "fecha_inicio",
      "fecha_fin",
      "horario",
      "max_estudiantes",
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Verificar que el código del paralelo no exista
    const existingParalelo = await query("SELECT id FROM paralelo WHERE codigo_paralelo = ?", [data.codigo_paralelo])

    if (existingParalelo.length > 0) {
      return NextResponse.json({ error: "Ya existe un paralelo con este código" }, { status: 400 })
    }

    // Insertar el nuevo paralelo
    const result = await query(
      `INSERT INTO paralelo (
        curso_id,
        instructor_id,
        codigo_paralelo,
        nombre_paralelo,
        fecha_inicio,
        fecha_fin,
        horario,
        aula,
        estado,
        max_estudiantes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.curso_id,
        data.instructor_id,
        data.codigo_paralelo,
        data.nombre_paralelo,
        data.fecha_inicio,
        data.fecha_fin,
        data.horario,
        data.aula || null,
        data.estado || "planificado",
        data.max_estudiantes,
      ],
    )

    // Registrar la acción en el log del sistema
    await query(
      `INSERT INTO log_sistema (
        usuario_id,
        accion,
        entidad,
        entidad_id,
        detalles,
        ip_address
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        authResult.user.id,
        "crear",
        "paralelo",
        result.insertId,
        JSON.stringify({
          mensaje: `Paralelo ${data.nombre_paralelo} creado`,
          datos: data,
        }),
        request.headers.get("x-forwarded-for") || "unknown",
      ],
    )

    return NextResponse.json({
      message: "Paralelo creado exitosamente",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Error al crear paralelo:", error)
    return NextResponse.json({ error: "Error al crear el paralelo" }, { status: 500 })
  }
}
