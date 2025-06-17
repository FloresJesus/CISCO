import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/libs/auth"
import db from "@/libs/db"

export async function GET(request) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // 1. Estadísticas generales del sistema
    const [estadisticasGenerales] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM usuario WHERE activo = 1) as usuarios_activos,
        (SELECT COUNT(*) FROM estudiante WHERE estado = 'activo') as estudiantes_activos,
        (SELECT COUNT(*) FROM instructor WHERE estado = 'activo') as instructores_activos,
        (SELECT COUNT(*) FROM curso WHERE estado = 'disponible') as cursos_disponibles,
        (SELECT COUNT(*) FROM paralelo WHERE estado IN ('planificado', 'en_progreso')) as paralelos_activos,
        (SELECT COUNT(*) FROM inscripcion WHERE estado = 'activa') as inscripciones_activas
    `)

    // 2. Crecimiento de usuarios por mes
    const crecimientoUsuarios = await db.query(`
      SELECT 
        DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
        COUNT(*) as nuevos_usuarios,
        SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(fecha_creacion, '%Y-%m')) as usuarios_acumulados
      FROM usuario
      WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
      ORDER BY mes ASC
    `)

    // 3. Distribución de usuarios por rol
    const distribucionRoles = await db.query(`
      SELECT 
        rol,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM usuario WHERE activo = 1), 2) as porcentaje
      FROM usuario
      WHERE activo = 1
      GROUP BY rol
      ORDER BY cantidad DESC
    `)

    // 4. Actividad de usuarios (últimos accesos)
    const actividadUsuarios = await db.query(`
      SELECT 
        CASE 
          WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Último día'
          WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Última semana'
          WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Último mes'
          WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 'Últimos 3 meses'
          ELSE 'Más de 3 meses'
        END as periodo_actividad,
        COUNT(*) as cantidad_usuarios
      FROM usuario
      WHERE activo = 1 AND ultimo_acceso IS NOT NULL
      GROUP BY 
        CASE 
          WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Último día'
          WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Última semana'
          WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Último mes'
          WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 'Últimos 3 meses'
          ELSE 'Más de 3 meses'
        END
      ORDER BY 
        CASE 
          WHEN periodo_actividad = 'Último día' THEN 1
          WHEN periodo_actividad = 'Última semana' THEN 2
          WHEN periodo_actividad = 'Último mes' THEN 3
          WHEN periodo_actividad = 'Últimos 3 meses' THEN 4
          ELSE 5
        END
    `)

    // 5. Estadísticas de cursos por categoría y nivel
    const estadisticasCursos = await db.query(`
      SELECT 
        c.categoria,
        c.nivel,
        COUNT(DISTINCT c.id) as total_cursos,
        COUNT(DISTINCT p.id) as total_paralelos,
        COUNT(i.id) as total_inscripciones,
        AVG(c.duracion_semanas) as duracion_promedio
      FROM curso c
      LEFT JOIN paralelo p ON c.id = p.curso_id
      LEFT JOIN inscripcion i ON p.id = i.paralelo_id
      GROUP BY c.categoria, c.nivel
      ORDER BY c.categoria, c.nivel
    `)

    // 6. Tasa de finalización por curso
    const tasaFinalizacion = await db.query(`
      SELECT 
        c.nombre as curso,
        COUNT(i.id) as total_inscripciones,
        COUNT(CASE WHEN i.estado = 'completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN i.estado = 'cancelada' THEN 1 END) as canceladas,
        ROUND(COUNT(CASE WHEN i.estado = 'completada' THEN 1 END) * 100.0 / NULLIF(COUNT(i.id), 0), 2) as tasa_finalizacion,
        ROUND(COUNT(CASE WHEN i.estado = 'cancelada' THEN 1 END) * 100.0 / NULLIF(COUNT(i.id), 0), 2) as tasa_cancelacion
      FROM curso c
      LEFT JOIN paralelo p ON c.id = p.curso_id
      LEFT JOIN inscripcion i ON p.id = i.paralelo_id
      GROUP BY c.id, c.nombre
      HAVING total_inscripciones > 0
      ORDER BY tasa_finalizacion DESC
    `)

    // 7. Distribución geográfica de estudiantes
    const distribucionEstudiantes = await db.query(`
      SELECT 
        e.tipo_estudiante,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM estudiante WHERE estado = 'activo'), 2) as porcentaje
      FROM estudiante e
      WHERE e.estado = 'activo'
      GROUP BY e.tipo_estudiante
      ORDER BY cantidad DESC
    `)

    // 8. Rendimiento académico general
    const [rendimientoGeneral] = await db.query(`
      SELECT 
        COUNT(CASE WHEN calificacion_final >= 85 THEN 1 END) as excelente,
        COUNT(CASE WHEN calificacion_final >= 70 AND calificacion_final < 85 THEN 1 END) as bueno,
        COUNT(CASE WHEN calificacion_final >= 51 AND calificacion_final < 70 THEN 1 END) as regular,
        COUNT(CASE WHEN calificacion_final < 51 THEN 1 END) as deficiente,
        AVG(calificacion_final) as promedio_general,
        COUNT(*) as total_calificaciones
      FROM inscripcion
      WHERE calificacion_final IS NOT NULL
    `)

    return NextResponse.json({
      success: true,
      data: {
        estadisticasGenerales,
        crecimientoUsuarios,
        distribucionRoles,
        actividadUsuarios,
        estadisticasCursos,
        tasaFinalizacion,
        distribucionEstudiantes,
        rendimientoGeneral,
      },
    })
  } catch (error) {
    console.error("Error en reporte de estadísticas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
