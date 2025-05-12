import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import db from "@/libs/db"

export async function GET(request) {
  try {
    const token = request.cookies.get("authToken")?.value

    if (!token) {
      return NextResponse.json({ user: null, message: "No hay token de autenticación" }, { status: 200 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar si el usuario existe y está activo
    const [user] = await db.query(
      `SELECT u.id, u.email, u.rol, 
       COALESCE(e.nombre, i.nombre) AS nombre,
       COALESCE(e.apellido, i.apellido) AS apellido,
       COALESCE(e.foto_perfil, i.foto_perfil) AS foto_perfil
       FROM usuario u
       LEFT JOIN estudiante e ON u.id = e.usuario_id
       LEFT JOIN instructor i ON u.id = i.usuario_id
       WHERE u.id = ? AND u.activo = 1`,
      [decoded.id],
    )

    if (!user) {
      // Borrar cookie si el usuario no existe o no está activo
      const response = NextResponse.json({ user: null, message: "Usuario no encontrado o inactivo" }, { status: 200 })
      response.cookies.delete("authToken")
      return response
    }

    // Formatear datos del usuario para el frontend
    const userData = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
      foto_perfil: user.foto_perfil,
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    // Manejar diferentes tipos de errores de JWT
    let message = "Error de autenticación"
    if (error instanceof jwt.TokenExpiredError) {
      message = "Token expirado"
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Token inválido"
    }

    const response = NextResponse.json({ user: null, message }, { status: 200 })
    response.cookies.delete("authToken")
    return response
  }
}
