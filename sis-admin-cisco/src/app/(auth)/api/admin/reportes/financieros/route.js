import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

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
      fechaCondicion = "AND p.fecha_pago BETWEEN ? AND ?"
      fechaParams = [fechaInicio, fechaFin]
    } else {
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

      fechaCondicion = "AND p.fecha_pago >= ?"
      fechaParams = [fechaDesde.toISOString().split("T")[0]]
    }

    // 1. Resumen financiero general
    const [resumenGeneral] = await query(
      `
      SELECT 
        COUNT(p.id) as total_pagos,
        SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as ingresos_confirmados,
        SUM(CASE WHEN p.estado = 'pendiente' THEN p.monto ELSE 0 END) as ingresos_pendientes,
        SUM(CASE WHEN p.estado = 'rechazado' THEN p.monto ELSE 0 END) as pagos_rechazados,
        AVG(CASE WHEN p.estado = 'completado' THEN p.monto END) as ticket_promedio
      FROM pago p
      WHERE 1=1 ${fechaCondicion}
    `,
      fechaParams,
    )

    // 2. Ingresos por mes
    const ingresosPorMes = await query(`
      SELECT 
        DATE_FORMAT(p.fecha_pago, '%Y-%m') as mes,
        SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as ingresos,
        COUNT(CASE WHEN p.estado = 'completado' THEN 1 END) as pagos_completados,
        COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pagos_pendientes
      FROM pago p
      WHERE p.fecha_pago >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(p.fecha_pago, '%Y-%m')
      ORDER BY mes ASC
    `)

    // 3. Ingresos por curso
    const ingresosPorCurso = await query(
      `
      SELECT 
        c.nombre as curso,
        c.codigo,
        COUNT(p.id) as total_pagos,
        SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as ingresos_totales,
        AVG(CASE WHEN p.estado = 'completado' THEN p.monto END) as ingreso_promedio,
        COUNT(DISTINCT i.estudiante_id) as estudiantes_pagaron
      FROM curso c
      JOIN paralelo par ON c.id = par.curso_id
      JOIN inscripcion i ON par.id = i.paralelo_id
      JOIN pago p ON i.id = p.inscripcion_id
      WHERE 1=1 ${fechaCondicion}
      GROUP BY c.id, c.nombre, c.codigo
      HAVING ingresos_totales > 0
      ORDER BY ingresos_totales DESC
    `,
      fechaParams,
    )

    // 4. Métodos de pago más utilizados
    const metodosPago = await query(`
      SELECT 
        p.metodo_pago,
        COUNT(p.id) as cantidad_transacciones,
        SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as monto_total,
        ROUND(COUNT(p.id) * 100.0 / (
          SELECT COUNT(*) FROM pago 
          WHERE fecha_pago >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        ), 2) as porcentaje_uso
      FROM pago p
      WHERE p.fecha_pago >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY p.metodo_pago
      ORDER BY cantidad_transacciones DESC
    `)

    // 5. Estado de pagos - CORREGIDO
    const estadoPagos = await query(
      `
      SELECT 
        p.estado,
        COUNT(p.id) as cantidad,
        SUM(p.monto) as monto_total,
        ROUND(COUNT(p.id) * 100.0 / (
          SELECT COUNT(*) FROM pago sub_p 
          WHERE 1=1 ${fechaCondicion.replace(/p\./g, "sub_p.")}
        ), 2) as porcentaje
      FROM pago p
      WHERE 1=1 ${fechaCondicion}
      GROUP BY p.estado
      ORDER BY cantidad DESC
    `,
      [...fechaParams, ...fechaParams], // Duplicamos los parámetros para la subconsulta
    )

    // 6. Pagos pendientes por estudiante
    const pagosPendientes = await query(`
      SELECT 
        CONCAT(e.nombre, ' ', e.apellido) as estudiante,
        e.email,
        c.nombre as curso,
        p.monto,
        p.fecha_pago,
        DATEDIFF(NOW(), p.fecha_pago) as dias_vencido
      FROM pago p
      JOIN inscripcion i ON p.inscripcion_id = i.id
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo par ON i.paralelo_id = par.id
      JOIN curso c ON par.curso_id = c.id
      WHERE p.estado = 'pendiente'
      ORDER BY p.fecha_pago ASC
      LIMIT 20
    `)

    return NextResponse.json({
      success: true,
      data: {
        resumenGeneral,
        ingresosPorMes,
        ingresosPorCurso,
        metodosPago,
        estadoPagos,
        pagosPendientes,
      },
    })
  } catch (error) {
    console.error("Error en reporte financiero:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
