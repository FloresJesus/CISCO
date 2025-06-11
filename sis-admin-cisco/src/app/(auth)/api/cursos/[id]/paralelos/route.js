import { query } from "@/libs/db"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Obtener información del curso
    const [curso] = await query("SELECT * FROM curso WHERE id = ? AND estado = 'disponible'", [id])

    if (!curso) {
      return Response.json({ success: false, error: "Curso no encontrado" }, { status: 404 })
    }
    console.log("Curso encontrado:", curso)
    // Obtener paralelos disponibles
    const paralelos = await query(
      `SELECT 
        p.*,
        c.nombre AS curso_nombre,
        c.descripcion AS curso_descripcion,
        i.nombre AS instructor_nombre,
        i.apellido AS instructor_apellido,
        i.email AS instructor_email,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) AS total_inscritos
      FROM paralelo p
      INNER JOIN curso c ON p.curso_id = c.id
      INNER JOIN instructor i ON p.instructor_id = i.id
      WHERE c.id = ?`,
      [id],
    )
    return Response.json({
      success: true,
      curso,
      paralelos: paralelos.map((paralelo) => ({
        ...paralelo,
        cupos_disponibles: paralelo.max_estudiantes - paralelo.total_inscritos,
        tiene_cupos: paralelo.max_estudiantes - paralelo.total_inscritos > 0,
      })),
    })
  } catch (error) {
    console.error("Error al obtener paralelos disponibles:", error)
    return Response.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
