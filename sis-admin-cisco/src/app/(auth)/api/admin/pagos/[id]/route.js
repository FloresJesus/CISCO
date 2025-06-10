import { NextResponse } from "next/server"
import { query } from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

// GET - Obtener un pago por ID
export async function GET(request, { params }) {
  try {
    // Verificar autenticación
    const tokenData = await verifyAdminToken(request)
    if (!tokenData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    // Obtener pago
    const pago = await query("SELECT * FROM pago WHERE id = ?", [id])

    if (pago.length === 0) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    return NextResponse.json(pago[0])
  } catch (error) {
    console.error("Error al obtener pago:", error)
    return NextResponse.json({ error: "Error al obtener pago" }, { status: 500 })
  }
}

// PUT - Actualizar un pago
export async function PUT(request, { params }) {
  try {
    // Verificar autenticación
    const tokenData = await verificarToken(request)
    if (!tokenData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    // Validar datos requeridos
    if (!data.inscripcion_id || !data.monto || !data.fecha_pago || !data.metodo_pago || !data.estado) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar que el pago existe
    const pagoExiste = await query("SELECT * FROM pago WHERE id = ?", [id])

    if (pagoExiste.length === 0) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    // Actualizar pago
    await query(
      `UPDATE pago SET 
        inscripcion_id = ?, 
        monto = ?, 
        fecha_pago = ?, 
        metodo_pago = ?, 
        referencia = ?, 
        estado = ?, 
        comprobante = ?, 
        observaciones = ?
       WHERE id = ?`,
      [
        data.inscripcion_id,
        data.monto,
        data.fecha_pago,
        data.metodo_pago,
        data.referencia || null,
        data.estado,
        data.comprobante || null,
        data.observaciones || null,
        id,
      ],
    )

    // Registrar en log del sistema
    await query(
      `INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles)
       VALUES (?, ?, ?, ?, ?)`,
      [
        tokenData.id,
        "actualizar",
        "pago",
        id,
        `Pago actualizado por ${tokenData.email} - Monto: ${data.monto} - Estado: ${data.estado}`,
      ],
    )

    return NextResponse.json({ message: "Pago actualizado correctamente" })
  } catch (error) {
    console.error("Error al actualizar pago:", error)
    return NextResponse.json({ error: "Error al actualizar pago" }, { status: 500 })
  }
}

// DELETE - Eliminar un pago
export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación
    const tokenData = await verificarToken(request)
    if (!tokenData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    // Verificar que el pago existe
    const pagoExiste = await query("SELECT * FROM pago WHERE id = ?", [id])

    if (pagoExiste.length === 0) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    // Registrar en log del sistema antes de eliminar
    await query(
      `INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles)
       VALUES (?, ?, ?, ?, ?)`,
      [
        tokenData.id,
        "eliminar",
        "pago",
        id,
        `Pago eliminado por ${tokenData.email} - Monto: ${pagoExiste[0].monto} - Método: ${pagoExiste[0].metodo_pago}`,
      ],
    )

    // Eliminar pago
    await query("DELETE FROM pago WHERE id = ?", [id])

    return NextResponse.json({ message: "Pago eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar pago:", error)
    return NextResponse.json({ error: "Error al eliminar pago" }, { status: 500 })
  }
}
