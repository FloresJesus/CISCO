import { verifyStudentToken} from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    const authResult = await verifyStudentToken(request)
    if (!authResult.success) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = authResult.user.id

    // Obtener información completa del estudiante
    const [estudiante] = await query(
      `
      SELECT 
        e.*,
        u.email,
        u.fecha_creacion,
        u.ultimo_acceso
      FROM estudiante e
      JOIN usuario u ON e.usuario_id = u.id
      WHERE e.usuario_id = ?
    `,
      [userId],
    )

    if (!estudiante) {
      return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    return Response.json({ estudiante })
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const authResult = await verifyStudentToken(request)
    if (!authResult.success) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = authResult.user.id
    const body = await request.json()
    const { nombre, apellido, telefono, fecha_nacimiento } = body

    // Validaciones básicas
    if (!nombre || !apellido) {
      return Response.json({ error: "Nombre y apellido son requeridos" }, { status: 400 })
    }

    // Actualizar información del estudiante
    await query(
      `
      UPDATE estudiante 
      SET nombre = ?, apellido = ?, telefono = ?, fecha_nacimiento = ?
      WHERE usuario_id = ?
    `,
      [nombre, apellido, telefono, fecha_nacimiento, userId],
    )

    // Obtener datos actualizados
    const [estudianteActualizado] = await query(
      `
      SELECT 
        e.*,
        u.email,
        u.fecha_creacion,
        u.ultimo_acceso
      FROM estudiante e
      JOIN usuario u ON e.usuario_id = u.id
      WHERE e.usuario_id = ?
    `,
      [userId],
    )

    return Response.json({
      message: "Perfil actualizado correctamente",
      estudiante: estudianteActualizado,
    })
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
