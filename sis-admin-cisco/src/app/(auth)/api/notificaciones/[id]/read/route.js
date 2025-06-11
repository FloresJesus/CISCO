import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = params

    // Verificar que la notificación pertenece al usuario
    const [notification] = await query("SELECT id FROM notificacion WHERE id = ? AND usuario_id = ?", [
      id,
      authResult.user.id,
    ])

    if (!notification) {
      return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 })
    }

    // Marcar como leída
    await query("UPDATE notificacion SET leida = 1 WHERE id = ?", [id])

    return NextResponse.json({
      message: "Notificación marcada como leída",
    })
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
