import { NextResponse } from "next/server"
import db from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

// GET - Obtener todos los cursos
export async function GET(request) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get("categoria")
    const nivel = searchParams.get("nivel")
    const estado = searchParams.get("estado")
    const query = searchParams.get("query")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let sqlQuery = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM paralelo p WHERE p.curso_id = c.id) as total_paralelos,
        (SELECT COUNT(*) FROM inscripcion i JOIN paralelo p ON i.paralelo_id = p.id WHERE p.curso_id = c.id) as total_estudiantes
      FROM curso c
    `

    let countQuery = `SELECT COUNT(*) as total FROM curso c`
    const queryParams = []
    const countParams = []

    // Aplicar filtros
    const whereClause = []

    if (categoria) {
      whereClause.push("c.categoria = ?")
      queryParams.push(categoria)
      countParams.push(categoria)
    }

    if (nivel) {
      whereClause.push("c.nivel = ?")
      queryParams.push(nivel)
      countParams.push(nivel)
    }

    if (estado) {
      whereClause.push("c.estado = ?")
      queryParams.push(estado)
      countParams.push(estado)
    }

    if (query) {
      whereClause.push("(c.nombre LIKE ? OR c.codigo LIKE ? OR c.descripcion LIKE ?)")
      const searchTerm = `%${query}%`
      queryParams.push(searchTerm, searchTerm, searchTerm)
      countParams.push(searchTerm, searchTerm, searchTerm)
    }

    if (whereClause.length > 0) {
      const whereString = " WHERE " + whereClause.join(" AND ")
      sqlQuery += whereString
      countQuery += whereString
    }

    // Ordenar y paginar
    sqlQuery += " ORDER BY c.fecha_creacion DESC LIMIT ? OFFSET ?"
    queryParams.push(limit, offset)

    // Ejecutar consultas
    const cursos = await db.query(sqlQuery, queryParams)
    const [countResult] = await db.query(countQuery, countParams)
    const total = countResult.total

    return NextResponse.json({
      cursos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener cursos:", error)
    return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 })
  }
}

// POST - Crear un nuevo curso
export async function POST(request) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const {
      codigo,
      nombre,
      descripcion,
      duracion_semanas,
      horas_totales,
      nivel,
      categoria,
      estado,
      imagen_portada,
      costo_matricula,
      modulos = [],
    } = data

    // Validaciones básicas
    if (!codigo || !nombre || !duracion_semanas || !horas_totales || !nivel || !categoria || !costo_matricula) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el código ya existe
    const [existingCurso] = await db.query("SELECT id FROM curso WHERE codigo = ?", [codigo])
    if (existingCurso) {
      return NextResponse.json({ error: "El código de curso ya existe" }, { status: 400 })
    }

    // Iniciar transacción
    await db.query("START TRANSACTION")

    try {
      // Insertar curso
      const result = await db.query(
        `INSERT INTO curso (
          codigo, nombre, descripcion, duracion_semanas, horas_totales, 
          nivel, categoria, estado, imagen_portada, costo_matricula
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo,
          nombre,
          descripcion || null,
          duracion_semanas,
          horas_totales,
          nivel,
          categoria,
          estado || "disponible",
          imagen_portada || null,
          costo_matricula,
        ],
      )
      const cursoId = result.insertId

      // Insertar módulos si existen
      if (modulos && modulos.length > 0) {
        for (let i = 0; i < modulos.length; i++) {
          const modulo = modulos[i]
          await db.query(
            `INSERT INTO modulo_curso (
              curso_id, orden, titulo, descripcion, duracion_horas
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              cursoId,
              i + 1, // Orden basado en el índice
              modulo.titulo,
              modulo.descripcion || null,
              modulo.duracion_horas,
            ],
          )
        }
      }

      // Registrar en el log del sistema
      await db.query(
        "INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles) VALUES (?, ?, ?, ?, ?)",
        [adminData.user.id, "crear", "curso", cursoId, `Creación de curso: ${nombre}`],
      )
      await db.query(
        "INSERT INTO notificacion (usuario_id,titulo,mensaje,tipo) VALUES (?,?,?,?)",
        [adminData.user.id, "Nuevo curso creado",`El ${nombre} ha sido creado exitosamente.`,"sistema"],
      )
      // Confirmar transacción
      await db.query("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Curso creado correctamente",
        cursoId,
      })
    } catch (error) {
      // Revertir transacción en caso de error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al crear curso:", error)
    return NextResponse.json({ error: "Error al crear curso" }, { status: 500 })
  }
}
