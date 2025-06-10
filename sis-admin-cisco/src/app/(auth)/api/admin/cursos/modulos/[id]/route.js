import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request, { params }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { id } = params

    const [modulo] = await query(
      `
      SELECT 
        mc.*,
        mc.titulo as nombre,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo
      FROM modulo_curso mc
      JOIN curso c ON mc.curso_id = c.id
      WHERE mc.id = ?
    `,
      [id],
    )

    if (!modulo) {
      return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: modulo,
    })
  } catch (error) {
    console.error("Error obteniendo módulo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { id } = params
    const body = await request.json()

    // Verificar que el módulo existe
    const [existingModulo] = await query("SELECT id FROM modulo_curso WHERE id = ?", [id])
    if (!existingModulo) {
      return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 })
    }

    // Construir query de actualización dinámicamente
    const updateFields = []
    const updateValues = []

    const allowedFields = ["titulo", "descripcion", "orden", "duracion_horas"]

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateValues.push(body[field])
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    updateValues.push(id)

    await query(`UPDATE modulo_curso SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    return NextResponse.json({
      success: true,
      message: "Módulo actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error actualizando módulo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { id } = params

    // Verificar que el módulo existe
    const [modulo] = await query("SELECT id FROM modulo_curso WHERE id = ?", [id])
    if (!modulo) {
      return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 })
    }

    // Eliminar módulo (las evaluaciones se eliminarán en cascada)
    await query("DELETE FROM modulo_curso WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: "Módulo eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando módulo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
