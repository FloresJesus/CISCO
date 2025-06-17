import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(request, { params }) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { id } = params // estudiante_id

    // Obtener datos del certificado
    const [recibo] = await query(
        `
      SELECT 
        e.nombre as estudiante_nombre,
        e.apellido as estudiante_apellido,
        e.email,
        e.telefono,
        e.tipo_estudiante,
        i.fecha_inscripcion,
        p.fecha_pago,
        p.metodo_pago,
        par.nombre_paralelo,
        c.nombre as curso_nombre,
        c.duracion_semanas,
        c.nivel,
        c.codigo,
        c.costo_matricula
      FROM estudiante e
      JOIN inscripcion i On i.estudiante_id = e.id
      JOIN pago p ON p.inscripcion_id = i.id
      JOIN paralelo par ON i.paralelo_id = par.id
      JOIN curso c ON par.curso_id = c.id
      WHERE e.id = ?
    `,
        [id],
    )
    if (!recibo) {
      return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 })
    }

    // Crear PDF en orientación horizontal
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

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
    
    //insertar logo izquierdo
    doc.addImage(ciscoLogo64, "PNG", 10, 10, 50, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Sistema de administracion CISCO", 10, 37, { align: "left" });

    // Encabezado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RECIBO", 150, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Oruro-Bolivia, Calle Pagador entre Jose Ballivian y Aldana", 280, 26, { align: "right" });
    doc.text("numero de celular 555-555-555", 280, 31, { align: "right" });
    doc.text("email@example.com", 280, 36, { align: "right" });
    doc.text("info@example.al", 280, 41, { align: "right" });
    doc.text("www.example.al", 280, 46, { align: "right" });
    doc.line(10, 50, 280, 50);

    // Datos del cliente
    const nombreCompleto = `${recibo.estudiante_apellido} ${recibo.estudiante_nombre}`
    doc.setFont("helvetica", "bold");
    doc.text("Recibo a nombre de:", 10, 60);
    doc.setFont("helvetica", "normal");
    doc.text(nombreCompleto, 50, 60);
    doc.text(`${recibo.telefono}`, 50, 65);
    doc.text(`${recibo.email}`, 50, 70);
    doc.text(`${recibo.tipo_estudiante}`, 50, 75);

    //obtener el numero de recibo
    await query(
      "UPDATE contador_recibos SET ultimo_numero = ultimo_numero + 1 WHERE id = 1"
    );

    const [result] = await query(
      "SELECT ultimo_numero FROM contador_recibos WHERE id = 1"
    );

    const numeroRecibo = result.ultimo_numero;

    //datos
    doc.text(`Recibo #: ${numeroRecibo}`, 200, 60,{ align: "left" });
    doc.text(`Fecha de pago: ${new Date(recibo.fecha_pago).toLocaleDateString()}`, 200, 65,{ align: "left" });
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 200, 70,{ align: "left" });

    // --- Primera tabla: Cursos ---
    autoTable(doc,{
      startY: 90, // Ajusta la posición inicial
      head: [["Curso", "Código", "Duración", "Nivel", "Paralelo", "Costo"]],
      body: [[`${recibo.curso_nombre}`, `${recibo.codigo}`, `${recibo.duracion_semanas} Semanas`, `${recibo.nivel}`, `${recibo.nombre_paralelo}`, `${recibo.costo_matricula}`]],
      styles: { fontSize: 10 }, // Tamaño de fuente más pequeño
      headStyles: { 
        fillColor: [0, 102, 204], // Azul
        textColor: 255, // Texto blanco
        fontStyle: 'bold'
      },
    });

    // --- Segunda tabla: Totales ---
    const finalY = doc.lastAutoTable.finalY + 10;
    autoTable(doc,{
      head: [["Valores", "Bs"]],
      body: [
        ["SUBTOTAL Bs", `${recibo.costo_matricula}`],
        ["DESCUENTO Bs", "0.00"],
        ["TOTAL Bs", `${recibo.costo_matricula}`],
      ],
      styles: { 
        fontSize: 8,
        halign: 'right'
      },
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'right' },
        1: { fontStyle: 'bold', halign: 'right' }
      },
      margin: { left: 190 }, // Ajuste para alinear a la derecha
      startY: finalY
    });

    // --- Texto "SON" ---
    const yAfterTotals = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("SON:", 20, yAfterTotals);
    doc.setFont('helvetica', 'normal');
    doc.text(`${convertirNumeroARecibo(recibo.costo_matricula)}`, 40, yAfterTotals);
    doc.line(20, yAfterTotals + 2, 100, yAfterTotals + 2); // Subrayado

    // Generar el PDF como buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificado-Cisco-${recibo.estudiante_apellido}.pdf"`,
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

function numeroALetras(numero) {
  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const especiales = ['once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const centenas = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  if (numero === 0) return 'cero';

  let resultado = '';
  const numStr = Math.floor(numero).toString().padStart(9, '0');
  const millones = parseInt(numStr.substring(0, 3));
  const miles = parseInt(numStr.substring(3, 6));
  const resto = parseInt(numStr.substring(6, 9));

  // Convertir millones
  if (millones > 0) {
    if (millones === 1) {
      resultado += 'un millón ';
    } else {
      resultado += `${convertirGrupo(millones)}millones `;
    }
  }

  // Convertir miles
  if (miles > 0) {
    if (miles === 1) {
      resultado += 'mil ';
    } else {
      resultado += `${convertirGrupo(miles)}mil `;
    }
  }

  // Convertir resto
  if (resto > 0) {
    resultado += convertirGrupo(resto);
  }

  return resultado.trim();

  function convertirGrupo(n) {
    let grupo = '';
    const centena = Math.floor(n / 100);
    const decena = Math.floor((n % 100) / 10);
    const unidad = n % 10;

    // Manejo especial para "cien" vs "ciento"
    if (centena > 0) {
      if (centena === 1 && (decena + unidad) === 0) {
        grupo += 'cien ';
      } else {
        grupo += centena === 1 ? 'ciento ' : `${centenas[centena]} `;
      }
    }

    // Decenas y unidades
    if (decena === 1 && unidad > 0) {
      grupo += `${especiales[unidad - 1]} `;
    } else {
      if (decena > 0) {
        grupo += `${decenas[decena]}${unidad > 0 ? ' y ' : ' '}`;
      }
      if (unidad > 0) {
        grupo += unidades[unidad] + ' ';
      }
    }

    return grupo;
  }
}

function convertirNumeroARecibo(numero) {
  const entero = Math.floor(numero);
  const decimal = Math.round((numero - entero) * 100);
  const letrasEntero = numeroALetras(entero);
  return `${letrasEntero} ${decimal.toString().padStart(2, '0')}/100 Bolivianos`;
}