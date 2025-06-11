import { NextResponse } from "next/server"
import { query } from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

export async function GET(request, { params }) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = params

    // Obtener detalles del paralelo
    const paralelo = await query(
      `SELECT 
        p.*,
        c.nombre AS curso_nombre,
        c.descripcion AS curso_descripcion,
        i.nombre AS instructor_nombre,
        i.apellido AS instructor_apellido,
        i.email AS instructor_email,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) AS total_inscritos
      FROM paralelo p
      LEFT JOIN curso c ON p.curso_id = c.id
      LEFT JOIN instructor i ON p.instructor_id = i.id
      WHERE p.id = ?`,
      [id],
    )

    if (paralelo.length === 0) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ paralelo: paralelo[0] })
  } catch (error) {
    console.error("Error al obtener paralelo:", error)
    return NextResponse.json({ error: "Error al obtener el paralelo" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    // Verificar que el paralelo existe
    const existingParalelo = await query("SELECT id FROM paralelo WHERE id = ?", [id])

    if (existingParalelo.length === 0) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    // Verificar código único (excluyendo el paralelo actual)
    if (data.codigo_paralelo) {
      const duplicateCode = await query("SELECT id FROM paralelo WHERE codigo_paralelo = ? AND id != ?", [
        data.codigo_paralelo,
        id,
      ])

      if (duplicateCode.length > 0) {
        return NextResponse.json({ error: "Ya existe un paralelo con este código" }, { status: 400 })
      }
    }

    // Construir la consulta de actualización dinámicamente
    const updateFields = []
    const updateValues = []

    const allowedFields = [
      "curso_id",
      "instructor_id",
      "codigo_paralelo",
      "nombre_paralelo",
      "fecha_inicio",
      "fecha_fin",
      "horario",
      "aula",
      "estado",
      "max_estudiantes",
    ]

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateValues.push(data[field])
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    // Añadir el ID al final para la cláusula WHERE
    updateValues.push(id)

    // Ejecutar la actualización
    await query(`UPDATE paralelo SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    // Registrar la acción en el log del sistema
    await query(
      `INSERT INTO log_sistema (
        usuario_id,
        accion,
        entidad,
        entidad_id,
        detalles,
        ip_address
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        authResult.user.id,
        "actualizar",
        "paralelo",
        id,
        JSON.stringify({
          mensaje: `Paralelo ID ${id} actualizado`,
          datos: data,
        }),
        request.headers.get("x-forwarded-for") || "unknown",
      ],
    )

    return NextResponse.json({
      message: "Paralelo actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar paralelo:", error)
    return NextResponse.json({ error: "Error al actualizar el paralelo" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = params

    // Verificar que el paralelo existe
    const existingParalelo = await query("SELECT id, nombre_paralelo FROM paralelo WHERE id = ?", [id])

    if (existingParalelo.length === 0) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    // Verificar si hay inscripciones activas
    const activeInscriptions = await query(
      "SELECT COUNT(*) as count FROM inscripcion WHERE paralelo_id = ? AND estado = 'activa'",
      [id],
    )

    if (activeInscriptions[0].count > 0) {
      return NextResponse.json({ error: "No se puede eliminar un paralelo con inscripciones activas" }, { status: 400 })
    }

    // Eliminar el paralelo
    await query("DELETE FROM paralelo WHERE id = ?", [id])

    // Registrar la acción en el log del sistema
    await query(
      `INSERT INTO log_sistema (
        usuario_id,
        accion,
        entidad,
        entidad_id,
        detalles,
        ip_address
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        authResult.user.id,
        "eliminar",
        "paralelo",
        id,
        JSON.stringify({
          mensaje: `Paralelo ID ${id} (${existingParalelo[0].nombre_paralelo}) eliminado`,
        }),
        request.headers.get("x-forwarded-for") || "unknown",
      ],
    )

    return NextResponse.json({
      message: "Paralelo eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar paralelo:", error)
    return NextResponse.json({ error: "Error al eliminar el paralelo" }, { status: 500 })
  }
}
