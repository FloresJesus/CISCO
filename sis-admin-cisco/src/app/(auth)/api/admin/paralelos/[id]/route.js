import { NextResponse } from "next/server"
import db from "@/libs/db"

// Obtener un paralelo específico
export async function GET(request, { params }) {
  try {
    const { id } = params

    const query = `
      SELECT 
        p.*,
        c.nombre AS curso_nombre,
        c.codigo AS curso_codigo,
        i.nombre AS instructor_nombre,
        i.apellido AS instructor_apellido,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) AS total_inscritos
      FROM paralelo p
      JOIN curso c ON p.curso_id = c.id
      JOIN instructor i ON p.instructor_id = i.id
      WHERE p.id = ?
    `

    const [paralelo] = await db.query(query, [id])

    if (!paralelo.length) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(paralelo[0])
  } catch (error) {
    console.error("Error al obtener el paralelo:", error)
    return NextResponse.json({ error: "Error al obtener el paralelo" }, { status: 500 })
  }
}

// Actualizar un paralelo
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    // Verificar que el paralelo existe
    const [existingParalelo] = await db.query("SELECT * FROM paralelo WHERE id = ?", [id])

    if (!existingParalelo.length) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    // Actualizar el paralelo
    const updateQuery = `
      UPDATE paralelo SET
        codigo_paralelo = ?,
        nombre_paralelo = ?,
        instructor_id = ?,
        fecha_inicio = ?,
        fecha_fin = ?,
        horario = ?,
        modalidad = ?,
        ubicacion = ?,
        max_estudiantes = ?,
        estado = ?,
        descripcion = ?
      WHERE id = ?
    `

    await db.query(updateQuery, [
      data.codigo_paralelo,
      data.nombre_paralelo,
      data.instructor_id,
      data.fecha_inicio,
      data.fecha_fin,
      data.horario,
      data.modalidad,
      data.ubicacion,
      data.max_estudiantes,
      data.estado,
      data.descripcion,
      id,
    ])

    return NextResponse.json({ message: "Paralelo actualizado correctamente" })
  } catch (error) {
    console.error("Error al actualizar el paralelo:", error)
    return NextResponse.json({ error: "Error al actualizar el paralelo" }, { status: 500 })
  }
}

// Eliminar un paralelo
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Verificar que el paralelo existe
    const [existingParalelo] = await db.query("SELECT * FROM paralelo WHERE id = ?", [id])

    if (!existingParalelo.length) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    // Verificar si hay inscripciones asociadas
    const [inscripciones] = await db.query("SELECT COUNT(*) AS total FROM inscripcion WHERE paralelo_id = ?", [id])

    if (inscripciones[0].total > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el paralelo porque tiene estudiantes inscritos" },
        { status: 400 },
      )
    }

    // Eliminar el paralelo
    await db.query("DELETE FROM paralelo WHERE id = ?", [id])

    return NextResponse.json({ message: "Paralelo eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar el paralelo:", error)
    return NextResponse.json({ error: "Error al eliminar el paralelo" }, { status: 500 })
  }
}
