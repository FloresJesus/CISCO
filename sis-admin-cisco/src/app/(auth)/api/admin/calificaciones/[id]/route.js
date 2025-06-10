import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function PUT(request, { params }) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { id } = params
    const body = await request.json()
    const { calificacion_final, observaciones } = body

    // Validar calificación
    if (calificacion_final < 0 || calificacion_final > 100) {
      return NextResponse.json({ error: "La calificación debe estar entre 0 y 100" }, { status: 400 })
    }

    // Actualizar calificación final en inscripción
    await query(
      `
      UPDATE inscripcion 
      SET 
        calificacion_final = ?
      WHERE id = ?
    `,
      [calificacion_final, id],
    )

    // Si la calificación es >= 51, marcar como completada
    if (calificacion_final >= 51) {
      await query(
        `
        UPDATE inscripcion 
        SET estado = 'completada'
        WHERE id = ? AND estado = 'activa'
      `,
        [id],
      )
    }

    return NextResponse.json({
      success: true,
      message: "Calificación actualizada correctamente",
    })
  } catch (error) {
    console.error("Error actualizando calificación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
