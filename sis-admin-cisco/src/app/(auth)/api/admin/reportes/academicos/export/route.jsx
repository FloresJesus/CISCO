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
    const [estadisticasGenerales] = await query(`
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
      WHERE p.fecha_inicio >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    `)

    const rendimientoPorCurso = await query(`
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
      WHERE p.fecha_inicio >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY c.id, c.nombre, c.codigo
      HAVING total_estudiantes > 0
      ORDER BY total_estudiantes DESC
    `)

    const rendimientoPorInstructor = await query(`
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
      WHERE p.fecha_inicio >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY inst.id, inst.nombre, inst.apellido
      HAVING total_estudiantes > 0
      ORDER BY tasa_aprobacion DESC
    `)

    if (format === "excel") {
      // Crear workbook de Excel
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Cisco Academy"
      workbook.created = new Date()

      // Hoja 1: Resumen General
      const resumenSheet = workbook.addWorksheet("Resumen General")
      resumenSheet.addRow(["REPORTE ACADÉMICO - RESUMEN GENERAL"])
      resumenSheet.addRow([])
      resumenSheet.addRow(["Métrica", "Valor"])
      resumenSheet.addRow(["Total Cursos", estadisticasGenerales.total_cursos || 0])
      resumenSheet.addRow(["Total Paralelos", estadisticasGenerales.total_paralelos || 0])
      resumenSheet.addRow(["Total Inscripciones", estadisticasGenerales.total_inscripciones || 0])
      resumenSheet.addRow(["Cursos Completados", estadisticasGenerales.cursos_completados || 0])
      resumenSheet.addRow(["Cursos Activos", estadisticasGenerales.cursos_activos || 0])
      resumenSheet.addRow([
        "Promedio Calificaciones",
        estadisticasGenerales.promedio_calificaciones
          ? Number(estadisticasGenerales.promedio_calificaciones).toFixed(2)
          : "0.00",
      ])

      // Estilo para el header
      resumenSheet.getRow(1).font = { bold: true, size: 14 }
      resumenSheet.getRow(3).font = { bold: true }

      // Hoja 2: Rendimiento por Curso
      const cursosSheet = workbook.addWorksheet("Rendimiento por Curso")
      cursosSheet.addRow([
        "Curso",
        "Código",
        "Total Estudiantes",
        "Completados",
        "Aprobados",
        "Reprobados",
        "Promedio Calificación",
        "Tasa Aprobación (%)",
      ])

      rendimientoPorCurso.forEach((curso) => {
        cursosSheet.addRow([
          curso.curso,
          curso.codigo,
          curso.total_estudiantes,
          curso.completados,
          curso.aprobados,
          curso.reprobados,
          curso.promedio_calificacion ? Number(curso.promedio_calificacion).toFixed(2) : "0.00",
          curso.tasa_aprobacion || 0,
        ])
      })

      // Estilo para headers
      cursosSheet.getRow(1).font = { bold: true }
      cursosSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF049FD9" },
      }

      // Hoja 3: Rendimiento por Instructor
      const instructoresSheet = workbook.addWorksheet("Rendimiento por Instructor")
      instructoresSheet.addRow([
        "Instructor",
        "Paralelos Asignados",
        "Total Estudiantes",
        "Completados",
        "Promedio Calificación",
        "Tasa Aprobación (%)",
      ])

      rendimientoPorInstructor.forEach((instructor) => {
        instructoresSheet.addRow([
          instructor.instructor,
          instructor.paralelos_asignados,
          instructor.total_estudiantes,
          instructor.completados,
          instructor.promedio_calificacion ? Number(instructor.promedio_calificacion).toFixed(2) : "0.00",
          instructor.tasa_aprobacion || 0,
        ])
      })

      // Estilo para headers
      instructoresSheet.getRow(1).font = { bold: true }
      instructoresSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF049FD9" },
      }

      // Ajustar ancho de columnas
      ;[resumenSheet, cursosSheet, instructoresSheet].forEach((sheet) => {
        sheet.columns.forEach((column) => {
          column.width = 20
        })
      })

      // Generar buffer del archivo Excel
      const buffer = await workbook.xlsx.writeBuffer()

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="reporte-academico.xlsx"',
        },
      })
    }

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    if (format === "pdf") {
      // Generar HTML para PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte Académico</title>
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
            tr:hover {
              background-color: #f5f5f5;
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
              font-size: 24px;
              font-weight: bold;
              color: #049FD9;
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
          <div class="header" style="display: flex; align-items: center; justify-content: space-between;">
            <img src="${baseUrl}/images/cisco2.png" alt="Logo Izquierdo" style="height: 50px;">
            <div style="text-align: center; flex: 1;">
              <h1>Reporte Académico</h1>
              <p>Cisco Academy - ${new Date().toLocaleDateString("es-ES")}</p>
            </div>
            <img src="${baseUrl}/images/utologo.png" alt="Logo derecho" style="height: 50px;">
          </div>

          <div class="section">
            <h2>Resumen General</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Total Cursos</h3>
                <div class="value">${estadisticasGenerales.total_cursos || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Total Paralelos</h3>
                <div class="value">${estadisticasGenerales.total_paralelos || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Total Inscripciones</h3>
                <div class="value">${estadisticasGenerales.total_inscripciones || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Promedio Calificaciones</h3>
                <div class="value">${
                  estadisticasGenerales.promedio_calificaciones
                    ? Number(estadisticasGenerales.promedio_calificaciones).toFixed(2)
                    : "0.00"
                }</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Rendimiento por Curso</h2>
            <table>
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Código</th>
                  <th>Estudiantes</th>
                  <th>Completados</th>
                  <th>Aprobados</th>
                  <th>Promedio</th>
                  <th>Tasa Aprobación</th>
                </tr>
              </thead>
              <tbody>
                ${rendimientoPorCurso
                  .map(
                    (curso) => `
                  <tr>
                    <td>${curso.curso}</td>
                    <td>${curso.codigo}</td>
                    <td>${curso.total_estudiantes}</td>
                    <td>${curso.completados}</td>
                    <td>${curso.aprobados}</td>
                    <td>${curso.promedio_calificacion ? Number(curso.promedio_calificacion).toFixed(2) : "0.00"}</td>
                    <td>${curso.tasa_aprobacion || 0}%</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Rendimiento por Instructor</h2>
            <table>
              <thead>
                <tr>
                  <th>Instructor</th>
                  <th>Paralelos</th>
                  <th>Estudiantes</th>
                  <th>Completados</th>
                  <th>Promedio</th>
                  <th>Tasa Aprobación</th>
                </tr>
              </thead>
              <tbody>
                ${rendimientoPorInstructor
                  .map(
                    (instructor) => `
                  <tr>
                    <td>${instructor.instructor}</td>
                    <td>${instructor.paralelos_asignados}</td>
                    <td>${instructor.total_estudiantes}</td>
                    <td>${instructor.completados}</td>
                    <td>${instructor.promedio_calificacion ? Number(instructor.promedio_calificacion).toFixed(2) : "0.00"}</td>
                    <td>${instructor.tasa_aprobacion || 0}%</td>
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
          "Content-Disposition": 'attachment; filename="reporte-academico.pdf"',
        },
      })
    }

    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 })
  } catch (error) {
    console.error("Error en exportación de reporte académico:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
