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
    const modulo_id = searchParams.get("modulo_id")
    const tipo = searchParams.get("tipo")

    let whereClause = "1=1"
    const queryParams = []

    if (curso_id) {
      whereClause += " AND mc.curso_id = ?"
      queryParams.push(curso_id)
    }

    if (modulo_id) {
      whereClause += " AND e.modulo_id = ?"
      queryParams.push(modulo_id)
    }

    if (tipo) {
      whereClause += " AND e.tipo = ?"
      queryParams.push(tipo)
    }

    const evaluaciones = await query(
      `
      SELECT 
        e.*,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo,
        mc.titulo as modulo_nombre,
        COUNT(DISTINCT cal.inscripcion_id) as estudiantes_evaluados
      FROM evaluacion e
      JOIN modulo_curso mc ON e.modulo_id = mc.id
      JOIN curso c ON mc.curso_id = c.id
      LEFT JOIN calificacion cal ON e.id = cal.evaluacion_id
      WHERE ${whereClause}
      GROUP BY e.id
      ORDER BY e.fecha_publicacion DESC
    `,
      queryParams,
    )

    return NextResponse.json({
      success: true,
      data: evaluaciones,
    })
  } catch (error) {
    console.error("Error obteniendo evaluaciones:", error)
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
    const { modulo_id, tipo, nombre, descripcion, valor_maximo, fecha_publicacion, fecha_limite } = body

    // Validaciones
    if (!modulo_id || !nombre || !tipo) {
      return NextResponse.json({ error: "Módulo ID, nombre y tipo son requeridos" }, { status: 400 })
    }

    // Verificar que el módulo existe
    const [modulo] = await query("SELECT id FROM modulo_curso WHERE id = ?", [modulo_id])
    if (!modulo) {
      return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 })
    }

    // Crear evaluación
    const result = await query(
      `
      INSERT INTO evaluacion (
        modulo_id, tipo, nombre, descripcion, valor_maximo, 
        fecha_publicacion, fecha_limite
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        modulo_id,
        tipo,
        nombre,
        descripcion || null,
        valor_maximo || 100,
        fecha_publicacion || new Date(),
        fecha_limite || null,
      ],
    )

    return NextResponse.json({
      success: true,
      message: "Evaluación creada exitosamente",
      data: { id: result.insertId },
    })
  } catch (error) {
    console.error("Error creando evaluación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
