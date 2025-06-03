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
        (SELECT COUNT(*) FROM usuario WHERE activo = 1) as usuarios_activos,
        (SELECT COUNT(*) FROM estudiante WHERE estado = 'activo') as estudiantes_activos,
        (SELECT COUNT(*) FROM instructor WHERE estado = 'activo') as instructores_activos,
        (SELECT COUNT(*) FROM curso WHERE estado = 'disponible') as cursos_disponibles,
        (SELECT COUNT(*) FROM paralelo WHERE estado IN ('planificado', 'en_progreso')) as paralelos_activos,
        (SELECT COUNT(*) FROM inscripcion WHERE estado = 'activa') as inscripciones_activas
    `)

    const distribucionRoles = await query(`
      SELECT 
        rol,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM usuario WHERE activo = 1), 2) as porcentaje
      FROM usuario
      WHERE activo = 1
      GROUP BY rol
      ORDER BY cantidad DESC
    `)

    const estadisticasCursos = await query(`
      SELECT 
        c.categoria,
        c.nivel,
        COUNT(DISTINCT c.id) as total_cursos,
        COUNT(DISTINCT p.id) as total_paralelos,
        COUNT(i.id) as total_inscripciones,
        AVG(c.duracion_semanas) as duracion_promedio
      FROM curso c
      LEFT JOIN paralelo p ON c.id = p.curso_id
      LEFT JOIN inscripcion i ON p.id = i.paralelo_id
      GROUP BY c.categoria, c.nivel
      ORDER BY c.categoria, c.nivel
    `)

    const [rendimientoGeneral] = await query(`
      SELECT 
        COUNT(CASE WHEN calificacion_final >= 9 THEN 1 END) as excelente,
        COUNT(CASE WHEN calificacion_final >= 7 AND calificacion_final < 9 THEN 1 END) as bueno,
        COUNT(CASE WHEN calificacion_final >= 5 AND calificacion_final < 7 THEN 1 END) as regular,
        COUNT(CASE WHEN calificacion_final < 5 THEN 1 END) as deficiente,
        AVG(calificacion_final) as promedio_general,
        COUNT(*) as total_calificaciones
      FROM inscripcion
      WHERE calificacion_final IS NOT NULL
    `)

    if (format === "excel") {
      // Crear workbook de Excel
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Cisco Academy"
      workbook.created = new Date()

      // Hoja 1: Estadísticas Generales
      const generalSheet = workbook.addWorksheet("Estadísticas Generales")
      generalSheet.addRow(["REPORTE DE ESTADÍSTICAS - RESUMEN GENERAL"])
      generalSheet.addRow([])
      generalSheet.addRow(["Métrica", "Valor"])
      generalSheet.addRow(["Usuarios Activos", estadisticasGenerales.usuarios_activos || 0])
      generalSheet.addRow(["Estudiantes Activos", estadisticasGenerales.estudiantes_activos || 0])
      generalSheet.addRow(["Instructores Activos", estadisticasGenerales.instructores_activos || 0])
      generalSheet.addRow(["Cursos Disponibles", estadisticasGenerales.cursos_disponibles || 0])
      generalSheet.addRow(["Paralelos Activos", estadisticasGenerales.paralelos_activos || 0])
      generalSheet.addRow(["Inscripciones Activas", estadisticasGenerales.inscripciones_activas || 0])

      // Hoja 2: Distribución por Roles
      const rolesSheet = workbook.addWorksheet("Distribución por Roles")
      rolesSheet.addRow(["Rol", "Cantidad", "Porcentaje"])

      distribucionRoles.forEach((rol) => {
        rolesSheet.addRow([rol.rol.charAt(0).toUpperCase() + rol.rol.slice(1), rol.cantidad, `${rol.porcentaje}%`])
      })

      // Hoja 3: Estadísticas de Cursos
      const cursosSheet = workbook.addWorksheet("Estadísticas de Cursos")
      cursosSheet.addRow([
        "Categoría",
        "Nivel",
        "Total Cursos",
        "Total Paralelos",
        "Total Inscripciones",
        "Duración Promedio (sem)",
      ])

      estadisticasCursos.forEach((curso) => {
        cursosSheet.addRow([
          curso.categoria,
          curso.nivel,
          curso.total_cursos,
          curso.total_paralelos,
          curso.total_inscripciones,
          curso.duracion_promedio ? Number(curso.duracion_promedio).toFixed(1) : "N/A",
        ])
      })

      // Hoja 4: Rendimiento Académico
      const rendimientoSheet = workbook.addWorksheet("Rendimiento Académico")
      rendimientoSheet.addRow(["Categoría", "Cantidad", "Porcentaje"])
      const total = rendimientoGeneral.total_calificaciones || 1
      rendimientoSheet.addRow([
        "Excelente (9-10)",
        rendimientoGeneral.excelente || 0,
        `${(((rendimientoGeneral.excelente || 0) / total) * 100).toFixed(2)}%`,
      ])
      rendimientoSheet.addRow([
        "Bueno (7-8.9)",
        rendimientoGeneral.bueno || 0,
        `${(((rendimientoGeneral.bueno || 0) / total) * 100).toFixed(2)}%`,
      ])
      rendimientoSheet.addRow([
        "Regular (5-6.9)",
        rendimientoGeneral.regular || 0,
        `${(((rendimientoGeneral.regular || 0) / total) * 100).toFixed(2)}%`,
      ])
      rendimientoSheet.addRow([
        "Deficiente (<5)",
        rendimientoGeneral.deficiente || 0,
        `${(((rendimientoGeneral.deficiente || 0) / total) * 100).toFixed(2)}%`,
      ])
      rendimientoSheet.addRow([])
      rendimientoSheet.addRow([
        "Promedio General",
        rendimientoGeneral.promedio_general ? Number(rendimientoGeneral.promedio_general).toFixed(2) : "0.00",
        "",
      ])

      // Aplicar estilos
      ;[generalSheet, rolesSheet, cursosSheet, rendimientoSheet].forEach((sheet) => {
        if (sheet.name === "Estadísticas Generales") {
          sheet.getRow(1).font = { bold: true, size: 14 }
          sheet.getRow(3).font = { bold: true }
        } else {
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
          "Content-Disposition": 'attachment; filename="reporte-estadisticas.xlsx"',
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
          <title>Reporte de Estadísticas</title>
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
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #049FD9;
              text-align: center;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              color: #1D428A;
              font-size: 14px;
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
          <div class="header">
            <h1>Reporte de Estadísticas</h1>
            <p>Cisco Academy - ${new Date().toLocaleDateString("es-ES")}</p>
          </div>

          <div class="section">
            <h2>Estadísticas Generales del Sistema</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Usuarios Activos</h3>
                <div class="value">${estadisticasGenerales.usuarios_activos || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Estudiantes Activos</h3>
                <div class="value">${estadisticasGenerales.estudiantes_activos || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Instructores Activos</h3>
                <div class="value">${estadisticasGenerales.instructores_activos || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Cursos Disponibles</h3>
                <div class="value">${estadisticasGenerales.cursos_disponibles || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Paralelos Activos</h3>
                <div class="value">${estadisticasGenerales.paralelos_activos || 0}</div>
              </div>
              <div class="summary-card">
                <h3>Inscripciones Activas</h3>
                <div class="value">${estadisticasGenerales.inscripciones_activas || 0}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Distribución por Roles</h2>
            <table>
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                ${distribucionRoles
                  .map(
                    (rol) => `
                  <tr>
                    <td>${rol.rol.charAt(0).toUpperCase() + rol.rol.slice(1)}</td>
                    <td>${rol.cantidad}</td>
                    <td>${rol.porcentaje}%</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Estadísticas de Cursos por Categoría</h2>
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Nivel</th>
                  <th>Cursos</th>
                  <th>Paralelos</th>
                  <th>Inscripciones</th>
                  <th>Duración Promedio</th>
                </tr>
              </thead>
              <tbody>
                ${estadisticasCursos
                  .map(
                    (curso) => `
                  <tr>
                    <td>${curso.categoria}</td>
                    <td>${curso.nivel}</td>
                    <td>${curso.total_cursos}</td>
                    <td>${curso.total_paralelos}</td>
                    <td>${curso.total_inscripciones}</td>
                    <td>${curso.duracion_promedio ? Number(curso.duracion_promedio).toFixed(1) + " sem" : "N/A"}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Rendimiento Académico General</h2>
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Excelente (9-10)</td>
                  <td>${rendimientoGeneral.excelente || 0}</td>
                  <td>${(((rendimientoGeneral.excelente || 0) / (rendimientoGeneral.total_calificaciones || 1)) * 100).toFixed(2)}%</td>
                </tr>
                <tr>
                  <td>Bueno (7-8.9)</td>
                  <td>${rendimientoGeneral.bueno || 0}</td>
                  <td>${(((rendimientoGeneral.bueno || 0) / (rendimientoGeneral.total_calificaciones || 1)) * 100).toFixed(2)}%</td>
                </tr>
                <tr>
                  <td>Regular (5-6.9)</td>
                  <td>${rendimientoGeneral.regular || 0}</td>
                  <td>${(((rendimientoGeneral.regular || 0) / (rendimientoGeneral.total_calificaciones || 1)) * 100).toFixed(2)}%</td>
                </tr>
                <tr>
                  <td>Deficiente (&lt;5)</td>
                  <td>${rendimientoGeneral.deficiente || 0}</td>
                  <td>${(((rendimientoGeneral.deficiente || 0) / (rendimientoGeneral.total_calificaciones || 1)) * 100).toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
            <p><strong>Promedio General: ${rendimientoGeneral.promedio_general ? Number(rendimientoGeneral.promedio_general).toFixed(2) : "0.00"}</strong></p>
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
          "Content-Disposition": 'attachment; filename="reporte-estadisticas.pdf"',
        },
      })
    }

    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 })
  } catch (error) {
    console.error("Error en exportación de reporte de estadísticas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
