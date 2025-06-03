import { NextResponse } from "next/server"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("query") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = (page - 1) * limit
    const searchPattern = `%${searchQuery}%`

    // Construir consulta SQL base
    let sql = `
      SELECT 
        id, 
        codigo,
        nombre, 
        descripcion,
        duracion_semanas,
        horas_totales,
        nivel,
        categoria,
        costo_matricula,
        estado,
        fecha_creacion,
        imagen_portada
      FROM curso
      WHERE estado = 'disponible'
    `

    // Añadir filtro de búsqueda si existe
    const queryParams = []
    if (searchQuery) {
      sql += ` AND (nombre LIKE ? OR codigo LIKE ? OR descripcion LIKE ?)`
      queryParams.push(searchPattern, searchPattern, searchPattern)
    }

    // Añadir ordenamiento y paginación
    sql += ` ORDER BY nombre LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    // Ejecutar consulta
    const cursos = await query(sql, queryParams)

    // Obtener total de registros para paginación
    const [{ total }] = await query(
      `SELECT COUNT(*) as total FROM curso WHERE estado = 'disponible'${
        searchQuery ? ` AND (nombre LIKE ? OR codigo LIKE ? OR descripcion LIKE ?)` : ""
      }`,
      searchQuery ? [searchPattern, searchPattern, searchPattern] : [],
    )

    // Calcular total de páginas
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      cursos,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error al obtener cursos disponibles:", error)
    return NextResponse.json({ error: "Error al obtener cursos disponibles" }, { status: 500 })
  }
}
