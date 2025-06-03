import { NextResponse } from "next/server"
import db from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

// GET - Obtener un curso por ID
export async function GET(request, { params }) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id

    // Obtener datos del curso
    const [curso] = await db.query(
      `
      SELECT * FROM curso WHERE id = ?
    `,
      [id],
    )

    if (!curso) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    // Obtener módulos del curso
    const modulos = await db.query(
      `
      SELECT * FROM modulo_curso 
      WHERE curso_id = ? 
      ORDER BY orden ASC
    `,
      [id],
    )

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

    return NextResponse.json({
      curso,
      modulos,
      paralelos,
      estadisticas,
    })
  } catch (error) {
    console.error("Error al obtener curso:", error)
    return NextResponse.json({ error: "Error al obtener curso" }, { status: 500 })
  }
}

// PUT - Actualizar un curso
export async function PUT(request, { params }) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()
    const {
      codigo,
      nombre,
      descripcion,
      duracion_semanas,
      horas_totales,
      nivel,
      categoria,
      estado,
      imagen_portada,
      costo_matricula,
      modulos = [],
    } = data

    // Verificar si el curso existe
    const [curso] = await db.query("SELECT id FROM curso WHERE id = ?", [id])
    if (!curso) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    // Verificar si el código ya existe en otro curso
    if (codigo) {
      const [existingCurso] = await db.query("SELECT id FROM curso WHERE codigo = ? AND id != ?", [codigo, id])
      if (existingCurso) {
        return NextResponse.json({ error: "El código de curso ya existe" }, { status: 400 })
      }
    }

    // Iniciar transacción
    await db.query("START TRANSACTION")

    try {
      // Actualizar curso
      const updateFields = []
      const updateParams = []

      if (codigo) {
        updateFields.push("codigo = ?")
        updateParams.push(codigo)
      }

      if (nombre) {
        updateFields.push("nombre = ?")
        updateParams.push(nombre)
      }

      if (descripcion !== undefined) {
        updateFields.push("descripcion = ?")
        updateParams.push(descripcion)
      }

      if (duracion_semanas) {
        updateFields.push("duracion_semanas = ?")
        updateParams.push(duracion_semanas)
      }

      if (horas_totales) {
        updateFields.push("horas_totales = ?")
        updateParams.push(horas_totales)
      }

      if (nivel) {
        updateFields.push("nivel = ?")
        updateParams.push(nivel)
      }

      if (categoria) {
        updateFields.push("categoria = ?")
        updateParams.push(categoria)
      }

      if (estado) {
        updateFields.push("estado = ?")
        updateParams.push(estado)
      }

      if (imagen_portada !== undefined) {
        updateFields.push("imagen_portada = ?")
        updateParams.push(imagen_portada)
      }

      if (costo_matricula) {
        updateFields.push("costo_matricula = ?")
        updateParams.push(costo_matricula)
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE curso SET ${updateFields.join(", ")} WHERE id = ?`
        updateParams.push(id)
        await db.query(updateQuery, updateParams)
      }

      // Actualizar módulos si se proporcionaron
      if (modulos && modulos.length > 0) {
        // Eliminar módulos existentes
        await db.query("DELETE FROM modulo_curso WHERE curso_id = ?", [id])

        // Insertar nuevos módulos
        for (let i = 0; i < modulos.length; i++) {
          const modulo = modulos[i]
          await db.query(
            `INSERT INTO modulo_curso (
              curso_id, orden, titulo, descripcion, duracion_horas
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              i + 1, // Orden basado en el índice
              modulo.titulo,
              modulo.descripcion || null,
              modulo.duracion_horas,
            ],
          )
        }
      }

      // Registrar en el log del sistema
      await db.query(
        "INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles) VALUES (?, ?, ?, ?, ?)",
        [adminData.id, "actualizar", "curso", id, `Actualización de curso: ${nombre || "ID: " + id}`],
      )

      // Confirmar transacción
      await db.query("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Curso actualizado correctamente",
      })
    } catch (error) {
      // Revertir transacción en caso de error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al actualizar curso:", error)
    return NextResponse.json({ error: "Error al actualizar curso" }, { status: 500 })
  }
}

// DELETE - Eliminar un curso
export async function DELETE(request, { params }) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    // Verificar si el curso existe
    const [curso] = await db.query("SELECT nombre FROM curso WHERE id = ?", [id])
    if (!curso) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    // Verificar si hay paralelos activos
    const [paralelosActivos] = await db.query(
      "SELECT COUNT(*) as total FROM paralelo WHERE curso_id = ? AND estado IN ('planificado', 'en_progreso')",
      [id],
    )

    if (paralelosActivos.total > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar el curso porque tiene paralelos activos",
        },
        { status: 400 },
      )
    }

    // Iniciar transacción
    await db.query("START TRANSACTION")

    try {
      // Registrar en el log del sistema antes de eliminar
      await db.query(
        "INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles) VALUES (?, ?, ?, ?, ?)",
        [adminData.id, "eliminar", "curso", id, `Eliminación de curso: ${curso.nombre}`],
      )

      // Eliminar módulos
      await db.query("DELETE FROM modulo_curso WHERE curso_id = ?", [id])

      // Eliminar curso
      await db.query("DELETE FROM curso WHERE id = ?", [id])

      // Confirmar transacción
      await db.query("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Curso eliminado correctamente",
      })
    } catch (error) {
      // Revertir transacción en caso de error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al eliminar curso:", error)
    return NextResponse.json({ error: "Error al eliminar curso" }, { status: 500 })
  }
}
