import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import db from "@/libs/db"

export async function GET(request) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get("periodo") || "mes"
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    // Construir condición de fecha
    let fechaCondicion = ""
    let fechaParams = []

    if (fechaInicio && fechaFin) {
      fechaCondicion = "AND p.fecha_inicio BETWEEN ? AND ?"
      fechaParams = [fechaInicio, fechaFin]
    } else {
      // Filtro por período predeterminado
      const ahora = new Date()
      const fechaDesde = new Date()

      switch (periodo) {
        case "semana":
          fechaDesde.setDate(ahora.getDate() - 7)
          break
        case "mes":
          fechaDesde.setMonth(ahora.getMonth() - 1)
          break
        case "trimestre":
          fechaDesde.setMonth(ahora.getMonth() - 3)
          break
        case "año":
          fechaDesde.setFullYear(ahora.getFullYear() - 1)
          break
      }

      fechaCondicion = "AND p.fecha_inicio >= ?"
      fechaParams = [fechaDesde.toISOString().split("T")[0]]
    }

    // 1. Estadísticas generales de cursos
    const [estadisticasGenerales] = await db.query(
      `
      SELECT 
        COUNT(DISTINCT c.id) as total_cursos,
        COUNT(DISTINCT p.id) as total_paralelos,
        COUNT(DISTINCT i.id) as total_inscripciones,
        COUNT(DISTINCT CASE WHEN i.estado = 'completada' THEN i.id END) as cursos_completados,
        COUNT(DISTINCT CASE WHEN i.estado = 'activa' THEN i.id END) as cursos_activos,
        AVG(CASE WHEN i.calificacion_final IS NOT NULL THEN i.calificacion_final END) as promedio_calificaciones
      FROM curso c
      LEFT JOIN paralelo p ON c.id = p.curso_id
      LEFT JOIN inscripcion i ON p.id = i.paralelo_id
      WHERE 1=1 ${fechaCondicion}
    `,
      fechaParams,
    )

    // 2. Rendimiento por curso
    const rendimientoPorCurso = await db.query(
      `
      SELECT 
        c.nombre as curso,
        c.codigo,
        COUNT(i.id) as total_estudiantes,
        COUNT(CASE WHEN i.estado = 'completada' THEN 1 END) as completados,
        COUNT(CASE WHEN i.calificacion_final >= 51 THEN 1 END) as aprobados,
        COUNT(CASE WHEN i.calificacion_final < 51 AND i.calificacion_final IS NOT NULL THEN 1 END) as reprobados,
        AVG(CASE WHEN i.calificacion_final IS NOT NULL THEN i.calificacion_final END) as promedio_calificacion,
        ROUND(COUNT(CASE WHEN i.calificacion_final >= 51 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN i.calificacion_final IS NOT NULL THEN 1 END), 0), 2) as tasa_aprobacion
      FROM curso c
      LEFT JOIN paralelo p ON c.id = p.curso_id
      LEFT JOIN inscripcion i ON p.id = i.paralelo_id
      WHERE 1=1 ${fechaCondicion}
      GROUP BY c.id, c.nombre, c.codigo
      HAVING total_estudiantes > 0
      ORDER BY total_estudiantes DESC
    `,
      fechaParams,
    )

    // 3. Rendimiento por instructor
    const rendimientoPorInstructor = await db.query(
      `
      SELECT 
        CONCAT(inst.nombre, ' ', inst.apellido) as instructor,
        COUNT(DISTINCT p.id) as paralelos_asignados,
        COUNT(i.id) as total_estudiantes,
        COUNT(CASE WHEN i.estado = 'completada' THEN 1 END) as completados,
        AVG(CASE WHEN i.calificacion_final IS NOT NULL THEN i.calificacion_final END) as promedio_calificacion,
        ROUND(COUNT(CASE WHEN i.calificacion_final >= 51 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN i.calificacion_final IS NOT NULL THEN 1 END), 0), 2) as tasa_aprobacion
      FROM instructor inst
      LEFT JOIN paralelo p ON inst.id = p.instructor_id
      LEFT JOIN inscripcion i ON p.id = i.paralelo_id
      WHERE 1=1 ${fechaCondicion}
      GROUP BY inst.id, inst.nombre, inst.apellido
      HAVING total_estudiantes > 0
      ORDER BY tasa_aprobacion DESC
    `,
      fechaParams,
    )

    // 4. Evolución mensual de inscripciones
    const evolucionInscripciones = await db.query(`
      SELECT 
        DATE_FORMAT(i.fecha_inscripcion, '%Y-%m') as mes,
        COUNT(i.id) as inscripciones,
        COUNT(CASE WHEN i.estado = 'completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN i.estado = 'cancelada' THEN 1 END) as canceladas
      FROM inscripcion i
      WHERE i.fecha_inscripcion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(i.fecha_inscripcion, '%Y-%m')
      ORDER BY mes ASC
    `)

    // 5. Distribución por categorías de curso
    const distribucionCategorias = await db.query(
      `
      SELECT 
        c.categoria,
        COUNT(DISTINCT c.id) as total_cursos,
        COUNT(i.id) as total_inscripciones,
        COUNT(CASE WHEN i.estado = 'completada' THEN 1 END) as completadas
      FROM curso c
      LEFT JOIN paralelo p ON c.id = p.curso_id
      LEFT JOIN inscripcion i ON p.id = i.paralelo_id
      WHERE 1=1 ${fechaCondicion}
      GROUP BY c.categoria
      ORDER BY total_inscripciones DESC
    `,
      fechaParams,
    )

    return NextResponse.json({
      success: true,
      data: {
        estadisticasGenerales,
        rendimientoPorCurso,
        rendimientoPorInstructor,
        evolucionInscripciones,
        distribucionCategorias,
      },
    })
  } catch (error) {
    console.error("Error en reporte académico:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
