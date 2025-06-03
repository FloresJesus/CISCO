import { NextResponse } from "next/server"
import { query } from "@/libs/db"

export async function GET() {
  try {
    // Obtener estadísticas de estudiantes
    const [estudiantesStats] = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN DATEDIFF(CURRENT_DATE, fecha_registro) <= 30 THEN 1 END) as nuevos
      FROM estudiante
      WHERE estado = 'activo'
    `)

    // Calcular porcentaje de nuevos estudiantes
    const porcentajeEstudiantes =
      estudiantesStats.total > 0 ? ((estudiantesStats.nuevos / estudiantesStats.total) * 100).toFixed(1) : 0

    // Obtener estadísticas de cursos
    const [cursosStats] = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as activos
      FROM curso
    `)

    // Calcular porcentaje de cursos activos
    const porcentajeCursos = cursosStats.total > 0 ? ((cursosStats.activos / cursosStats.total) * 100).toFixed(1) : 0

    // Obtener estadísticas de inscripciones
    const [inscripcionesStats] = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activa' THEN 1 END) as activas,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes
      FROM inscripcion
    `)

    // Calcular porcentaje de inscripciones pendientes
    const porcentajeInscripciones =
      inscripcionesStats.total > 0 ? ((inscripcionesStats.pendientes / inscripcionesStats.total) * 100).toFixed(1) : 0

    // Obtener estadísticas de ingresos
    const [ingresosTotal] = await query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago
      WHERE estado = 'completado'
    `)

    // Obtener ingresos del mes actual
    const [ingresosMes] = await query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago
      WHERE estado = 'completado'
      AND MONTH(fecha_pago) = MONTH(CURRENT_DATE)
      AND YEAR(fecha_pago) = YEAR(CURRENT_DATE)
    `)

    // Obtener ingresos del mes anterior para comparación
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

    // Calcular porcentaje de cambio en ingresos
    let porcentajeIngresos = 0
    if (ingresosMesAnterior.total > 0) {
      porcentajeIngresos = (
        ((ingresosMes.total - ingresosMesAnterior.total) / ingresosMesAnterior.total) *
        100
      ).toFixed(1)
    }

    // Construir objeto de respuesta
    const stats = {
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
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas del dashboard" }, { status: 500 })
  }
}
