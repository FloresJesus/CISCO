import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function DELETE(request, { params }) {
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

    // Eliminar la notificación
    await query("DELETE FROM notificacion WHERE id = ?", [id])

    return NextResponse.json({
      message: "Notificación eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar notificación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
