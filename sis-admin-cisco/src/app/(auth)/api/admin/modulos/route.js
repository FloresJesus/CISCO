import { NextResponse } from "next/server"
import db from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const cursoId = searchParams.get("curso_id")

    // Construir la consulta
    let query = "SELECT * FROM modulos"
    const params = []

    if (cursoId) {
      query += " WHERE curso_id = ?"
      params.push(cursoId)
    }

    query += " ORDER BY orden ASC"

    // Ejecutar la consulta
    const [modulos] = await db.execute(query, params)

    return NextResponse.json(modulos)
  } catch (error) {
    console.error("Error al obtener módulos:", error)
    return NextResponse.json({ error: "Error al obtener módulos" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Verificar rol de administrador
    if (authResult.user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const data = await request.json()
    const { nombre, descripcion, contenido, curso_id, orden } = data

    // Validar datos
    if (!nombre || !curso_id) {
      return NextResponse.json({ error: "Nombre y curso_id son campos requeridos" }, { status: 400 })
    }

    // Insertar módulo
    const [result] = await db.execute(
      "INSERT INTO modulos (nombre, descripcion, contenido, curso_id, orden, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW())",
      [nombre, descripcion, contenido, curso_id, orden || 1],
    )

    return NextResponse.json({ id: result.insertId, mensaje: "Módulo creado exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("Error al crear módulo:", error)
    return NextResponse.json({ error: "Error al crear módulo" }, { status: 500 })
  }
}
