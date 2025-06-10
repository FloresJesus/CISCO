import { NextResponse } from "next/server"
import db from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

export async function GET(request, { params }) {
  try {
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }


    const { id } = params
    // Obtener todos los paralelos del curso
    const paralelos = await db.query(
      `
      SELECT 
        p.id, 
        p.codigo_paralelo, 
        p.nombre_paralelo, 
        p.fecha_inicio,
        p.fecha_fin,
        p.horario,
        p.aula,
        p.max_estudiantes,
        p.estado,
        CONCAT(i.nombre, ' ', i.apellido) as instructor_nombre,
        i.id as instructor_id,
        (SELECT COUNT(*) FROM inscripcion WHERE paralelo_id = p.id) as inscritos
      FROM paralelo p
      JOIN instructor i ON p.instructor_id = i.id
      WHERE p.curso_id = ?
      ORDER BY p.fecha_inicio DESC
      `,
      [id],
    )
    return NextResponse.json(paralelos)
  } catch (error) {
    console.error(`Error al obtener paralelos para el curso ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener paralelos" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const cursoId = params.id
    const data = await request.json()

    // Validar datos requeridos
    const requiredFields = [
      "codigo_paralelo",
      "nombre_paralelo",
      "instructor_id",
      "fecha_inicio",
      "fecha_fin",
      "horario",
      "aula",
      "estado",
      "max_estudiantes",
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Insertar nuevo paralelo
    const result = await db.query(
      `
      INSERT INTO paralelo (
        curso_id,
        codigo_paralelo,
        nombre_paralelo,
        instructor_id,
        fecha_inicio,
        fecha_fin,
        horario,
        aula,
        max_estudiantes,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cursoId,
        data.codigo_paralelo,
        data.nombre_paralelo,
        data.instructor_id,
        data.fecha_inicio,
        data.fecha_fin,
        data.horario,
        data.aula,
        data.max_estudiantes,
        data.estado,
      ],
    )

    // Obtener el paralelo recién creado
    const [nuevoParalelo] = await db.query(
      `
      SELECT 
        p.id, 
        p.codigo_paralelo, 
        p.nombre_paralelo, 
        p.fecha_inicio,
        p.fecha_fin,
        p.horario,
        p.aula,
        p.max_estudiantes,
        p.estado,
        CONCAT(i.nombre, ' ', i.apellido) as instructor_nombre,
        i.id as instructor_id
      FROM paralelo p
      JOIN instructor i ON p.instructor_id = i.id
      WHERE p.id = ?
      `,
      [result.insertId],
    )

    return NextResponse.json(nuevoParalelo[0], { status: 201 })
  } catch (error) {
    console.error(`Error al crear paralelo para el curso ${params.id}:`, error)
    return NextResponse.json({ error: "Error al crear el paralelo" }, { status: 500 })
  }
}
