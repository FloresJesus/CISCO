import db from "@/libs/db"

// Función para obtener un curso por ID
export async function getCursoById(id) {
  try {
    // Obtener datos del curso
    const [curso] = await db.query("SELECT * FROM curso WHERE id = ?", [id])

    if (!curso) {
      return null
    }

    // Obtener módulos del curso
    const modulos = await db.query("SELECT * FROM modulo_curso WHERE curso_id = ? ORDER BY orden ASC", [id])

    // Obtener paralelos del curso
    const paralelos = await db.query(
      `
      SELECT 
        p.*,
        i.nombre AS instructor_nombre,
        i.apellido AS instructor_apellido,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) AS total_inscritos
      FROM paralelo p
      JOIN instructor i ON p.instructor_id = i.id
      WHERE p.curso_id = ?
      ORDER BY p.fecha_inicio DESC
      `,
      [id],
    )

    // Obtener estadísticas
    const [estadisticas] = await db.query(
      `
      SELECT 
        COUNT(DISTINCT p.id) AS total_paralelos,
        COUNT(DISTINCT i.id) AS total_inscripciones,
        COUNT(DISTINCT CASE WHEN i.estado = 'completada' AND i.calificacion_final >= 7 THEN i.id END) AS total_aprobados,
        COUNT(DISTINCT CASE WHEN i.estado = 'completada' AND i.calificacion_final < 7 THEN i.id END) AS total_reprobados
      FROM curso c
      LEFT JOIN paralelo p ON c.id = p.curso_id
      LEFT JOIN inscripcion i ON p.id = i.paralelo_id
      WHERE c.id = ?
      `,
      [id],
    )

    return {
      ...curso,
      modulos,
      paralelos,
      estadisticas,
    }
  } catch (error) {
    console.error("Error al obtener curso:", error)
    return null
  }
}

// Función para obtener un usuario por ID
export async function getUserById(id) {
  try {
    // Obtener datos del usuario
    const [usuario] = await db.query(
      `
      SELECT 
        u.id, 
        u.email, 
        u.rol, 
        u.fecha_creacion, 
        u.ultimo_acceso,
        u.activo
      FROM usuario u
      WHERE u.id = ?
    `,
      [id],
    )

    if (!usuario) {
      return null
    }

    // Obtener datos específicos según el rol
    let detalles = null
    if (usuario.rol === "estudiante") {
      ;[detalles] = await db.query(
        `
        SELECT 
          id, 
          nombre, 
          apellido, 
          email, 
          telefono, 
          foto_perfil, 
          fecha_nacimiento,
          ci,
          estado
        FROM estudiante 
        WHERE usuario_id = ?
      `,
        [id],
      )

      // Obtener cursos inscritos
      const cursos = await db.query(
        `
        SELECT 
          i.id,
          i.fecha_inscripcion,
          i.estado,
          i.calificacion_final,
          i.certificado_generado,
          p.codigo_paralelo,
          p.nombre_paralelo,
          c.id AS curso_id,
          c.nombre AS curso_nombre,
          c.codigo AS curso_codigo
        FROM inscripcion i
        JOIN paralelo p ON i.paralelo_id = p.id
        JOIN curso c ON p.curso_id = c.id
        WHERE i.estudiante_id = ?
        ORDER BY i.fecha_inscripcion DESC
      `,
        [detalles.id],
      )

      usuario.cursos = cursos
    } else if (usuario.rol === "instructor") {
      ;[detalles] = await db.query(
        `
        SELECT 
          id, 
          nombre, 
          apellido, 
          email, 
          telefono, 
          foto_perfil, 
          fecha_nacimiento, 
          especialidad, 
          certificaciones_cisco, 
          biografia, 
          estado
        FROM instructor 
        WHERE usuario_id = ?
      `,
        [id],
      )

      // Obtener paralelos asignados
      const paralelos = await db.query(
        `
        SELECT 
          p.*,
          c.nombre AS curso_nombre,
          c.codigo AS curso_codigo,
          (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) AS total_inscritos
        FROM paralelo p
        JOIN curso c ON p.curso_id = c.id
        WHERE p.instructor_id = ?
        ORDER BY p.fecha_inicio DESC
      `,
        [detalles.id],
      )

      usuario.paralelos = paralelos
    }

    // Obtener registros de actividad
    const actividad = await db.query(
      `
      SELECT * FROM log_sistema
      WHERE usuario_id = ?
      ORDER BY fecha DESC
      LIMIT 20
    `,
      [id],
    )

    return {
      ...usuario,
      detalles,
      actividad,
    }
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return null
  }
}

// Función para obtener todos los instructores
export async function getInstructores() {
  try {
    const instructores = await db.query(
      `
      SELECT 
        i.id, 
        i.nombre, 
        i.apellido, 
        i.email, 
        i.especialidad,
        i.estado
      FROM instructor i
      JOIN usuario u ON i.usuario_id = u.id
      WHERE u.activo = 1
      ORDER BY i.apellido, i.nombre
      `,
    )

    return instructores
  } catch (error) {
    console.error("Error al obtener instructores:", error)
    return []
  }
}

// Función para obtener todos los cursos
export async function getCursos() {
  try {
    const cursos = await db.query(
      `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM paralelo p WHERE p.curso_id = c.id) as total_paralelos
      FROM curso c
      ORDER BY c.nombre
      `,
    )

    return cursos
  } catch (error) {
    console.error("Error al obtener cursos:", error)
    return []
  }
}
