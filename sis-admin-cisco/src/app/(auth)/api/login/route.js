import { NextResponse } from "next/server"
import db from "@/libs/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email?.trim() || !password) {
      return NextResponse.json({ success: false, error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const [user] = await db.query(
      `SELECT 
        u.id, 
        u.email, 
        u.contrasena_hash, 
        u.rol, 
        u.activo,
        COALESCE(e.nombre, i.nombre) AS nombre,
        COALESCE(e.apellido, i.apellido) AS apellido,
        COALESCE(e.foto_perfil, i.foto_perfil) AS foto_perfil
      FROM usuario u
      LEFT JOIN estudiante e ON u.id = e.usuario_id
      LEFT JOIN instructor i ON u.id = i.usuario_id
      WHERE u.email = ?`,
      [email.trim().toLowerCase()],
    )

    if (!user) {
      return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.contrasena_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
    }

    await db.query("UPDATE usuario SET ultimo_acceso = NOW() WHERE id = ?", [user.id])

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    )

    const userData = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      foto_perfil: user.foto_perfil,
    }

    const response = NextResponse.json(
      {
        success: true,
        user: userData,
      },
      { status: 200 },
    )

    // Configurar cookie HTTP-only segura
    response.cookies.set({
      name: "authToken", // Nombre consistente
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 })
  }
}
