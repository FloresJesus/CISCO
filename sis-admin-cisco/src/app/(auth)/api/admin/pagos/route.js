import { NextResponse } from "next/server"
import { query, queryWithPagination } from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

// GET - Obtener pagos con filtros y paginación
export async function GET(request) {
  try {
    // Verificar autenticación
    const tokenData = await verifyAdminToken(request)
    if (!tokenData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const pagina = Number.parseInt(searchParams.get("pagina") || "1")
    const limite = Number.parseInt(searchParams.get("limite") || "10")
    const estado = searchParams.get("estado") || ""
    const metodo_pago = searchParams.get("metodo_pago") || ""
    const fecha_desde = searchParams.get("fecha_desde") || ""
    const fecha_hasta = searchParams.get("fecha_hasta") || ""
    const busqueda = searchParams.get("busqueda") || ""

    // Construir consulta base
    let baseQuery = `
      SELECT p.* 
      FROM pago p
      JOIN inscripcion i ON p.inscripcion_id = i.id
      JOIN estudiante e ON i.estudiante_id = e.id
      WHERE 1=1
    `
    const queryParams = []

    // Aplicar filtros
    if (estado) {
      baseQuery += " AND p.estado = ?"
      queryParams.push(estado)
    }

    if (metodo_pago) {
      baseQuery += " AND p.metodo_pago = ?"
      queryParams.push(metodo_pago)
    }

    if (fecha_desde) {
      baseQuery += " AND DATE(p.fecha_pago) >= ?"
      queryParams.push(fecha_desde)
    }

    if (fecha_hasta) {
      baseQuery += " AND DATE(p.fecha_pago) <= ?"
      queryParams.push(fecha_hasta)
    }

    if (busqueda) {
      baseQuery += " AND (p.referencia LIKE ? OR CONCAT(e.nombre, ' ', e.apellido) LIKE ?)"
      queryParams.push(`%${busqueda}%`, `%${busqueda}%`)
    }

    // Ordenar por fecha de pago descendente
    baseQuery += " ORDER BY p.fecha_pago DESC"

    // Ejecutar consulta con paginación
    const result = await queryWithPagination(baseQuery, queryParams, pagina, limite)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    return NextResponse.json({ error: "Error al obtener pagos" }, { status: 500 })
  }
}

// POST - Crear nuevo pago
export async function POST(request) {
  try {
    // Verificar autenticación
    const tokenData = await verificarToken(request)
    if (!tokenData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del pago
    const data = await request.json()

    // Validar datos requeridos
    if (!data.inscripcion_id || !data.monto || !data.fecha_pago || !data.metodo_pago || !data.estado) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar que la inscripción existe
    const inscripcionExiste = await query("SELECT id FROM inscripcion WHERE id = ?", [data.inscripcion_id])

    if (inscripcionExiste.length === 0) {
      return NextResponse.json({ error: "La inscripción seleccionada no existe" }, { status: 400 })
    }

    // Insertar pago
    const result = await query(
      `INSERT INTO pago (
        inscripcion_id, monto, fecha_pago, metodo_pago, 
        referencia, estado, comprobante, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.inscripcion_id,
        data.monto,
        data.fecha_pago,
        data.metodo_pago,
        data.referencia || null,
        data.estado,
        data.comprobante || null,
        data.observaciones || null,
      ],
    )

    // Registrar en log del sistema
    await query(
      `INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles)
       VALUES (?, ?, ?, ?, ?)`,
      [
        tokenData.user.id,
        "crear",
        "pago",
        result.insertId,
        `Pago registrado por ${tokenData.email} - Monto: ${data.monto} - Método: ${data.metodo_pago}`,
      ],
    )
    await db.query(
        "INSERT INTO notificacion (usuario_id,titulo,mensaje,tipo) VALUES (?,?,?,?)",
        [tokenData.user.id, "Nuevo pago registrado",`Se realizo un nuevo pago.`,"sistema"],
    )

    return NextResponse.json({ id: result.insertId, message: "Pago registrado correctamente" }, { status: 201 })
  } catch (error) {
    console.error("Error al crear pago:", error)
    return NextResponse.json({ error: "Error al crear pago" }, { status: 500 })
  }
}
