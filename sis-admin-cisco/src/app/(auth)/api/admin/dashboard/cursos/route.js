import { NextResponse } from "next/server"
import { query } from "@/libs/db"

export async function GET() {
  try {
    // Obtener los próximos cursos que están por comenzar
    const upcomingCourses = await query(`
      SELECT 
        p.id,
        c.nombre as name,
        p.fecha_inicio as start,
        CONCAT(i.nombre, ' ', i.apellido) as instructor,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) as enrolled,
        p.max_estudiantes as capacity
      FROM paralelo p
      JOIN curso c ON p.curso_id = c.id
      JOIN instructor i ON p.instructor_id = i.id
      WHERE p.fecha_inicio > CURRENT_DATE
      AND p.estado = 'planificado'
      ORDER BY p.fecha_inicio ASC
      LIMIT 3
    `)

    return NextResponse.json(upcomingCourses)
  } catch (error) {
    console.error("Error al obtener próximos cursos:", error)
    return NextResponse.json({ error: "Error al obtener próximos cursos" }, { status: 500 })
  }
}
