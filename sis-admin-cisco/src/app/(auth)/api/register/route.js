import { NextResponse } from "next/server";
import db from '@/libs/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { 
      nombre, 
      apellido, 
      email, 
      password, 
      telefono = null, 
      fecha_nacimiento = null,
      foto_perfil = null 
    } = await request.json();

    // Validaciones mejoradas
    if (!nombre?.trim() || !apellido?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos obligatorios faltantes',
          details: {
            nombre: !nombre?.trim(),
            apellido: !apellido?.trim(),
            email: !email?.trim(),
            password: !password
          }
        },
        { status: 400 }
      );
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      );
    }

    // Validación de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Validación de fecha de nacimiento
    if (fecha_nacimiento && isNaN(new Date(fecha_nacimiento).getTime())) {
      return NextResponse.json(
        { success: false, error: 'Formato de fecha de nacimiento inválido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.query('SELECT id FROM usuario WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    try {
      // Iniciar transacción
      await db.query('START TRANSACTION');

      // Insertar en tabla usuario
      const userInsert = await db.query(
        `INSERT INTO usuario 
         (email, contrasena_hash, rol, activo, fecha_creacion, ultimo_acceso, token_verificacion, token_expiracion) 
         VALUES (?, ?, ?, ?, NOW(), NULL, ?, ?)`,
        [email, hashedPassword, 'estudiante', 0, verificationToken, tokenExpiration]
      );

      const userId = userInsert.insertId;

      // Insertar en tabla estudiante
      await db.query(
        `INSERT INTO estudiante 
         (usuario_id, nombre, apellido, email, telefono, foto_perfil, fecha_nacimiento, estado, fecha_registro) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'activo', NOW())`,
        [userId, nombre.trim(), apellido.trim(), email, telefono, foto_perfil, 
         fecha_nacimiento ? new Date(fecha_nacimiento) : null]
      );

      // Confirmar transacción
      await db.query('COMMIT');

      // Enviar email de verificación (implementar esta función)
      // await sendVerificationEmail(email, verificationToken);

      return NextResponse.json(
        {
          success: true,
          message: 'Registro exitoso. Por favor verifica tu email.',
          data: { 
            id: userId,
            email,
            necesitaVerificacion: true
          }
        },
        { status: 201 }
      );

    } catch (dbError) {
      // Revertir transacción en caso de error
      await db.query('ROLLBACK');
      console.error('Error en transacción:', dbError);
      
      // Manejo específico de errores de MySQL
      let errorMessage = 'Error en el registro';
      let statusCode = 500;
      
      if (dbError.code === 'ER_DUP_ENTRY') {
        errorMessage = 'El correo electrónico ya está registrado';
        statusCode = 409;
      } else if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        errorMessage = 'Error de integridad referencial';
        statusCode = 400;
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? dbError.message : null
        },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('Error en endpoint de registro:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar la solicitud',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}