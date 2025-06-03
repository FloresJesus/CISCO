import { NextResponse } from "next/server"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("query") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = (page - 1) * limit
    const searchPattern = `%${searchQuery}%`

    // Construir consulta SQL base
    let sql = `
      SELECT 
        e.id, 
        e.nombre, 
        e.apellido, 
        e.email, 
        e.telefono, 
        e.estado,
        e.tipo_estudiante,
        e.fecha_registro,
        e.usuario_id
      FROM estudiante e
      WHERE e.estado = 'activo'
    `

    // Añadir filtro de búsqueda si existe
    const queryParams = []
    if (searchQuery) {
      sql += ` AND (e.nombre LIKE ? OR e.apellido LIKE ? OR e.email LIKE ?)`
      queryParams.push(searchPattern, searchPattern, searchPattern)
    }

    // Añadir ordenamiento y paginación
    sql += ` ORDER BY e.apellido, e.nombre LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    // Ejecutar consulta
    const estudiantes = await query(sql, queryParams)

    // Obtener total de registros para paginación
    const [{ total }] = await query(
      `SELECT COUNT(*) as total FROM estudiante WHERE estado = 'activo'${
        searchQuery ? ` AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)` : ""
      }`,
      searchQuery ? [searchPattern, searchPattern, searchPattern] : [],
    )

    // Calcular total de páginas
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      estudiantes,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error al obtener estudiantes:", error)
    return NextResponse.json({ error: "Error al obtener estudiantes" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Validar datos requeridos
    if (!data.nombre || !data.apellido || !data.email) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar si ya existe un estudiante con el mismo email
    const [existingStudent] = await query("SELECT id FROM estudiante WHERE email = ?", [data.email])

    if (existingStudent) {
      return NextResponse.json({ error: "Ya existe un estudiante registrado con este email" }, { status: 400 })
    }

    // Crear usuario primero
    const userResult = await query(
      `
      INSERT INTO usuario (
        email,
        contrasena_hash,
        rol,
        fecha_creacion,
        activo
      ) VALUES (?, ?, ?, NOW(), ?)
    `,
      [data.email, data.contrasena_hash || "temporal_password_hash", "estudiante", data.activo ? 1 : 0],
    )

    const userId = userResult.insertId

    // Insertar nuevo estudiante
    const result = await query(
      `
      INSERT INTO estudiante (
        usuario_id,
        nombre, 
        apellido, 
        email, 
        telefono, 
        foto_perfil,
        fecha_nacimiento, 
        estado,
        tipo_estudiante,
        fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [
        userId,
        data.nombre,
        data.apellido,
        data.email,
        data.telefono || null,
        data.foto_perfil || null,
        data.fecha_nacimiento || null,
        data.estado || "activo",
        data.tipo_estudiante || "externo",
      ],
    )

    return NextResponse.json(
      {
        id: result.insertId,
        usuario_id: userId,
        message: "Estudiante registrado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al registrar estudiante:", error)
    return NextResponse.json({ error: "Error al registrar estudiante" }, { status: 500 })
  }
}
