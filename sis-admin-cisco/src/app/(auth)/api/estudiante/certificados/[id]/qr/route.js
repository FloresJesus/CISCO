import { NextResponse } from "next/server"
import { verifyStudentToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request, { params }) {
  try {
    // Verificar autenticación del estudiante
    const authResult = await verifyStudentToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { id } = params // certificado_id

    // Obtener el ID del estudiante
    const [estudiante] = await query(
      `
      SELECT id FROM estudiante WHERE usuario_id = ?
      `,
      [authResult.user.id],
    )

    if (!estudiante) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Verificar que el certificado pertenece al estudiante
    const [certificado] = await query(
      `
      SELECT cert.qr_codigo
      FROM certificado cert
      JOIN inscripcion i ON cert.inscripcion_id = i.id
      WHERE cert.id = ? AND i.estudiante_id = ?
      `,
      [id, estudiante.id],
    )

    if (!certificado || !certificado.qr_codigo) {
      return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 })
    }

    // Devolver la imagen QR
    return new NextResponse(certificado.qr_codigo, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000", // Cache por 1 año
      },
    })
  } catch (error) {
    console.error("Error obteniendo QR del certificado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
