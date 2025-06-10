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

    const [evaluacion] = await query(
      `
      SELECT 
        e.*,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo,
        m.nombre as modulo_nombre
      FROM evaluacion e
      JOIN curso c ON e.curso_id = c.id
      LEFT JOIN modulo m ON e.modulo_id = m.id
      WHERE e.id = ?
    `,
      [id],
    )

    if (!evaluacion) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
    }

    // Obtener preguntas de la evaluación
    const preguntas = await query(
      `
      SELECT 
        p.*,
        COUNT(or.id) as total_opciones
      FROM pregunta p
      LEFT JOIN opcion_respuesta or ON p.id = or.pregunta_id
      WHERE p.evaluacion_id = ?
      GROUP BY p.id
      ORDER BY p.orden ASC
    `,
      [id],
    )

    return NextResponse.json({
      success: true,
      data: {
        ...evaluacion,
        preguntas,
      },
    })
  } catch (error) {
    console.error("Error obteniendo evaluación:", error)
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

    // Verificar que la evaluación existe
    const [existingEvaluacion] = await query("SELECT id FROM evaluacion WHERE id = ?", [id])
    if (!existingEvaluacion) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
    }

    // Construir query de actualización dinámicamente
    const updateFields = []
    const updateValues = []

    const allowedFields = [
      "modulo_id",
      "nombre",
      "descripcion",
      "tipo",
      "duracion_minutos",
      "intentos_permitidos",
      "nota_minima",
      "fecha_disponible",
      "fecha_limite",
      "instrucciones",
      "peso_calificacion",
      "estado",
    ]

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

    await query(`UPDATE evaluacion SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    return NextResponse.json({
      success: true,
      message: "Evaluación actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error actualizando evaluación:", error)
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

    // Verificar que la evaluación existe
    const [evaluacion] = await query("SELECT id FROM evaluacion WHERE id = ?", [id])
    if (!evaluacion) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
    }

    // Eliminar evaluación (las preguntas y respuestas se eliminarán en cascada)
    await query("DELETE FROM evaluacion WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: "Evaluación eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando evaluación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
