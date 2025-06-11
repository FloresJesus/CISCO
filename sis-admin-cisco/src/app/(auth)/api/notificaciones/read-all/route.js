import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function PUT(request) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Marcar todas las notificaciones del usuario como leídas
    await query("UPDATE notificacion SET leida = 1 WHERE usuario_id = ? AND leida = 0", [authResult.user.id])

    return NextResponse.json({
      message: "Todas las notificaciones han sido marcadas como leídas",
    })
  } catch (error) {
    console.error("Error al marcar todas las notificaciones como leídas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
