import { NextResponse } from "next/server"
import { query } from "@/libs/db"

export async function GET() {
  try {
    // Obtener las 5 inscripciones más recientes con detalles
    const recentEnrollments = await query(`
      SELECT 
        i.id,
        CONCAT(e.nombre, ' ', e.apellido) as student,
        c.nombre as course,
        i.fecha_inscripcion as date,
        i.estado as status
      FROM inscripcion i
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      ORDER BY i.fecha_inscripcion DESC
      LIMIT 5
    `)

    return NextResponse.json(recentEnrollments)
  } catch (error) {
    console.error("Error al obtener inscripciones recientes:", error)
    return NextResponse.json({ error: "Error al obtener inscripciones recientes" }, { status: 500 })
  }
}
