import { NextResponse } from "next/server";
import { verifyStudentToken } from "@/libs/auth";
import { query } from "@/libs/db";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export async function GET(request, { params }) {
  try {
    // Verificar autenticación
    const authResult = await verifyStudentToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const { id } = params;

    // Usa el mismo código de generación de PDF que ya tienes
    const [certificado] = await query(`
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
        c.horas_totales as horas_certificadas,
        CONCAT(inst.nombre, ' ', inst.apellido) as instructor_nombre,
        inst.certificaciones_cisco as instructor_certificacion
      FROM certificado cert
      JOIN inscripcion i ON cert.inscripcion_id = i.id
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      LEFT JOIN instructor inst ON p.instructor_id = inst.id
      WHERE cert.id = ?
    `, [id]);
    if (!certificado) {
      return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
    }

    // Generar código QR
    const qrCodeDataURL = await QRCode.toDataURL(certificado.url_verificacion, {
      type: "image/png",
      width: 200,
      margin: 2,
      color: {
        dark: "#1D428A", // Azul Cisco
        light: "#FFFFFF",
      },
    })

    // Generar PDF (usa el mismo código que ya tienes)
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

        // 1. Cargar imágenes desde la carpeta public
    // Necesitamos rutas absolutas para el servidor
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    // Logo Cisco
    const ciscoLogoResponse = await fetch(`${baseUrl}/images/cisco2.png`);
    const ciscoLogoBuffer = await ciscoLogoResponse.arrayBuffer();

    const ciscoLogo64 = Buffer.from(ciscoLogoBuffer).toString('base64');
    const ciscoLogoDataURL = `data:image/png;base64,${ciscoLogo64}`;

    // Logo UTO
    const utoLogoResponse = await fetch(`${baseUrl}/images/utologo.png`);
    const utoLogoBuffer = await utoLogoResponse.arrayBuffer();

    const utoLogo64 = Buffer.from(utoLogoBuffer).toString('base64');
    const utoLogoDataURL = `data:image/png;base64,${utoLogo64}`;

    // 1. Fondo con patrón de color sólido y transparencia
    doc.setFillColor(29, 66, 138); // Azul Cisco
    doc.rect(0, 0, 297, 210, 'F');

    // 2. Efecto de gradiente manual (alternativa)
    const gradientSteps = 20;
    const startColor = [29, 66, 138]; // Azul oscuro
    const endColor = [4, 159, 217];   // Azul claro

    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = Math.round(startColor[0] * (1 - ratio) + endColor[0] * ratio);
      const g = Math.round(startColor[1] * (1 - ratio) + endColor[1] * ratio);
      const b = Math.round(startColor[2] * (1 - ratio) + endColor[2] * ratio);

      doc.setFillColor(r, g, b);
      doc.rect(0, i * (210 / gradientSteps), 297, 210 / gradientSteps, 'F');
    }

    // 2. Marco de certificado con efecto de relieve
    doc.setDrawColor(255, 255, 255, 30)
    doc.setLineWidth(2)
    doc.roundedRect(20, 15, 257, 180, 5, 5, "S")
    doc.setDrawColor(255, 255, 255, 80)
    doc.roundedRect(20.5, 15.5, 256, 179, 5, 5, "S")

    // 3. Encabezado con logos (simulados)
    // Logo Cisco (reemplazar con imagen real)
    doc.setFillColor(255, 255, 255)
    //doc.roundedRect(30, 25, 60, 20, 2, 2, "F")
    doc.setTextColor(29, 66, 138)
    doc.setFontSize(12)
    doc.addImage(ciscoLogoDataURL,"PNG", 30, 25, 50, 20, { align: "center" })

    // Logo UTO (reemplazar con imagen real)
    doc.setFillColor(255, 255, 255)
    //doc.roundedRect(207, 25, 60, 20, 2, 2, "F")
    doc.setTextColor(29, 66, 138)
    doc.addImage(utoLogoDataURL,"PNG", 230, 25, 30, 30, { align: "center" })

    // 4. Títulos institucionales
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("ACADEMIA REGIONAL CISCO", 148.5, 30, { align: "center" })
    doc.setFontSize(10)
    doc.text("Facultad Nacional de Ingeniería - Universidad Técnica de Oruro", 148.5, 35, { align: "center" })
    doc.text("Programa de Educación Continua en Redes y Tecnologías Cisco", 148.5, 40, { align: "center" })

    // 5. Título del certificado
    doc.setFontSize(24)
    doc.setTextColor(255, 204, 0) // Amarillo Cisco
    doc.setFont("helvetica", "bold")
    doc.text("CERTIFICADO DE APROBACIÓN", 148.5, 60, { align: "center" })

    // Divisor estilizado
    doc.setDrawColor(255, 204, 0)
    doc.setLineWidth(1)
    doc.line(80, 65, 217, 65)
    doc.line(80, 66, 217, 66)

    // 6. Cuerpo del certificado
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text("Certificamos que:", 148.5, 80, { align: "center" })

    // Nombre del estudiante
    doc.setFontSize(28)
    doc.setTextColor(255, 204, 0)
    const nombreCompleto = `${certificado.estudiante_apellido} ${certificado.estudiante_nombre}`.toUpperCase()
    doc.text(nombreCompleto, 148.5, 95, { align: "center" })

    // Descripción del logro
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text("ha completado satisfactoriamente el curso:", 148.5, 105, { align: "center" })

    // Nombre del curso
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bolditalic")
    doc.text(`"${certificado.curso_nombre}"`, 148.5, 115, { align: "center" })

    // Detalles técnicos del curso
    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    const cursoDetalle = `Código: ${certificado.curso_codigo} | ${certificado.duracion_semanas} semanas | ${certificado.horas_certificadas || certificado.duracion_semanas * 10} horas | Calificación: ${certificado.calificacion_final}/100`
    doc.text(cursoDetalle, 148.5, 120, { align: "center" })

    // 7. Fechas
    doc.setFontSize(10)
    doc.text(`Realizado del ${formatDate(certificado.fecha_emision)}`, 148.5, 130, { align: "center" })
    doc.text(`Oruro - Bolivia, ${formatMonthYear(certificado.fecha_emision)}`, 148.5, 135, { align: "center" })

    // 8. Sección de firmas
    const firmasY = 150

    // Firma instructor
    doc.setDrawColor(255, 204, 0)
    doc.line(50, firmasY, 120, firmasY)
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text(certificado.instructor_nombre || "Instructor Cisco Certificado", 85, firmasY + 5, { align: "center" })
    doc.setFontSize(8)
    doc.text(certificado.instructor_certificacion || "Instructor Autorizado Cisco", 85, firmasY + 8, { align: "center" })

    // Firma coordinador
    doc.setDrawColor(255, 204, 0)
    doc.line(175, firmasY, 245, firmasY)
    doc.setFontSize(10)
    doc.text("Ing. Nombre Apellido", 210, firmasY + 5, { align: "center" })
    doc.setFontSize(8)
    doc.text("Coordinador Academia Regional Cisco", 210, firmasY + 8, { align: "center" })

    // Código QR
    doc.setFillColor(255, 255, 255, 20)
    //doc.roundedRect(30, verificationY, 40, 40, 2, 2, "F")
    if (qrCodeDataURL) {
      doc.addImage(qrCodeDataURL, "PNG", 133.5, firmasY, 30, 30, { align: "center" })
    }
    // Fecha de emisión
    doc.text(`Fecha de emisión: ${new Date(certificado.fecha_emision).toLocaleDateString('es-ES')}`, 148.5, firmasY + 35, { align: "center" })

    // Devuelve el PDF para vista previa (no descarga)
    return new NextResponse(doc.output("arraybuffer"), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=preview.pdf" // Importante: 'inline' para visualización
      }
    });
  } catch (error) {
    console.error("Error generando vista previa:", error);
    return NextResponse.json({ error: "Error al generar vista previa" }, { status: 500 });
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