import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"
import ExcelJS from "exceljs"
import puppeteer from "puppeteer"

export async function GET(request) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "excel"

    // Obtener datos para exportación
    const [resumenGeneral] = await query(`
      SELECT 
        COUNT(p.id) as total_pagos,
        SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as ingresos_confirmados,
        SUM(CASE WHEN p.estado = 'pendiente' THEN p.monto ELSE 0 END) as ingresos_pendientes,
        SUM(CASE WHEN p.estado = 'rechazado' THEN p.monto ELSE 0 END) as pagos_rechazados,
        AVG(CASE WHEN p.estado = 'completado' THEN p.monto END) as ticket_promedio
      FROM pago p
      WHERE p.fecha_pago >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    `)

    const ingresosPorCurso = await query(`
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
      WHERE p.fecha_pago >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY c.id, c.nombre, c.codigo
      HAVING ingresos_totales > 0
      ORDER BY ingresos_totales DESC
    `)

    const metodosPago = await query(`
      SELECT 
        p.metodo_pago,
        COUNT(p.id) as cantidad_transacciones,
        SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as monto_total
      FROM pago p
      WHERE p.fecha_pago >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY p.metodo_pago
      ORDER BY cantidad_transacciones DESC
    `)

    const estadoPagos = await query(`
      SELECT 
        p.estado,
        COUNT(p.id) as cantidad,
        SUM(p.monto) as monto_total
      FROM pago p
      WHERE p.fecha_pago >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY p.estado
      ORDER BY cantidad DESC
    `)

    if (format === "excel") {
      // Crear workbook de Excel
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Cisco Academy"
      workbook.created = new Date()

      // Hoja 1: Resumen General
      const resumenSheet = workbook.addWorksheet("Resumen Financiero")
      resumenSheet.addRow(["REPORTE FINANCIERO - RESUMEN GENERAL"])
      resumenSheet.addRow([])
      resumenSheet.addRow(["Métrica", "Valor"])
      resumenSheet.addRow(["Total Pagos", resumenGeneral.total_pagos || 0])
      resumenSheet.addRow(["Ingresos Confirmados", `$${(resumenGeneral.ingresos_confirmados || 0)}`])
      resumenSheet.addRow(["Ingresos Pendientes", `$${(resumenGeneral.ingresos_pendientes || 0)}`])
      resumenSheet.addRow(["Pagos Rechazados", `$${(resumenGeneral.pagos_rechazados || 0)}`])
      resumenSheet.addRow(["Ticket Promedio", `$${(resumenGeneral.ticket_promedio || 0)}`])

      // Estilo para el header
      resumenSheet.getRow(1).font = { bold: true, size: 14 }
      resumenSheet.getRow(3).font = { bold: true }

      // Hoja 2: Ingresos por Curso
      const cursosSheet = workbook.addWorksheet("Ingresos por Curso")
      cursosSheet.addRow([
        "Curso",
        "Código",
        "Total Pagos",
        "Ingresos Totales",
        "Ingreso Promedio",
        "Estudiantes que Pagaron",
      ])

      ingresosPorCurso.forEach((curso) => {
        cursosSheet.addRow([
          curso.curso,
          curso.codigo,
          curso.total_pagos,
          `$${(curso.ingresos_totales || 0)}`,
          `$${(curso.ingreso_promedio || 0)}`,
          curso.estudiantes_pagaron,
        ])
      })

      // Hoja 3: Métodos de Pago
      const metodosSheet = workbook.addWorksheet("Métodos de Pago")
      metodosSheet.addRow(["Método de Pago", "Cantidad Transacciones", "Monto Total"])

      metodosPago.forEach((metodo) => {
        metodosSheet.addRow([
          metodo.metodo_pago,
          metodo.cantidad_transacciones,
          `$${(metodo.monto_total || 0)}`,
        ])
      })

      // Hoja 4: Estado de Pagos
      const estadosSheet = workbook.addWorksheet("Estado de Pagos")
      estadosSheet.addRow(["Estado", "Cantidad", "Monto Total"])

      estadoPagos.forEach((estado) => {
        estadosSheet.addRow([
          estado.estado.charAt(0).toUpperCase() + estado.estado.slice(1),
          estado.cantidad,
          `$${(estado.monto_total || 0)}`,
        ])
      })

      // Aplicar estilos a todas las hojas
      ;[resumenSheet, cursosSheet, metodosSheet, estadosSheet].forEach((sheet) => {
        if (sheet.name !== "Resumen Financiero") {
          sheet.getRow(1).font = { bold: true }
          sheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF049FD9" },
          }
        }
        sheet.columns.forEach((column) => {
          column.width = 20
        })
      })

      // Generar buffer del archivo Excel
      const buffer = await workbook.xlsx.writeBuffer()

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="reporte-financiero.xlsx"',
        },
      })
    }

    if (format === "pdf") {
      // Generar HTML para PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte Financiero</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #049FD9;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #049FD9;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0 0 0;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #1D428A;
              border-bottom: 2px solid #00BCEB;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 12px;
            }
            th { 
              background-color: #049FD9; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #049FD9;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              color: #1D428A;
            }
            .summary-card .value {
              font-size: 20px;
              font-weight: bold;
              color: #049FD9;
            }
            .money {
              color: #28a745;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte Financiero</h1>
            <p>Cisco Academy - ${new Date().toLocaleDateString("es-ES")}</p>
          </div>

          <div class="section">
            <h2>Resumen General</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Total Pagos</h3>
                <div class="value">${resumenGeneral.total_pagos || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Ingresos Confirmados</h3>
                <div class="value money">Bs.${(resumenGeneral.ingresos_confirmados || 0)}</div>
              </div>
              <div class="summary-card">
                <h3>Ingresos Pendientes</h3>
                <div class="value">Bs.${(resumenGeneral.ingresos_pendientes || 0)}</div>
              </div>
              <div class="summary-card">
                <h3>Ticket Promedio</h3>
                <div class="value">Bs.${(resumenGeneral.ticket_promedio || 0)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Ingresos por Curso</h2>
            <table>
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Código</th>
                  <th>Total Pagos</th>
                  <th>Ingresos Totales</th>
                  <th>Ingreso Promedio</th>
                  <th>Estudiantes</th>
                </tr>
              </thead>
              <tbody>
                ${ingresosPorCurso
                  .map(
                    (curso) => `
                  <tr>
                    <td>${curso.curso}</td>
                    <td>${curso.codigo}</td>
                    <td>${curso.total_pagos}</td>
                    <td class="money">$${(curso.ingresos_totales || 0)}</td>
                    <td>$${(curso.ingreso_promedio || 0)}</td>
                    <td>${curso.estudiantes_pagaron}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Métodos de Pago</h2>
            <table>
              <thead>
                <tr>
                  <th>Método de Pago</th>
                  <th>Cantidad Transacciones</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                ${metodosPago
                  .map(
                    (metodo) => `
                  <tr>
                    <td>${metodo.metodo_pago}</td>
                    <td>${metodo.cantidad_transacciones}</td>
                    <td class="money">$${(metodo.monto_total || 0)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Estado de Pagos</h2>
            <table>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                ${estadoPagos
                  .map(
                    (estado) => `
                  <tr>
                    <td>${estado.estado.charAt(0).toUpperCase() + estado.estado.slice(1)}</td>
                    <td>${estado.cantidad}</td>
                    <td class="money">$${(estado.monto_total || 0)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Generado automáticamente por el Sistema de Gestión Cisco Academy</p>
            <p>Fecha de generación: ${new Date().toLocaleString("es-ES")}</p>
          </div>
        </body>
        </html>
      `

      // Generar PDF con Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })

      const page = await browser.newPage()
      await page.setContent(htmlContent, { waitUntil: "networkidle0" })

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
      })

      await browser.close()

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="reporte-financiero.pdf"',
        },
      })
    }

    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 })
  } catch (error) {
    console.error("Error en exportación de reporte financiero:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
