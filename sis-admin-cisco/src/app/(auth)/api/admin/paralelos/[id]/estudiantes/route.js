import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query, queryWithPagination } from "@/libs/db"

export async function GET(request, { params }) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id: paraleloId } = params
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const searchQuery = searchParams.get("query") || ""
    const estadoFiltro = searchParams.get("estado") || ""

    // Verificar que el paralelo existe
    const [paralelo] = await query(
      `SELECT p.id, p.nombre_paralelo, p.codigo_paralelo, c.nombre as curso_nombre
       FROM paralelo p
       JOIN curso c ON p.curso_id = c.id
       WHERE p.id = ?`,
      [paraleloId],
    )

    if (!paralelo) {
      return NextResponse.json({ error: "Paralelo no encontrado" }, { status: 404 })
    }

    // Construir consulta base
    let baseQuery = `
      SELECT 
        e.id,
        e.nombre,
        e.apellido,
        e.email,
        e.telefono,
        e.tipo_estudiante,
        e.estado as estado_estudiante,
        i.id as inscripcion_id,
        i.fecha_inscripcion,
        i.estado as estado_inscripcion,
        i.calificacion_final,
        i.certificado_generado,
        i.certificado_fecha,
        p.estado as estado_pago,
        p.monto as monto_pago,
        p.fecha_pago,
        p.metodo_pago,
        -- Calcular asistencias
        COALESCE(asist_stats.total_clases, 0) as total_clases,
        COALESCE(asist_stats.clases_asistidas, 0) as clases_asistidas,
        CASE 
          WHEN COALESCE(asist_stats.total_clases, 0) > 0 
          THEN ROUND((COALESCE(asist_stats.clases_asistidas, 0) * 100.0) / asist_stats.total_clases, 1)
          ELSE 0 
        END as porcentaje_asistencia
      FROM inscripcion i
      JOIN estudiante e ON i.estudiante_id = e.id
      LEFT JOIN pago p ON i.id = p.inscripcion_id AND p.estado = 'completado'
      LEFT JOIN (
        SELECT 
          estudiante_id,
          COUNT(*) as total_clases,
          SUM(CASE WHEN estado IN ('presente', 'tardanza') THEN 1 ELSE 0 END) as clases_asistidas
        FROM asistencia 
        WHERE paralelo_id = ?
        GROUP BY estudiante_id
      ) asist_stats ON e.id = asist_stats.estudiante_id
      WHERE i.paralelo_id = ?
    `

    const queryParams = [paraleloId, paraleloId]

    // Aplicar filtros
    if (searchQuery) {
      baseQuery += ` AND (e.nombre LIKE ? OR e.apellido LIKE ? OR e.email LIKE ?)`
      const searchTerm = `%${searchQuery}%`
      queryParams.push(searchTerm, searchTerm, searchTerm)
    }

    if (estadoFiltro) {
      baseQuery += ` AND i.estado = ?`
      queryParams.push(estadoFiltro)
    }

    // Ordenar por fecha de inscripción
    baseQuery += ` ORDER BY i.fecha_inscripcion DESC`

    // Ejecutar consulta con paginación
    const result = await queryWithPagination(baseQuery, queryParams, page, limit)

    // Obtener estadísticas generales del paralelo
    const [estadisticas] = await query(
      `SELECT 
        COUNT(i.id) as total_inscritos,
        COUNT(CASE WHEN i.estado = 'activo' THEN 1 END) as inscritos_activos,
        COUNT(CASE WHEN i.estado = 'completada' THEN 1 END) as completados,
        COUNT(CASE WHEN i.certificado_generado = 1 THEN 1 END) as certificados_emitidos,
        AVG(CASE WHEN i.calificacion_final IS NOT NULL THEN i.calificacion_final END) as promedio_calificaciones,
        COUNT(CASE WHEN p.estado = 'completado' THEN 1 END) as pagos_completados,
        SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as total_recaudado
       FROM inscripcion i
       LEFT JOIN pago p ON i.id = p.inscripcion_id
       WHERE i.paralelo_id = ?`,
      [paraleloId],
    )

    return NextResponse.json({
      success: true,
      paralelo,
      estudiantes: result.data,
      pagination: result.pagination,
      estadisticas: {
        ...estadisticas,
        promedio_calificaciones: estadisticas.promedio_calificaciones
          ? Number.parseFloat(estadisticas.promedio_calificaciones.toFixed(2))
          : null,
        total_recaudado: Number.parseFloat(estadisticas.total_recaudado || 0),
      },
    })
  } catch (error) {
    console.error("Error al obtener estudiantes del paralelo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Inscribir estudiante a paralelo
export async function POST(request, { params }) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id: paraleloId } = params
    const body = await request.json()
    const { estudiante_id } = body

    if (!estudiante_id) {
      return NextResponse.json({ error: "ID del estudiante es requerido" }, { status: 400 })
    }

    // Verificar que el paralelo existe y no está completo
    const [paralelo] = await query(
      `SELECT p.*, c.costo_matricula
       FROM paralelo p
       JOIN curso c ON p.curso_id = c.id
       WHERE p.id = ? AND p.estado IN ('planificado', 'en_progreso')`,
      [paraleloId],
    )

    if (!paralelo) {
      return NextResponse.json({ error: "Paralelo no encontrado o no disponible" }, { status: 404 })
    }

    // Verificar que el estudiante existe
    const [estudiante] = await query(
      "SELECT id, nombre, apellido, email FROM estudiante WHERE id = ? AND estado = 'activo'",
      [estudiante_id],
    )

    if (!estudiante) {
      return NextResponse.json({ error: "Estudiante no encontrado o inactivo" }, { status: 404 })
    }

    // Verificar que no esté ya inscrito
    const [inscripcionExistente] = await query(
      "SELECT id FROM inscripcion WHERE estudiante_id = ? AND paralelo_id = ?",
      [estudiante_id, paraleloId],
    )

    if (inscripcionExistente) {
      return NextResponse.json({ error: "El estudiante ya está inscrito en este paralelo" }, { status: 400 })
    }

    // Verificar capacidad máxima
    const [conteoInscritos] = await query(
      "SELECT COUNT(*) as total FROM inscripcion WHERE paralelo_id = ? AND estado IN ('activa', 'completada')",
      [paraleloId],
    )

    if (conteoInscritos.total >= paralelo.max_estudiantes) {
      return NextResponse.json({ error: "El paralelo ha alcanzado su capacidad máxima" }, { status: 400 })
    }

    // Crear inscripción
    const inscripcionResult = await query(
      "INSERT INTO inscripcion (estudiante_id, paralelo_id, fecha_inscripcion, estado) VALUES (?, ?, NOW(), 'activa')",
      [estudiante_id, paraleloId],
    )

    // Crear registro de pago pendiente
    await query(
      "INSERT INTO pago (inscripcion_id, monto, fecha_pago, metodo_pago, estado) VALUES (?, ?, NOW(), 'transferencia', 'pendiente')",
      [inscripcionResult.insertId, paralelo.costo_matricula],
    )

    // Registrar en log del sistema
    await query(
      "INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles) VALUES (?, 'inscribir_estudiante', 'paralelo', ?, ?)",
      [
        authResult.user.id,
        paraleloId,
        `Estudiante ${estudiante.nombre} ${estudiante.apellido} inscrito en paralelo ${paralelo.nombre_paralelo}`,
      ],
    )

    return NextResponse.json({
      success: true,
      message: "Estudiante inscrito exitosamente",
      inscripcion_id: inscripcionResult.insertId,
    })
  } catch (error) {
    console.error("Error al inscribir estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
