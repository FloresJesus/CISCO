import { NextResponse } from "next/server";
import db from '@/libs/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // 1. Obtener y validar los datos del cuerpo
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
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

    // 3. Buscar usuario en la base de datos
    const [user] = await db.query('SELECT * FROM Usuario WHERE email = ?', [email]);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // 4. Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.contrasena_hash);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // 5. Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expira en 1 día
    );

    // 6. Obtener datos adicionales del usuario según su rol
    let userData = { id: user.id, email: user.email, rol: user.rol };
    
    if (user.rol === 'estudiante') {
      const [estudiante] = await db.query('SELECT * FROM Estudiante WHERE usuario_id = ?', [user.id]);
      userData = { ...userData, ...estudiante };
    } else if (user.rol === 'instructor') {
      const [instructor] = await db.query('SELECT * FROM Instructor WHERE usuario_id = ?', [user.id]);
      userData = { ...userData, ...instructor };
    }

    // 7. Crear respuesta exitosa
    const response = NextResponse.json(
      {
        success: true,
        message: 'Inicio de sesión exitoso',
        user: userData,
        token
      },
      { status: 200 }
    );

    // 8. Configurar cookie HTTP-only (opcional pero recomendado)
    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 1 día en segundos
    });

    return response;

  } catch (error) {
    console.error('Error en endpoint de login:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar el inicio de sesión',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: 500 }
    );
  }
}