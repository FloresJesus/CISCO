import { NextResponse } from "next/server"
import { query } from "@/libs/db"

export async function GET(request, { params }) {
  try {
    const inscripcionId = params.id

    // Obtener datos de la inscripción
    const inscripcion = await query(
      `
      SELECT 
        i.id,
        i.fecha_inscripcion,
        i.estado,
        i.calificacion_final,
        i.certificado_generado,
        i.certificado_fecha,
        e.id as estudiante_id,
        CONCAT(e.nombre, ' ', e.apellido) as estudiante_nombre,
        e.email as estudiante_email,
        e.telefono as estudiante_telefono,
        e.estado as estudiante_estado,
        c.id as curso_id,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo,
        c.nivel as curso_nivel,
        c.duracion_semanas as curso_duracion_semanas,
        c.costo_matricula,
        p.id as paralelo_id,
        p.nombre_paralelo as paralelo_nombre,
        p.codigo_paralelo as paralelo_codigo,
        p.fecha_inicio,
        p.fecha_fin,
        p.horario,
        p.aula,
        CONCAT(i2.nombre, ' ', i2.apellido) as instructor_nombre,
        i2.id as instructor_id
      FROM inscripcion i
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      JOIN instructor i2 ON p.instructor_id = i2.id
      WHERE i.id = ?
    `,
      [inscripcionId],
    )

    if (!inscripcion) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
    }

    // Obtener pagos asociados a la inscripción
    const pagos = await query(
      `
      SELECT 
        id,
        monto,
        fecha_pago,
        metodo_pago,
        referencia,
        estado,
        comprobante,
        observaciones
      FROM pago
      WHERE inscripcion_id = ?
      ORDER BY fecha_pago DESC
    `,
      [inscripcionId],
    )

    // Obtener calificaciones asociadas a la inscripción
    const calificaciones = await query(
      `
      SELECT 
        c.id,
        c.puntuacion,
        c.fecha_calificacion,
        c.comentarios,
        e.id as evaluacion_id,
        e.nombre as evaluacion_nombre,
        e.tipo as evaluacion_tipo,
        e.valor_maximo
      FROM calificacion c
      JOIN evaluacion e ON c.evaluacion_id = e.id
      WHERE c.inscripcion_id = ?
      ORDER BY e.fecha_publicacion ASC
    `,
      [inscripcionId],
    )

    // Obtener asistencias asociadas a la inscripción
    const asistencias = await query(
      `
      SELECT 
        id,
        fecha,
        estado,
        observaciones
      FROM asistencia
      WHERE estudiante_id = ? AND paralelo_id = ?
      ORDER BY fecha DESC
    `,
      [inscripcion.estudiante_id, inscripcion.paralelo_id],
    )

    // Calcular resumen de asistencia
    let resumen_asistencia = null
    if (asistencias.length > 0) {
      const total_clases = asistencias.length
      const presentes = asistencias.filter((a) => a.estado === "presente").length
      const tardanzas = asistencias.filter((a) => a.estado === "tardanza").length
      const ausencias = asistencias.filter((a) => a.estado === "ausente").length
      const justificados = asistencias.filter((a) => a.estado === "justificado").length

      resumen_asistencia = {
        total_clases,
        presentes,
        tardanzas,
        ausencias,
        justificados,
        porcentaje_asistencia: ((presentes + tardanzas + justificados) / total_clases) * 100,
      }
    }

    // Combinar todos los datos
    const inscripcionCompleta = {
      ...inscripcion,
      pagos,
      calificaciones,
      asistencias,
      resumen_asistencia,
    }

    return NextResponse.json({inscripcionCompleta})
  } catch (error) {
    console.error(`Error al obtener inscripción ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener inscripción" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const inscripcionId = params.id
    const data = await request.json()

    // Verificar si la inscripción existe
    const [existingInscripcion] = await query("SELECT id FROM inscripcion WHERE id = ?", [inscripcionId])

    if (!existingInscripcion) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
    }

    // Iniciar transacción
    await query("START TRANSACTION")

    try {
      // Actualizar inscripción
      await query(
        `
        UPDATE inscripcion SET
          estado = ?
        WHERE id = ?
      `,
        [data.estado || "activa", inscripcionId],
      )

      // Si hay información de pago, registrar o actualizar el pago
      if (data.pago && data.pago.metodo_pago && data.pago.monto) {
        // Verificar si ya existe un pago
        const [existingPago] = await query("SELECT id FROM pago WHERE inscripcion_id = ?", [inscripcionId])

        if (existingPago) {
          // Actualizar pago existente
          await query(
            `
            UPDATE pago SET
              monto = ?,
              metodo_pago = ?,
              referencia = ?,
              estado = ?,
              observaciones = ?
            WHERE id = ?
          `,
            [
              data.pago.monto,
              data.pago.metodo_pago,
              data.pago.referencia || null,
              data.pago.estado || "completado",
              data.observaciones || null,
              existingPago.id,
            ],
          )
        } else {
          // Crear nuevo pago
          await query(
            `
            INSERT INTO pago (
              inscripcion_id,
              monto,
              fecha_pago,
              metodo_pago,
              referencia,
              estado,
              comprobante,
              observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
          `,
            [
              inscripcionId,
              data.pago.monto,
              data.pago.fecha_pago || new Date().toISOString(),
              data.pago.metodo_pago,
              data.pago.referencia || null,
              data.pago.estado || "completado",
              data.observaciones || null,
            ],
          )
        }
      }

      // Confirmar transacción
      await query("COMMIT")

      return NextResponse.json({ message: "Inscripción actualizada exitosamente" })
    } catch (error) {
      // Revertir transacción en caso de error
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error(`Error al actualizar inscripción ${params.id}:`, error)
    return NextResponse.json({ error: "Error al actualizar inscripción" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const inscripcionId = params.id

    // Verificar si la inscripción existe
    const [existingInscripcion] = await query("SELECT id FROM inscripcion WHERE id = ?", [inscripcionId])

    if (!existingInscripcion) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
    }

    // Iniciar transacción
    await query("START TRANSACTION")

    try {
      // Eliminar pagos asociados
      await query("DELETE FROM pago WHERE inscripcion_id = ?", [inscripcionId])

      // Eliminar calificaciones asociadas
      await query("DELETE FROM calificacion WHERE inscripcion_id = ?", [inscripcionId])

      // Eliminar certificado asociado
      await query("DELETE FROM certificado WHERE inscripcion_id = ?", [inscripcionId])

      // Eliminar inscripción
      await query("DELETE FROM inscripcion WHERE id = ?", [inscripcionId])

      // Confirmar transacción
      await query("COMMIT")

      return NextResponse.json({ message: "Inscripción eliminada exitosamente" })
    } catch (error) {
      // Revertir transacción en caso de error
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error(`Error al eliminar inscripción ${params.id}:`, error)
    return NextResponse.json({ error: "Error al eliminar inscripción" }, { status: 500 })
  }
}
