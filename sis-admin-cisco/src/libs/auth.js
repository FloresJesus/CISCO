import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import db from "@/libs/db"

// Verificar token de administrador
export async function verifyAdminToken(request) {
  try {
    // Obtener token de la cookie
    const cookieStore = cookies()
    const token = cookieStore.get("authToken")?.value

    if (!token) {
      return null
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar si el usuario existe y es administrador
    const [user] = await db.query("SELECT id, email, rol FROM usuario WHERE id = ? AND rol = 'admin' AND activo = 1", [
      decoded.id,
    ])

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Error al verificar token de administrador:", error)
    return null
  }
}
