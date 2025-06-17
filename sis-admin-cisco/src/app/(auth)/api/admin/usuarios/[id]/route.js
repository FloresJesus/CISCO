import { NextResponse } from "next/server"
import db from "@/libs/db"
import bcrypt from "bcryptjs"
import { verifyAdminToken } from "@/libs/auth"

// GET - Obtener un usuario por ID
export async function GET(request, { params }) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    // Consulta para obtener datos del usuario
    const [usuario] = await db.query(
      `
      SELECT 
        u.id, 
        u.email, 
        u.rol, 
        u.fecha_creacion, 
        u.ultimo_acceso, 
        u.activo
      FROM usuario u
      WHERE u.id = ?
    `,
      [id],
    )

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener datos específicos según el rol
    let detalles = null
    if (usuario.rol === "estudiante") {
      ;[detalles] = await db.query(
        `
        SELECT 
          id, 
          nombre, 
          apellido, 
          email, 
          telefono, 
          foto_perfil, 
          fecha_nacimiento, 
          ci,
          estado
        FROM estudiante 
        WHERE usuario_id = ?
      `,
        [id],
      )
    } else if (usuario.rol === "instructor") {
      ;[detalles] = await db.query(
        `
        SELECT 
          id, 
          nombre, 
          apellido, 
          email, 
          telefono, 
          foto_perfil, 
          fecha_nacimiento, 
          especialidad, 
          certificaciones_cisco, 
          biografia, 
          estado
        FROM instructor 
        WHERE usuario_id = ?
      `,
        [id],
      )
    }

    return NextResponse.json({
      ...usuario,
      detalles,
    })
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}

// PUT - Actualizar un usuario
export async function PUT(request, { params }) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()
    const { email, password, activo, nombre, apellido, telefono, especialidad, biografia, estado, ci } = data

    // Verificar si el usuario existe
    const [usuario] = await db.query("SELECT rol FROM usuario WHERE id = ?", [id])
    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Iniciar transacción
    await db.query("START TRANSACTION")

    try {
      // Actualizar datos básicos del usuario
      let updateUserQuery = "UPDATE usuario SET "
      const updateUserParams = []
      const updateFields = []

      if (email) {
        updateFields.push("email = ?")
        updateUserParams.push(email.toLowerCase())
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        updateFields.push("contrasena_hash = ?")
        updateUserParams.push(hashedPassword)
      }

      if (activo !== undefined) {
        updateFields.push("activo = ?")
        updateUserParams.push(activo ? 1 : 0)
      }

      if (updateFields.length > 0) {
        updateUserQuery += updateFields.join(", ") + " WHERE id = ?"
        updateUserParams.push(id)
        await db.query(updateUserQuery, updateUserParams)
      }

      // Actualizar datos específicos según el rol
      if (usuario.rol === "estudiante" && (nombre || apellido || telefono || estado || ci)) {
        let updateStudentQuery = "UPDATE estudiante SET "
        const updateStudentParams = []
        const updateStudentFields = []

        if (nombre) {
          updateStudentFields.push("nombre = ?")
          updateStudentParams.push(nombre)
        }

        if (apellido) {
          updateStudentFields.push("apellido = ?")
          updateStudentParams.push(apellido)
        }

        if (telefono) {
          updateStudentFields.push("telefono = ?")
          updateStudentParams.push(telefono)
        }

        if (email) {
          updateStudentFields.push("email = ?")
          updateStudentParams.push(email.toLowerCase())
        }

        if (estado) {
          updateStudentFields.push("estado = ?")
          updateStudentParams.push(estado)
        }

        if (ci){
          updateStudentFields.push("ci = ?")
          updateStudentParams.push(ci)
        }

        if (updateStudentFields.length > 0) {
          updateStudentQuery += updateStudentFields.join(", ") + " WHERE usuario_id = ?"
          updateStudentParams.push(id)
          await db.query(updateStudentQuery, updateStudentParams)
        }
      } else if (
        usuario.rol === "instructor" &&
        (nombre || apellido || telefono || especialidad || biografia || estado)
      ) {
        let updateInstructorQuery = "UPDATE instructor SET "
        const updateInstructorParams = []
        const updateInstructorFields = []

        if (nombre) {
          updateInstructorFields.push("nombre = ?")
          updateInstructorParams.push(nombre)
        }

        if (apellido) {
          updateInstructorFields.push("apellido = ?")
          updateInstructorParams.push(apellido)
        }

        if (telefono) {
          updateInstructorFields.push("telefono = ?")
          updateInstructorParams.push(telefono)
        }

        if (email) {
          updateInstructorFields.push("email = ?")
          updateInstructorParams.push(email.toLowerCase())
        }

        if (especialidad) {
          updateInstructorFields.push("especialidad = ?")
          updateInstructorParams.push(especialidad)
        }

        if (biografia) {
          updateInstructorFields.push("biografia = ?")
          updateInstructorParams.push(biografia)
        }

        if (estado) {
          updateInstructorFields.push("estado = ?")
          updateInstructorParams.push(estado)
        }

        if (updateInstructorFields.length > 0) {
          updateInstructorQuery += updateInstructorFields.join(", ") + " WHERE usuario_id = ?"
          updateInstructorParams.push(id)
          await db.query(updateInstructorQuery, updateInstructorParams)
        }
      }

      // Registrar en el log del sistema
      await db.query(
        "INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles) VALUES (?, ?, ?, ?, ?)",
        [adminData.id, "actualizar", "usuario", id, `Actualización de usuario con rol ${usuario.rol}`],
      )

      // Confirmar transacción
      await db.query("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Usuario actualizado correctamente",
      })
    } catch (error) {
      // Revertir transacción en caso de error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

// DELETE - Eliminar un usuario
export async function DELETE(request, { params }) {
  try {
    // Verificar que sea un administrador
    const adminData = await verifyAdminToken(request)
    if (!adminData) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    // Verificar si el usuario existe
    const [usuario] = await db.query("SELECT rol FROM usuario WHERE id = ?", [id])
    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Iniciar transacción
    await db.query("START TRANSACTION")

    try {
      // Registrar en el log del sistema antes de eliminar
      await db.query(
        "INSERT INTO log_sistema (usuario_id, accion, entidad, entidad_id, detalles) VALUES (?, ?, ?, ?, ?)",
        [adminData.id, "eliminar", "usuario", id, `Eliminación de usuario con rol ${usuario.rol}`],
      )

      // Eliminar usuario (las tablas relacionadas se eliminarán por CASCADE)
      await db.query("DELETE FROM usuario WHERE id = ?", [id])

      // Confirmar transacción
      await db.query("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Usuario eliminado correctamente",
      })
    } catch (error) {
      // Revertir transacción en caso de error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
