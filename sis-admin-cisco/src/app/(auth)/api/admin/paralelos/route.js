import { NextResponse } from "next/server"
import db from "@/libs/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const query = searchParams.get("query") || ""
    const estado = searchParams.get("estado") || ""
    const curso_id = searchParams.get("curso_id") || ""

    const offset = (page - 1) * limit

    // Construir la consulta base
    let sqlQuery = `
      SELECT 
        p.id, 
        p.codigo_paralelo, 
        p.nombre_paralelo, 
        p.fecha_inicio, 
        p.fecha_fin, 
        p.horario, 
        p.max_estudiantes, 
        p.estado,
        p.curso_id,
        c.nombre AS curso_nombre,
        c.codigo AS curso_codigo,
        i.id AS instructor_id,
        i.nombre AS instructor_nombre,
        i.apellido AS instructor_apellido,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) AS total_inscritos
      FROM paralelo p
      JOIN curso c ON p.curso_id = c.id
      JOIN instructor i ON p.instructor_id = i.id
      WHERE 1=1
    `

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM paralelo p
      JOIN curso c ON p.curso_id = c.id
      JOIN instructor i ON p.instructor_id = i.id
      WHERE 1=1
    `

    const queryParams = []

    // Añadir filtros
    if (query) {
      sqlQuery += ` AND (p.codigo_paralelo LIKE ? OR p.nombre_paralelo LIKE ? OR c.nombre LIKE ? OR i.nombre LIKE ? OR i.apellido LIKE ?)`
      countQuery += ` AND (p.codigo_paralelo LIKE ? OR p.nombre_paralelo LIKE ? OR c.nombre LIKE ? OR i.nombre LIKE ? OR i.apellido LIKE ?)`
      const searchTerm = `%${query}%`
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (estado) {
      sqlQuery += ` AND p.estado = ?`
      countQuery += ` AND p.estado = ?`
      queryParams.push(estado)
    }

    if (curso_id) {
      sqlQuery += ` AND p.curso_id = ?`
      countQuery += ` AND p.curso_id = ?`
      queryParams.push(curso_id)
    }

    // Ordenar y paginar
    sqlQuery += ` ORDER BY p.fecha_inicio DESC LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    // Ejecutar consultas
    const [paralelos, countResult] = await Promise.all([
      db.query(sqlQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, -2)), // Excluir limit y offset
    ])

    const total = countResult[0].total
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
