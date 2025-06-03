import { NextResponse } from "next/server"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("query") || ""
    const estadoFilter = searchParams.get("estado") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Construir consulta SQL base
    let sql = `
      SELECT 
        i.id,
        i.fecha_inscripcion,
        i.estado,
        i.calificacion_final,
        i.certificado_generado,
        i.certificado_fecha,
        CONCAT(e.nombre, ' ', e.apellido) as estudiante_nombre,
        e.id as estudiante_id,
        c.nombre as curso_nombre,
        c.id as curso_id,
        p.nombre_paralelo as paralelo_nombre,
        p.codigo_paralelo as paralelo_codigo,
        p.id as paralelo_id,
        p.fecha_inicio,
        p.fecha_fin
      FROM inscripcion i
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      WHERE 1=1
    `

    // Añadir filtros
    const queryParams = []

    if (searchQuery) {
      sql += ` AND (e.nombre LIKE ? OR e.apellido LIKE ? OR c.nombre LIKE ? OR p.nombre_paralelo LIKE ?)`
      const searchPattern = `%${searchQuery}%`
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    if (estadoFilter) {
      sql += ` AND i.estado = ?`
      queryParams.push(estadoFilter)
    }

    // Añadir ordenamiento y paginación
    sql += ` ORDER BY i.fecha_inscripcion DESC LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    // Ejecutar consulta
    const inscripciones = await query(sql, queryParams)

    // Obtener total de registros para paginación
    let countSql = `
      SELECT COUNT(*) as total 
      FROM inscripcion i
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      WHERE 1=1
    `

    const countParams = []

    if (searchQuery) {
      countSql += ` AND (e.nombre LIKE ? OR e.apellido LIKE ? OR c.nombre LIKE ? OR p.nombre_paralelo LIKE ?)`
      const searchPattern = `%${searchQuery}%`
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    if (estadoFilter) {
      countSql += ` AND i.estado = ?`
      countParams.push(estadoFilter)
    }

    const [{ total }] = await query(countSql, countParams)

    // Calcular total de páginas
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      inscripciones,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error al obtener inscripciones:", error)
    return NextResponse.json({ error: "Error al obtener inscripciones" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Validar datos requeridos
    if (!data.estudiante_id || !data.paralelo_id) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar si el estudiante ya está inscrito en este paralelo
    const [existingInscripcion] = await query(
      "SELECT id FROM inscripcion WHERE estudiante_id = ? AND paralelo_id = ?",
      [data.estudiante_id, data.paralelo_id],
    )

    if (existingInscripcion) {
      return NextResponse.json({ error: "El estudiante ya está inscrito en este paralelo" }, { status: 400 })
    }

    // Verificar disponibilidad de cupos
    const [paraleloInfo] = await query(
      `
      SELECT 
        p.max_estudiantes,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) as inscritos
      FROM paralelo p
      WHERE p.id = ?
    `,
      [data.paralelo_id],
    )

    if (paraleloInfo.inscritos >= paraleloInfo.max_estudiantes) {
      return NextResponse.json({ error: "No hay cupos disponibles en este paralelo" }, { status: 400 })
    }

    // Iniciar transacción
    await query("START TRANSACTION")

    try {
      // Insertar inscripción
      const inscripcionResult = await query(
        `
        INSERT INTO inscripcion (
          estudiante_id,
          paralelo_id,
          fecha_inscripcion,
          estado,
          calificacion_final,
          certificado_generado
        ) VALUES (?, ?, ?, ?, NULL, 0)
      `,
        [
          data.estudiante_id,
          data.paralelo_id,
          data.fecha_inscripcion || new Date().toISOString(),
          data.estado || "activa",
        ],
      )

      const inscripcionId = inscripcionResult.insertId

      // Si hay información de pago, registrar el pago
      if (data.pago && data.pago.metodo_pago && data.pago.monto) {
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

      // Confirmar transacción
      await query("COMMIT")

      return NextResponse.json(
        {
          id: inscripcionId,
          message: "Inscripción registrada exitosamente",
        },
        { status: 201 },
      )
    } catch (error) {
      // Revertir transacción en caso de error
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al registrar inscripción:", error)
    return NextResponse.json({ error: "Error al registrar inscripción" }, { status: 500 })
  }
}
