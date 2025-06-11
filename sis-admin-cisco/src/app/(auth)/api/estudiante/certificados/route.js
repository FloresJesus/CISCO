import { NextResponse } from "next/server"
import { verifyStudentToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Verificar autenticación del estudiante
    const authResult = await verifyStudentToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    // Verificar que es un estudiante
    if (authResult.user.rol !== "estudiante") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 })
    }

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

    // Obtener certificados del estudiante
    const certificados = await query(
      `
      SELECT 
        cert.id as certificado_id,
        cert.fecha_emision,
        cert.url_verificacion,
        cert.firmado_admin,
        i.calificacion_final,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo,
        c.duracion_semanas,
        p.fecha_inicio,
        p.fecha_fin,
        p.nombre_paralelo
      FROM certificado cert
      JOIN inscripcion i ON cert.inscripcion_id = i.id
      JOIN paralelo p ON i.paralelo_id = p.id
      JOIN curso c ON p.curso_id = c.id
      WHERE i.estudiante_id = ?
      ORDER BY cert.fecha_emision DESC
      `,
      [estudiante.id],
    )

    return NextResponse.json({
      success: true,
      data: certificados,
    })
  } catch (error) {
    console.error("Error obteniendo certificados del estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
