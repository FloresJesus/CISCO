import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { searchParams } = new URL(request.url)
    const curso_id = searchParams.get("curso_id")
    const estudiante_id = searchParams.get("estudiante_id")
    const estado = searchParams.get("estado")
    const fecha_inicio = searchParams.get("fecha_inicio")
    const fecha_fin = searchParams.get("fecha_fin")

    // Construir condiciones WHERE
    const whereConditions = ["i.calificacion_final >= 51"] // Solo estudiantes que aprobaron
    const queryParams = []

    if (curso_id) {
      whereConditions.push("c.id = ?")
      queryParams.push(curso_id)
    }

    if (estudiante_id) {
      whereConditions.push("e.id = ?")
      queryParams.push(estudiante_id)
    }

    if (estado) {
      if (estado === "pendiente") {
        whereConditions.push("cert.id IS NULL")
      } else {
        whereConditions.push("cert.estado = ?")
        queryParams.push(estado)
      }
    }

    if (fecha_inicio) {
      whereConditions.push("i.fecha_inscripcion >= ?")
      queryParams.push(fecha_inicio)
    }

    if (fecha_fin) {
      whereConditions.push("i.fecha_inscripcion <= ?")
      queryParams.push(fecha_fin)
    }

    const whereClause = whereConditions.join(" AND ")

    // Consulta principal de certificaciones
    const certificaciones = await query(
      `
  SELECT 
    i.id as inscripcion_id,
    i.calificacion_final,
    i.fecha_inscripcion,
    i.certificado_generado,
    i.certificado_fecha,
    e.id as estudiante_id,
    e.nombre as estudiante_nombre,
    e.apellido as estudiante_apellido,
    e.email as estudiante_email,
    c.id as curso_id,
    c.nombre as curso_nombre,
    c.codigo as curso_codigo,
    p.nombre_paralelo as paralelo_nombre,
    cert.id as certificado_id,
    cert.url_verificacion,
    cert.fecha_emision,
    cert.firmado_admin,
    CASE 
      WHEN cert.id IS NOT NULL THEN 'emitido'
      WHEN i.calificacion_final >= 51 THEN 'pendiente'
      ELSE 'no_elegible'
    END as estado_certificacion
  FROM inscripcion i
  JOIN estudiante e ON i.estudiante_id = e.id
  JOIN paralelo p ON i.paralelo_id = p.id
  JOIN curso c ON p.curso_id = c.id
  LEFT JOIN certificado cert ON i.id = cert.inscripcion_id
  WHERE ${whereClause}
  ORDER BY i.fecha_inscripcion DESC
`,
      queryParams,
    )

    return NextResponse.json({
      success: true,
      data: certificaciones,
    })
  } catch (error) {
    console.error("Error en API de certificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
