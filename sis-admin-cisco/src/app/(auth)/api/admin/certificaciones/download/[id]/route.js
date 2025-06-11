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

    // Crear PDF en orientación horizontal
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    // 1. Fondo con patrón sutil
    doc.setFillColor(242, 248, 252) // Azul muy claro
    doc.rect(0, 0, 297, 210, "F")
    
    // Patrón de ondas sutiles
    doc.setDrawColor(220, 235, 245)
    doc.setLineWidth(0.2)
    for (let i = 0; i < 300; i += 15) {
      doc.line(i, 0, i - 20, 210)
    }

    // 2. Marco decorativo
    doc.setDrawColor(29, 66, 138) // Azul oscuro
    doc.setLineWidth(1.5)
    doc.roundedRect(15, 15, 267, 180, 5, 5, "S")
    
    // Marco interior
    doc.setDrawColor(4, 159, 217) // Azul claro
    doc.setLineWidth(0.5)
    doc.roundedRect(18, 18, 261, 174, 3, 3, "S")

    // 3. Encabezado con logo (simulado)
    // Espacio para logo (debes reemplazar con tu imagen)
    doc.setFillColor(29, 66, 138)
    doc.roundedRect(30, 25, 60, 20, 2, 2, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.text("/", 60, 37, { align: "center" })

    // Título de la institución
    doc.setTextColor(29, 66, 138)
    doc.setFontSize(10)
    doc.text("LA ACADEMIA REGIONAL CISCO SIS-FNI-UTO", 148.5, 30, { align: "center" })
    doc.text("DEPENDIENTE DE LA CARRERA DE INGENIERÍA DE SISTEMAS E INFORMÁTICA", 148.5, 35, { align: "center" })

    // 4. Título del certificado con efecto
    doc.setFontSize(24)
    doc.setTextColor(13, 36, 89)
    doc.setFont("helvetica", "bold")
    
    // Efecto de sombra
    doc.setTextColor(200, 220, 240)
    doc.text("CERTIFICADO DE PARTICIPACIÓN", 149.5, 52)
    doc.setTextColor(13, 36, 89)
    doc.text("CERTIFICADO DE PARTICIPACIÓN", 148.5, 50, { align: "center" })

    // 5. Línea decorativa con iconos
    doc.setDrawColor(4, 159, 217)
    doc.setLineWidth(1)
    doc.line(60, 55, 90, 55)
    doc.line(207, 55, 237, 55)
    doc.setFontSize(14)
    doc.setTextColor(4, 159, 217)
    doc.text("✧", 95, 55)
    doc.text("✧", 100, 55)
    doc.text("✧", 105, 55)
    doc.text("✧", 200, 55)
    doc.text("✧", 205, 55)
    doc.text("✧", 210, 55)

    // 6. Contenido principal
    doc.setFontSize(12)
    doc.setTextColor(60, 60, 60)
    doc.setFont("helvetica", "normal")
    doc.text("La Academia Regional Cisco de la Universidad Técnica de Oruro", 148.5, 70, { align: "center" })
    doc.text("certifica que:", 148.5, 75, { align: "center" })

    // Nombre del estudiante
    doc.setFontSize(28)
    doc.setTextColor(29, 66, 138)
    doc.setFont("helvetica", "bold")
    const nombreCompleto = `${certificado.estudiante_apellido} ${certificado.estudiante_nombre}`.toUpperCase()
    doc.text(nombreCompleto, 148.5, 90, { align: "center" })

    // Detalles de participación
    doc.setFontSize(12)
    doc.setTextColor(60, 60, 60)
    doc.setFont("helvetica", "normal")
    doc.text("ha participado satisfactoriamente en el programa de formación:", 148.5, 100, { align: "center" })

    // Nombre del curso
    doc.setFontSize(18)
    doc.setTextColor(13, 36, 89)
    doc.setFont("helvetica", "bold")
    doc.text(`"${certificado.curso_nombre}"`, 148.5, 110, { align: "center" })

    // Detalles del curso
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Código: ${certificado.curso_codigo} | Duración: ${certificado.duracion_semanas} semanas | Horas lectivas: ${certificado.duracion_semanas * 10}`, 148.5, 115, { align: "center" })

    // 7. Sección de fechas
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(`Realizado del ${formatDate(certificado.fecha_emision)}`, 148.5, 125, { align: "center" })
    doc.text(`Oruro - Bolivia, ${formatMonthYear(certificado.fecha_emision)}`, 148.5, 130, { align: "center" })

    // 8. Firmas


    // 9. Elementos de seguridad y verificación
    const verificationY = 180
    
    // Código QR
    if (qrCodeDataURL) {
      doc.addImage(qrCodeDataURL, "PNG", 40, verificationY, 25, 25)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text("Código de verificación:", 40, verificationY + 30)
      doc.setFontSize(7)
      doc.text(certificado.url_verificacion, 40, verificationY + 33)
    }

    // Sello de verificación
    if (certificado.firmado_admin) {
      doc.setFillColor(34, 197, 94)
      doc.circle(250, verificationY + 10, 12, "F")
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text("✓", 250, verificationY + 13, { align: "center" })
      doc.setFontSize(8)
      doc.text("DOCUMENTO", 250, verificationY + 20, { align: "center" })
      doc.text("VERIFICADO", 250, verificationY + 23, { align: "center" })
      
      // Texto de autenticidad
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text("Este certificado puede ser verificado escaneando el código QR", 148.5, verificationY + 35, { align: "center" })
      doc.text("o visitando el sistema de certificación de la Academia Cisco", 148.5, verificationY + 38, { align: "center" })
    }

    // 10. Pie de página decorativo
    doc.setDrawColor(29, 66, 138)
    doc.setLineWidth(0.5)
    doc.line(30, verificationY + 45, 267, verificationY + 45)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("© Academia Regional Cisco SIS-FNI-UTO - Todos los derechos reservados", 148.5, verificationY + 50, { align: "center" })

    // Generar el PDF como buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificado-Cisco-${certificado.estudiante_apellido}-${certificado.curso_codigo}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generando PDF del certificado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función auxiliar para formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString)
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  return date.toLocaleDateString('es-ES', options)
}

// Función auxiliar para formatear mes y año
function formatMonthYear(dateString) {
  const date = new Date(dateString)
  const options = { month: 'long', year: 'numeric' }
  return date.toLocaleDateString('es-ES', options)
}