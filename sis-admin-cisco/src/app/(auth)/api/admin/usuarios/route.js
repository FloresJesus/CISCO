import { NextResponse } from "next/server"
import db from "@/libs/db"
import bcrypt from "bcryptjs"
import { verifyAdminToken } from "@/libs/auth"

// GET - Obtener todos los usuarios
export async function GET(request) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rol = searchParams.get("rol")
    const query = searchParams.get("query")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let sqlQuery = `
      SELECT 
        u.id, 
        u.email, 
        u.rol, 
        u.fecha_creacion, 
        u.ultimo_acceso, 
        u.activo,
        COALESCE(e.nombre, i.nombre) AS nombre,
        COALESCE(e.apellido, i.apellido) AS apellido,
        COALESCE(e.telefono, i.telefono) AS telefono,
        COALESCE(e.estado, i.estado) AS estado
      FROM usuario u
      LEFT JOIN estudiante e ON u.id = e.usuario_id AND u.rol = 'estudiante'
      LEFT JOIN instructor i ON u.id = i.usuario_id
    `

    let countQuery = `SELECT COUNT(*) as total FROM usuario u`
    const queryParams = []
    let countParams = []

    // Aplicar filtros
    const whereClause = []

    if (rol) {
      whereClause.push("u.rol = ?")
      queryParams.push(rol)
      countParams.push(rol)
    }

    if (query) {
      whereClause.push(`(
        u.email LIKE ? OR 
        COALESCE(e.nombre, i.nombre) LIKE ? OR 
        COALESCE(e.apellido, i.apellido) LIKE ?
      )`)
      const searchTerm = `%${query}%`
      queryParams.push(searchTerm, searchTerm, searchTerm)

      // Para el count necesitamos ajustar la consulta
      if (rol) {
        countQuery = `
          SELECT COUNT(*) as total 
          FROM usuario u
          LEFT JOIN estudiante e ON u.id = e.usuario_id AND u.rol = 'estudiante'
          LEFT JOIN instructor i ON u.id = i.usuario_id AND u.rol = 'instructor'
          WHERE u.rol = ? AND (
            u.email LIKE ? OR 
            COALESCE(e.nombre, i.nombre) LIKE ? OR 
            COALESCE(e.apellido, i.apellido) LIKE ?
          )
        `
        countParams = [rol, searchTerm, searchTerm, searchTerm]
      } else {
        countQuery = `
          SELECT COUNT(*) as total 
          FROM usuario u
          LEFT JOIN estudiante e ON u.id = e.usuario_id AND u.rol = 'estudiante'
          LEFT JOIN instructor i ON u.id = i.usuario_id AND u.rol = 'instructor'
          WHERE u.email LIKE ? OR 
            COALESCE(e.nombre, i.nombre) LIKE ? OR 
            COALESCE(e.apellido, i.apellido) LIKE ?
        `
        countParams = [searchTerm, searchTerm, searchTerm]
      }
    } else if (rol) {
      countQuery += " WHERE u.rol = ?"
    }

    if (whereClause.length > 0) {
      sqlQuery += " WHERE " + whereClause.join(" AND ")
    }

    // Ordenar y paginar
    sqlQuery += " ORDER BY u.fecha_creacion DESC LIMIT ? OFFSET ?"
    queryParams.push(limit, offset)

    // Ejecutar consultas
    const usuarios = await db.query(sqlQuery, queryParams)
    const [countResult] = await db.query(countQuery, countParams)
    const total = countResult.total

    return NextResponse.json({
      usuarios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

// POST - Crear un nuevo usuario
export async function POST(request) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    console.log(data);
    const { email, password, rol, nombre, apellido, telefono, especialidad = null, biografia = null } = data

    // Validaciones básicas
    if (!email || !password || !rol || !nombre || !apellido) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const [existingUser] = await db.query("SELECT id FROM usuario WHERE email = ?", [email.toLowerCase()])
    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Iniciar transacción
    await db.query("START TRANSACTION")

    try {
      // Insertar usuario
      const result = await db.query("INSERT INTO usuario (email, contrasena_hash, rol) VALUES (?, ?, ?)", [
        email.toLowerCase(),
        hashedPassword,
        rol,
      ])
      const userId = result.insertId

      // Insertar datos específicos según el rol
      if (rol === "estudiante") {
        await db.query(
          "INSERT INTO estudiante (usuario_id, nombre, apellido, email, telefono) VALUES (?, ?, ?, ?, ?)",
          [userId, nombre, apellido, email.toLowerCase(), telefono || null],
        )
      } else if (rol === "instructor") {
        await db.query(
          "INSERT INTO instructor (usuario_id, nombre, apellido, email, telefono, especialidad, biografia) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [userId, nombre, apellido, email.toLowerCase(), telefono || null, especialidad, biografia],
        )
      } else if (rol === "admin") {
        await db.query(
            "INSERT INTO instructor (usuario_id, nombre, apellido, email, telefono) VALUES (?, ?, ?, ?, ?)",
            [userId, nombre, apellido, email.toLowerCase(), telefono || null],
        )
      }
      // Registrar en el log del sistema
      await db.query(
        "INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles) VALUES (?, ?, ?, ?, ?)",
        [adminData.id, "crear", "usuario", userId, `Creación de usuario con rol ${rol}`],
      )

      // Confirmar transacción
      await db.query("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Usuario creado correctamente",
        userId,
      })
    } catch (error) {
      // Revertir transacción en caso de error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
