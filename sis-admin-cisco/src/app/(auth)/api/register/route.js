import { NextResponse } from "next/server";
import db from '@/libs/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // 1. Obtener y validar los datos del cuerpo
    const { nombre, apellido, email, password, telefono = null, fecha_nacimiento = null } = await request.json();

    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos obligatorios son requeridos' },
        { status: 400 }
      );
    }

    // 2. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      );
    }

    // 3. Verificar si el email ya existe
    const [existingUser] = await db.query('SELECT id FROM Usuario WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    // 4. Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Iniciar transacción
    await db.query('START TRANSACTION');

    try {
      // 6. Insertar en tabla Usuario
      const [userResult] = await db.query(
        'INSERT INTO Usuario (email, contrasena_hash, rol) VALUES (?, ?, ?)',
        [email, hashedPassword, 'estudiante']
      );

      // 7. Insertar en tabla Estudiante
      await db.query(
        `INSERT INTO Estudiante 
         (usuario_id, nombre, apellido, email, telefono, fecha_nacimiento) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userResult.insertId, nombre, apellido, email, telefono, fecha_nacimiento]
      );

      // 8. Confirmar transacción
      await db.query('COMMIT');

      // 9. Responder con éxito
      return NextResponse.json(
        {
          success: true,
          message: 'Registro exitoso',
          data: {
            id: userResult.insertId,
            nombre,
            apellido,
            email
          }
        },
        { status: 201 }
      );

    } catch (dbError) {
      // 10. Revertir en caso de error
      await db.query('ROLLBACK');
      console.error('Error en transacción:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('Error en endpoint de registro:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar el registro',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: 500 }
    );
  }
}