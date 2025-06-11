import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const onlyUnread = searchParams.get("unread") === "true"

    let whereClause = "WHERE usuario_id = ?"
    const queryParams = [authResult.user.id]

    if (onlyUnread) {
      whereClause += " AND leida = 0"
    }

    // Obtener notificaciones con paginación
    const offset = (page - 1) * limit
    const notifications = await query(
      `SELECT * FROM notificacion 
       ${whereClause} 
       ORDER BY fecha_creacion DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    )

    // Contar total de notificaciones
    const [totalResult] = await query(`SELECT COUNT(*) as total FROM notificacion ${whereClause}`, queryParams)

    // Contar notificaciones no leídas
    const [unreadResult] = await query(
      "SELECT COUNT(*) as unread FROM notificacion WHERE usuario_id = ? AND leida = 0",
      [authResult.user.id],
    )

    return NextResponse.json({
      notifications,
      unreadCount: unreadResult.unread,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener notificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { titulo, mensaje, tipo, url_destino, usuario_id } = await request.json()

    if (!titulo || !mensaje || !tipo) {
      return NextResponse.json({ error: "Título, mensaje y tipo son requeridos" }, { status: 400 })
    }

    const targetUserId = usuario_id || authResult.user.id

    const result = await query(
      `INSERT INTO notificacion (usuario_id, titulo, mensaje, tipo, url_destino) 
       VALUES (?, ?, ?, ?, ?)`,
      [targetUserId, titulo, mensaje, tipo, url_destino],
    )

    return NextResponse.json({
      message: "Notificación creada exitosamente",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Error al crear notificación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
