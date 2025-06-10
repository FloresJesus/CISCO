import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { searchParams } = new URL(request.url)
    const curso_id = searchParams.get("curso_id")

    let whereClause = "1=1"
    const queryParams = []

    if (curso_id) {
      whereClause = "mc.curso_id = ?"
      queryParams.push(curso_id)
    }

    const modulos = await query(
      `
      SELECT 
        mc.*,
        mc.titulo as nombre,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo,
        COUNT(e.id) as total_evaluaciones
      FROM modulo_curso mc
      JOIN curso c ON mc.curso_id = c.id
      LEFT JOIN evaluacion e ON mc.id = e.modulo_id
      WHERE ${whereClause}
      GROUP BY mc.id
      ORDER BY mc.curso_id, mc.orden ASC
    `,
      queryParams,
    )

    return NextResponse.json({
      success: true,
      data: modulos,
    })
  } catch (error) {
    console.error("Error obteniendo módulos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const body = await request.json()
    const { curso_id, titulo, descripcion, orden, duracion_horas } = body

    // Validaciones
    if (!curso_id || !titulo) {
      return NextResponse.json({ error: "Curso ID y título son requeridos" }, { status: 400 })
    }

    // Verificar que el curso existe
    const [curso] = await query("SELECT id FROM curso WHERE id = ?", [curso_id])
    if (!curso) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    // Crear módulo
    const result = await query(
      `
      INSERT INTO modulo_curso (
        curso_id, orden, titulo, descripcion, duracion_horas
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [curso_id, orden || 1, titulo, descripcion || null, duracion_horas || 0],
    )

    return NextResponse.json({
      success: true,
      message: "Módulo creado exitosamente",
      data: { id: result.insertId },
    })
  } catch (error) {
    console.error("Error creando módulo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
