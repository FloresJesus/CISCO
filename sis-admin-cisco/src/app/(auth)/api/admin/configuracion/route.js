import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import { query } from "@/libs/db"

export async function GET(request) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    // Obtener todas las configuraciones
    const configuraciones = await query("SELECT categoria, clave, valor FROM configuracion")

    // Organizar configuraciones por categoría
    const config = {
      general: {},
      email: {},
      certificados: {},
      seguridad: {},
      backup: {},
    }

    configuraciones.forEach((conf) => {
      if (config[conf.categoria]) {
        try {
          // Intentar parsear como JSON, si falla usar como string
          config[conf.categoria][conf.clave] = JSON.parse(conf.valor)
        } catch {
          config[conf.categoria][conf.clave] = conf.valor
        }
      }
    })

    // Valores por defecto si no existen
    const defaultConfig = {
      general: {
        nombre_academia: "Cisco Academy",
        logo_url: "",
        direccion: "",
        telefono: "",
        sitio_web: "",
        descripcion: "",
      },
      email: {
        smtp_host: "",
        smtp_port: "587",
        smtp_user: "",
        smtp_password: "",
        email_from: "",
        email_reply_to: "",
      },
      certificados: {
        plantilla_certificado: "default",
        firma_digital_url: "",
        sello_url: "",
        texto_certificado: "",
        validez_dias: 365,
      },
      seguridad: {
        dias_expiracion_password: 90,
        intentos_login_max: 5,
        tiempo_bloqueo_minutos: 30,
        politica_password: "Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números",
        habilitar_2fa: false,
      },
      backup: {
        frecuencia_backup: "diario",
        hora_backup: "02:00",
        retener_backups: 7,
        ubicacion_backup: "/backups",
      },
    }

    // Combinar con valores por defecto
    Object.keys(defaultConfig).forEach((categoria) => {
      config[categoria] = { ...defaultConfig[categoria], ...config[categoria] }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error al obtener configuraciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const configData = await request.json()

    // Actualizar cada configuración
    for (const [categoria, configuraciones] of Object.entries(configData)) {
      for (const [clave, valor] of Object.entries(configuraciones)) {
        const valorString = typeof valor === "object" ? JSON.stringify(valor) : String(valor)

        // Verificar si la configuración existe
        const [existeConfig] = await query("SELECT id FROM configuracion WHERE categoria = ? AND clave = ?", [
          categoria,
          clave,
        ])

        if (existeConfig) {
          // Actualizar configuración existente
          await query("UPDATE configuracion SET valor = ? WHERE categoria = ? AND clave = ?", [
            valorString,
            categoria,
            clave,
          ])
        } else {
          // Crear nueva configuración
          await query("INSERT INTO configuracion (categoria, clave, valor) VALUES (?, ?, ?)", [
            categoria,
            clave,
            valorString,
          ])
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Configuraciones actualizadas correctamente",
    })
  } catch (error) {
    console.error("Error al actualizar configuraciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
