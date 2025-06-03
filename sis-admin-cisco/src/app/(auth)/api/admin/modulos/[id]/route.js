import { NextResponse } from "next/server"
import db from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

export async function GET(request, { params }) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = params

    // Obtener módulo
    const [modulos] = await db.execute("SELECT * FROM modulos WHERE id = ?", [id])

    if (modulos.length === 0) {
      return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(modulos[0])
  } catch (error) {
    console.error("Error al obtener módulo:", error)
    return NextResponse.json({ error: "Error al obtener módulo" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Verificar rol de administrador
    if (authResult.user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { id } = params
    const data = await request.json()
    const { nombre, descripcion, contenido, curso_id, orden } = data

    // Validar datos
    if (!nombre || !curso_id) {
      return NextResponse.json({ error: "Nombre y curso_id son campos requeridos" }, { status: 400 })
    }

    // Actualizar módulo
    await db.execute(
      "UPDATE modulos SET nombre = ?, descripcion = ?, contenido = ?, curso_id = ?, orden = ? WHERE id = ?",
      [nombre, descripcion, contenido, curso_id, orden, id],
    )

    return NextResponse.json({ mensaje: "Módulo actualizado exitosamente" })
  } catch (error) {
    console.error("Error al actualizar módulo:", error)
    return NextResponse.json({ error: "Error al actualizar módulo" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Verificar rol de administrador
    if (authResult.user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { id } = params

    // Eliminar módulo
    await db.execute("DELETE FROM modulos WHERE id = ?", [id])

    return NextResponse.json({ mensaje: "Módulo eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar módulo:", error)
    return NextResponse.json({ error: "Error al eliminar módulo" }, { status: 500 })
  }
}
