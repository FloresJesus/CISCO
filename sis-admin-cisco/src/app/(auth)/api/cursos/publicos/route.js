import { query } from "@/libs/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get("categoria")
    const busqueda = searchParams.get("busqueda")

    const whereConditions = ["c.estado = 'disponible'"]
    const queryParams = []

    // Filtro por categoría
    if (categoria && categoria !== "all") {
      whereConditions.push("c.categoria = ?")
      queryParams.push(categoria)
    }

    // Filtro por búsqueda
    if (busqueda) {
      whereConditions.push("(c.nombre LIKE ? OR c.descripcion LIKE ?)")
      queryParams.push(`%${busqueda}%`, `%${busqueda}%`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    const cursosQuery = `
      SELECT 
        c.id,
        c.codigo,
        c.nombre,
        c.descripcion,
        c.duracion_semanas,
        c.horas_totales,
        c.nivel,
        c.categoria,
        c.imagen_portada,
        c.costo_matricula,
        COUNT(p.id) as paralelos_activos
      FROM curso c
      LEFT JOIN paralelo p ON c.id = p.curso_id 
        AND p.estado IN ('planificado', 'en_progreso')
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.nombre ASC
    `

    const cursos = await query(cursosQuery, queryParams)

    return Response.json({
      success: true,
      cursos: cursos.map((curso) => ({
        ...curso,
        tiene_paralelos: curso.paralelos_activos > 0,
      })),
    })
  } catch (error) {
    console.error("Error al obtener cursos públicos:", error)
    return Response.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
