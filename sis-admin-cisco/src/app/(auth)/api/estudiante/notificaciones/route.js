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
    const leida = searchParams.get("leida")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    let baseQuery = `
      SELECT 
        n.id,
        n.titulo,
        n.mensaje,
        n.tipo,
        n.leida,
        n.fecha_creacion,
        n.url_destino
      FROM notificacion n
      WHERE n.usuario_id = ?
    `

    const queryParams = [userId]

    if (leida !== null) {
      baseQuery += " AND n.leida = ?"
      queryParams.push(leida === "true" ? 1 : 0)
    }

    baseQuery += " ORDER BY n.fecha_creacion DESC"

    // Ejecutar con paginación
    const offset = (page - 1) * limit
    const paginatedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`

    const notificaciones = await query(paginatedQuery, queryParams)

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_table`
    const [{ total }] = await query(countQuery, queryParams)

    // Contar no leídas
    const [{ no_leidas }] = await query(
      "SELECT COUNT(*) as no_leidas FROM notificacion WHERE usuario_id = ? AND leida = 0",
      [userId],
    )

    return Response.json({
      notificaciones,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      no_leidas,
    })
  } catch (error) {
    console.error("Error al obtener notificaciones:", error)
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
