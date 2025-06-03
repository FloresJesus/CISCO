import { NextResponse } from "next/server"
import db from "@/libs/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const activos = searchParams.get("activos") === "true"

    let sqlQuery = `
      SELECT id, nombre, apellido, email, especialidad, estado
      FROM instructor
      WHERE 1=1
    `

    const queryParams = []

    if (query) {
      sqlQuery += ` AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR especialidad LIKE ?)`
      const searchTerm = `%${query}%`
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (activos) {
      sqlQuery += ` AND estado = 'activo'`
    }

    sqlQuery += ` ORDER BY apellido, nombre`

    const instructores = await db.query(sqlQuery, queryParams)

    return NextResponse.json({
      instructores,
    })
  } catch (error) {
    console.error("Error al obtener instructores:", error)
    return NextResponse.json({ error: "Error al obtener los instructores" }, { status: 500 })
  }
}
