import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import db from "@/libs/db"

// Verificar token de administrador
export async function verifyAdminToken(request) {
  try {
    // Obtener token de la cookie
    const cookieStore = cookies()
    const authCookie = await cookieStore.get("authToken")
    const token = authCookie?.value

    if (!token) {
      return { success: false, error: "Token no encontrado" }
    }

    // Verificar token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return { success: false, error: "Token inválido" }
    }

    // Verificar si el usuario existe y es administrador
    const [user] = await db.query(
      "SELECT id, email, rol FROM usuario WHERE id = ? AND rol = 'admin' AND activo = 1",
      [decoded.id]
    )

    if (!user) {
      return { success: false, error: "Usuario no autorizado" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error al verificar token de administrador:", error)
    return { success: false, error: "Error interno de autenticación" }
  }
}
