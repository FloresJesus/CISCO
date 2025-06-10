import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"
import crypto from "crypto"
import QRCode from "qrcode"

export async function POST(request, { params }) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { id } = params // inscripcion_id

    // Verificar que la inscripción existe y el estudiante aprobó
    const [inscripcion] = await query(
      `
      SELECT 
        i.id,
        i.calificacion_final,
        i.estudiante_id,
        e.nombre as estudiante_nombre,
        e.apellido as estudiante_apellido,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo
      FROM inscripcion i
      JOIN estudiante e ON i.estudiante_id = e.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      WHERE i.id = ? AND i.calificacion_final >= 7
    `,
      [id],
    )

    if (!inscripcion) {
      return NextResponse.json(
        {
          error: "Inscripción no encontrada o estudiante no aprobó el curso",
        },
        { status: 404 },
      )
    }

    // Verificar si ya existe un certificado
    const [existingCert] = await query(
      `
      SELECT id FROM certificado WHERE inscripcion_id = ?
      `,
      [id],
    )

    if (existingCert) {
      return NextResponse.json(
        {
          error: "Ya existe un certificado para esta inscripción",
        },
        { status: 400 },
      )
    }

    // Generar URL de verificación única
    const codigoVerificacion = crypto.randomBytes(16).toString("hex")
    const urlVerificacion = `${process.env.NEXT_PUBLIC_APP_URL || "https://academy.cisco.com"}/verificar-certificado/${codigoVerificacion}`

    // Generar código QR
    const qrCodeBuffer = await QRCode.toBuffer(urlVerificacion, {
      type: "png",
      width: 300,
      margin: 2,
      color: {
        dark: "#1D428A", // Color azul Cisco
        light: "#FFFFFF",
      },
    })

    // Crear certificado
    const result = await query(
      `
      INSERT INTO certificado (
        inscripcion_id,
        fecha_emision,
        url_verificacion,
        qr_codigo,
        firmado_admin
      ) VALUES (?, NOW(), ?, ?, 1)
      `,
      [id, urlVerificacion, qrCodeBuffer],
    )

    // Actualizar la inscripción
    await query(
      `
      UPDATE inscripcion 
      SET certificado_generado = 1, certificado_fecha = NOW()
      WHERE id = ?
      `,
      [id],
    )

    return NextResponse.json({
      success: true,
      message: "Certificado generado correctamente",
      data: {
        certificado_id: result.insertId,
        url_verificacion: urlVerificacion,
        codigo_verificacion: codigoVerificacion,
      },
    })
  } catch (error) {
    console.error("Error generando certificado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
