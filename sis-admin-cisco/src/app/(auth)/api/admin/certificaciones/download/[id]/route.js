import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"
import { jsPDF } from "jspdf"
import QRCode from "qrcode"

export async function GET(request, { params }) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { id } = params // certificado_id

    // Obtener datos del certificado
    const [certificado] = await query(
      `
      SELECT 
        cert.id,
        cert.url_verificacion,
        cert.fecha_emision,
        cert.firmado_admin,
        i.calificacion_final,
        e.nombre as estudiante_nombre,
        e.apellido as estudiante_apellido,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo,
        c.duracion_semanas,
        CONCAT(inst.nombre, ' ', inst.apellido) as instructor_nombre
      FROM certificado cert
      JOIN inscripcion i ON cert.inscripcion_id = i.id
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      LEFT JOIN instructor inst ON p.instructor_id = inst.id
      WHERE cert.id = ?
    `,
      [id],
    )

    if (!certificado) {
      return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 })
    }

    // Generar código QR como imagen base64
    const qrCodeDataURL = await QRCode.toDataURL(certificado.url_verificacion, {
      type: "image/png",
      width: 200,
      margin: 2,
      color: {
        dark: "#1D428A",
        light: "#FFFFFF",
      },
    })

    // Crear PDF (mismo código que arriba)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    // Fondo degradado
    doc.setFillColor(4, 159, 217)
    doc.rect(0, 0, 297, 210, "F")

    // Marco del certificado
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(20, 20, 257, 170, 5, 5, "F")

    // Borde decorativo
    doc.setDrawColor(4, 159, 217)
    doc.setLineWidth(2)
    doc.roundedRect(25, 25, 247, 160, 3, 3, "S")

    // Logo y título principal
    doc.setFontSize(24)
    doc.setTextColor(29, 66, 138)
    doc.setFont("helvetica", "bold")
    doc.text("🌐 CISCO ACADEMY", 148.5, 45, { align: "center" })

    // Título del certificado
    doc.setFontSize(32)
    doc.setTextColor(29, 66, 138)
    doc.text("CERTIFICADO DE FINALIZACIÓN", 148.5, 60, { align: "center" })

    // Línea decorativa
    doc.setDrawColor(4, 159, 217)
    doc.setLineWidth(1)
    doc.line(60, 65, 237, 65)

    // Texto "Se certifica que"
    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    doc.text("Se certifica que", 148.5, 80, { align: "center" })

    // Nombre del estudiante
    doc.setFontSize(28)
    doc.setTextColor(4, 159, 217)
    doc.setFont("helvetica", "bold")
    const nombreCompleto = `${certificado.estudiante_nombre} ${certificado.estudiante_apellido}`.toUpperCase()
    doc.text(nombreCompleto, 148.5, 95, { align: "center" })

    // Texto "ha completado satisfactoriamente el curso"
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.setFont("helvetica", "normal")
    doc.text("ha completado satisfactoriamente el curso", 148.5, 110, { align: "center" })

    // Nombre del curso
    doc.setFontSize(20)
    doc.setTextColor(29, 66, 138)
    doc.setFont("helvetica", "bold")
    doc.text(certificado.curso_nombre, 148.5, 125, { align: "center" })

    // Información del curso
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    const infoCurso = `Código: ${certificado.curso_codigo} | Duración: ${certificado.duracion_semanas} semanas`
    doc.text(infoCurso, 148.5, 135, { align: "center" })

    // Calificación final
    doc.setFontSize(16)
    doc.setTextColor(255, 107, 0)
    doc.setFont("helvetica", "bold")
    const calificacion = `Calificación Final: ${Number(certificado.calificacion_final).toFixed(1)}/100`
    doc.text(calificacion, 148.5, 150, { align: "center" })

    // Línea separadora inferior
    doc.setDrawColor(4, 159, 217)
    doc.setLineWidth(1)
    doc.line(30, 160, 267, 160)

    // Información de verificación
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.setFont("helvetica", "normal")
    doc.text("Fecha de emisión:", 35, 170)
    doc.text(new Date(certificado.fecha_emision).toLocaleDateString("es-ES"), 35, 175)

    if (certificado.instructor_nombre) {
      doc.text("Instructor:", 35, 182)
      doc.text(certificado.instructor_nombre, 35, 187)
    }

    // URL de verificación
    doc.setFontSize(8)
    doc.text("URL de verificación:", 35, 194)
    doc.text(certificado.url_verificacion, 35, 198)

    // Código QR
    if (qrCodeDataURL) {
      doc.addImage(qrCodeDataURL, "PNG", 220, 165, 30, 30)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text("Escanea para verificar", 235, 200, { align: "center" })
    }

    // Sello de verificación
    if (certificado.firmado_admin) {
      doc.setFillColor(34, 197, 94)
      doc.circle(260, 45, 8, "F")
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text("✓", 260, 47, { align: "center" })
      doc.setFontSize(6)
      doc.setTextColor(34, 197, 94)
      doc.text("VERIFICADO", 260, 55, { align: "center" })
    }

    // Generar el PDF como buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${certificado.estudiante_nombre}-${certificado.estudiante_apellido}-${certificado.curso_codigo}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generando PDF del certificado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
