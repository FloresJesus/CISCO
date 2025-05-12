import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Sesión cerrada correctamente" },
      { status: 200 }
    )

    // Eliminar cookie con más opciones de configuración
    response.cookies.set({
      name: "authToken",
      value: "",
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    )
  }
}