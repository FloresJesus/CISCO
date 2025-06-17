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

//crear nuevo paralelo
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const data = await request.json()
    // Validar datos requeridos
    const requiredFields = [
      "nombre_paralelo",
      "codigo_paralelo",
      "curso_id",
      "instructor_id",
      "fecha_inicio",
      "fecha_fin",
      "horario",
      "max_estudiantes",
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Verificar que el código del paralelo no exista
    const existingParalelo = await query("SELECT id FROM paralelo WHERE codigo_paralelo = ?", [data.codigo_paralelo])

    if (existingParalelo.length > 0) {
      return NextResponse.json({ error: "Ya existe un paralelo con este código" }, { status: 400 })
    }

    // Insertar el nuevo paralelo
    const result = await query(
      `INSERT INTO paralelo (
        curso_id,
        instructor_id,
        codigo_paralelo,
        nombre_paralelo,
        fecha_inicio,
        fecha_fin,
        horario,
        aula,
        estado,
        max_estudiantes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.curso_id,
        data.instructor_id,
        data.codigo_paralelo,
        data.nombre_paralelo,
        data.fecha_inicio,
        data.fecha_fin,
        data.horario,
        data.aula || null,
        data.estado || "planificado",
        data.max_estudiantes,
      ],
    )

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
        "crear",
        "paralelo",
        result.insertId,
        JSON.stringify({
          mensaje: `Paralelo ${data.nombre_paralelo} creado`,
          datos: data,
        }),
        request.headers.get("x-forwarded-for") || "unknown",
      ],
    )

    return NextResponse.json({
      message: "Paralelo creado exitosamente",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Error al crear paralelo:", error)
    return NextResponse.json({ error: "Error al crear el paralelo" }, { status: 500 })
  }
}