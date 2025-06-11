import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("q")

    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchPattern = `%${searchTerm}%`
    const results = []

    // Buscar estudiantes
    const estudiantes = await query(
      `SELECT e.id, e.nombre, e.apellido, e.email, 'estudiante' as type
       FROM estudiante e
       WHERE (e.nombre LIKE ? OR e.apellido LIKE ? OR e.email LIKE ?)
       AND e.estado = 'activo'
       LIMIT 5`,
      [searchPattern, searchPattern, searchPattern],
    )

    estudiantes.forEach((est) => {
      results.push({
        id: est.id,
        type: "estudiante",
        title: `${est.nombre} ${est.apellido}`,
        subtitle: est.email,
      })
    })

    // Buscar instructores
    const instructores = await query(
      `SELECT i.id, i.nombre, i.apellido, i.email, 'instructor' as type
       FROM instructor i
       WHERE (i.nombre LIKE ? OR i.apellido LIKE ? OR i.email LIKE ?)
       AND i.estado = 'activo'
       LIMIT 5`,
      [searchPattern, searchPattern, searchPattern],
    )

    instructores.forEach((inst) => {
      results.push({
        id: inst.id,
        type: "instructor",
        title: `${inst.nombre} ${inst.apellido}`,
        subtitle: `Instructor - ${inst.email}`,
      })
    })

    // Buscar cursos
    const cursos = await query(
      `SELECT c.id, c.codigo, c.nombre, c.categoria, 'curso' as type
       FROM curso c
       WHERE (c.nombre LIKE ? OR c.codigo LIKE ? OR c.descripcion LIKE ?)
       AND c.estado = 'disponible'
       LIMIT 5`,
      [searchPattern, searchPattern, searchPattern],
    )

    cursos.forEach((curso) => {
      results.push({
        id: curso.id,
        type: "curso",
        title: `${curso.codigo} - ${curso.nombre}`,
        subtitle: `Categoría: ${curso.categoria}`,
      })
    })

    // Buscar pagos por referencia
    const pagos = await query(
      `SELECT p.id, p.referencia, p.monto, p.estado, 
              e.nombre, e.apellido, 'pago' as type
       FROM pago p
       JOIN inscripcion i ON p.inscripcion_id = i.id
       JOIN estudiante e ON i.estudiante_id = e.id
       WHERE p.referencia LIKE ?
       LIMIT 5`,
      [searchPattern],
    )

    pagos.forEach((pago) => {
      results.push({
        id: pago.id,
        type: "pago",
        title: `Pago ${pago.referencia || `#${pago.id}`}`,
        subtitle: `${pago.nombre} ${pago.apellido} - $${pago.monto} (${pago.estado})`,
      })
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error en búsqueda:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
