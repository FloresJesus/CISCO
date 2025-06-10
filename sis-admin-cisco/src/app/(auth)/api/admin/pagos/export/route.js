import { NextResponse } from "next/server"
import { query } from "@/libs/db"
import { verificarToken } from "@/libs/auth"
import ExcelJS from "exceljs"

export async function GET(request) {
  try {
    // Verificar autenticación
    const tokenData = await verificarToken(request)
    if (!tokenData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado") || ""
    const metodo_pago = searchParams.get("metodo_pago") || ""
    const fecha_desde = searchParams.get("fecha_desde") || ""
    const fecha_hasta = searchParams.get("fecha_hasta") || ""
    const busqueda = searchParams.get("busqueda") || ""

    // Construir consulta base
    let baseQuery = `
      SELECT 
        p.id,
        p.monto,
        p.fecha_pago,
        p.metodo_pago,
        p.referencia,
        p.estado,
        p.comprobante,
        p.observaciones,
        e.nombre AS estudiante_nombre,
        e.apellido AS estudiante_apellido,
        c.nombre AS curso_nombre,
        c.codigo AS curso_codigo,
        pa.nombre_paralelo
      FROM pago p
      JOIN inscripcion i ON p.inscripcion_id = i.id
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo pa ON i.paralelo_id = pa.id
      JOIN curso c ON pa.curso_id = c.id
      WHERE 1=1
    `
    const queryParams = []

    // Aplicar filtros
    if (estado) {
      baseQuery += " AND p.estado = ?"
      queryParams.push(estado)
    }

    if (metodo_pago) {
      baseQuery += " AND p.metodo_pago = ?"
      queryParams.push(metodo_pago)
    }

    if (fecha_desde) {
      baseQuery += " AND DATE(p.fecha_pago) >= ?"
      queryParams.push(fecha_desde)
    }

    if (fecha_hasta) {
      baseQuery += " AND DATE(p.fecha_pago) <= ?"
      queryParams.push(fecha_hasta)
    }

    if (busqueda) {
      baseQuery += " AND (p.referencia LIKE ? OR CONCAT(e.nombre, ' ', e.apellido) LIKE ?)"
      queryParams.push(`%${busqueda}%`, `%${busqueda}%`)
    }

    // Ordenar por fecha de pago descendente
    baseQuery += " ORDER BY p.fecha_pago DESC"

    // Ejecutar consulta
    const pagos = await query(baseQuery, queryParams)

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Cisco Academy"
    workbook.created = new Date()

    // Crear hoja de trabajo
    const worksheet = workbook.addWorksheet("Pagos")

    // Definir encabezados
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Estudiante", key: "estudiante", width: 30 },
      { header: "Curso", key: "curso", width: 30 },
      { header: "Paralelo", key: "paralelo", width: 15 },
      { header: "Monto", key: "monto", width: 15 },
      { header: "Fecha de Pago", key: "fecha_pago", width: 20 },
      { header: "Método de Pago", key: "metodo_pago", width: 15 },
      { header: "Referencia", key: "referencia", width: 20 },
      { header: "Estado", key: "estado", width: 15 },
      { header: "Observaciones", key: "observaciones", width: 30 },
    ]

    // Estilo para encabezados
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }

    // Agregar datos de pagos
    pagos.forEach((pago) => {
      worksheet.addRow({
        id: pago.id,
        estudiante: `${pago.estudiante_nombre} ${pago.estudiante_apellido}`,
        curso: `${pago.curso_nombre} (${pago.curso_codigo})`,
        paralelo: pago.nombre_paralelo,
        monto: pago.monto,
        fecha_pago: pago.fecha_pago,
        metodo_pago: pago.metodo_pago,
        referencia: pago.referencia,
        estado: pago.estado,
        observaciones: pago.observaciones,
      })
    })

    // Crear buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Enviar respuesta
    return new NextResponse(new Blob([buffer]), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=pagos_${new Date().toISOString().split("T")[0]}.xlsx`,
      },
    })
  } catch (error) {
    console.error("Error al exportar pagos:", error)
    return NextResponse.json({ error: "Error al exportar pagos" }, { status: 500 })
  }
}
