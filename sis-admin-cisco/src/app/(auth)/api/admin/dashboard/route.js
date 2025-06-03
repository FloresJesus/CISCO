import { NextResponse } from "next/server"
import { query } from "@/libs/db"

export async function GET() {
  try {
    // Obtener todas las estadísticas en una sola llamada
    const [estudiantesStats] = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN DATEDIFF(CURRENT_DATE, fecha_registro) <= 30 THEN 1 END) as nuevos
      FROM estudiante
      WHERE estado = 'activo'
    `)

    const [cursosStats] = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as activos
      FROM curso
    `)

    const [inscripcionesStats] = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activa' THEN 1 END) as activas,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes
      FROM inscripcion
    `)

    const [ingresosTotal] = await query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago
      WHERE estado = 'completado'
    `)

    const [ingresosMes] = await query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago
      WHERE estado = 'completado'
      AND MONTH(fecha_pago) = MONTH(CURRENT_DATE)
      AND YEAR(fecha_pago) = YEAR(CURRENT_DATE)
    `)

    const [ingresosMesAnterior] = await query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago
      WHERE estado = 'completado'
      AND (
        (MONTH(fecha_pago) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
        AND YEAR(fecha_pago) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)))
        OR
        (MONTH(fecha_pago) = 12
        AND MONTH(CURRENT_DATE) = 1
        AND YEAR(fecha_pago) = YEAR(CURRENT_DATE) - 1)
      )
    `)

    // Obtener inscripciones recientes
    const recentEnrollments = await query(`
      SELECT 
        i.id,
        CONCAT(e.nombre, ' ', e.apellido) as student,
        c.nombre as course,
        i.fecha_inscripcion as date,
        i.estado as status
      FROM inscripcion i
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      ORDER BY i.fecha_inscripcion DESC
      LIMIT 5
    `)

    // Obtener próximos cursos
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

    // Calcular porcentajes
    const porcentajeEstudiantes =
      estudiantesStats.total > 0 ? ((estudiantesStats.nuevos / estudiantesStats.total) * 100).toFixed(1) : 0

    const porcentajeCursos = cursosStats.total > 0 ? ((cursosStats.activos / cursosStats.total) * 100).toFixed(1) : 0

    const porcentajeInscripciones =
      inscripcionesStats.total > 0 ? ((inscripcionesStats.pendientes / inscripcionesStats.total) * 100).toFixed(1) : 0

    let porcentajeIngresos = 0
    if (ingresosMesAnterior.total > 0) {
      porcentajeIngresos = (
        ((ingresosMes.total - ingresosMesAnterior.total) / ingresosMesAnterior.total) *
        100
      ).toFixed(1)
    }

    // Construir objeto de respuesta completo
    const dashboardData = {
      stats: {
        estudiantes: {
          total: estudiantesStats.total || 0,
          nuevos: estudiantesStats.nuevos || 0,
          porcentaje: Number.parseFloat(porcentajeEstudiantes),
        },
        cursos: {
          total: cursosStats.total || 0,
          activos: cursosStats.activos || 0,
          porcentaje: Number.parseFloat(porcentajeCursos),
        },
        inscripciones: {
          total: inscripcionesStats.total || 0,
          pendientes: inscripcionesStats.pendientes || 0,
          porcentaje: Number.parseFloat(porcentajeInscripciones),
        },
        ingresos: {
          total: ingresosTotal.total || 0,
          mes: ingresosMes.total || 0,
          porcentaje: Number.parseFloat(porcentajeIngresos),
        },
      },
      recentEnrollments,
      upcomingCourses,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return NextResponse.json({ error: "Error al obtener datos del dashboard" }, { status: 500 })
  }
}
