import { NextResponse } from "next/server"
import db from "@/libs/db"
import { verifyAdminToken } from "@/libs/auth"

export async function GET(request, { params }) {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { tipo } = params
    const { searchParams } = new URL(request.url)

    // Obtener filtros
    const filters = {
      fechaInicio: searchParams.get("fechaInicio"),
      fechaFin: searchParams.get("fechaFin"),
      curso: searchParams.get("curso"),
      paralelo: searchParams.get("paralelo"),
      instructor: searchParams.get("instructor"),
      estado: searchParams.get("estado"),
      tipoEstudiante: searchParams.get("tipoEstudiante"),
    }

    let data = {}

    switch (tipo) {
      case "pagos":
        data = await getPagosReport(filters)
        break
      case "personas":
        data = await getPersonasReport(filters)
        break
      case "cursos":
        data = await getCursosReport(filters)
        break
      case "cursos-paralelos":
        data = await getCursosParalelosReport(filters)
        break
      case "cursos-instructores":
        data = await getCursosInstructoresReport(filters)
        break
      case "completo":
        data = await getCompletoReport(filters)
        break
      case "notas":
        data = await getNotasReport(filters)
        break
      case "aprobados-reprobados":
        data = await getAprobadosReprobadosReport(filters)
        break
      case "porcentajes":
        data = await getPorcentajesReport(filters)
        break
      case "egresados":
        data = await getEgresadosReport(filters)
        break
      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
    }

    return NextResponse.json({ [tipo]: data })
  } catch (error) {
    console.error(`Error en reporte ${params.tipo}:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// 1. Reporte de Pagos de Matrícula
async function getPagosReport(filters) {
  let sql = `
    SELECT 
      p.id,
      p.monto,
      p.fecha_pago,
      p.metodo_pago,
      p.estado,
      p.referencia,
      e.nombre as estudiante_nombre,
      e.apellido as estudiante_apellido,
      e.email as estudiante_email,
      e.tipo_estudiante,
      c.nombre as curso_nombre,
      c.codigo as curso_codigo,
      par.nombre_paralelo
    FROM pago p
    JOIN inscripcion i ON p.inscripcion_id = i.id
    JOIN estudiante e ON i.estudiante_id = e.id
    JOIN paralelo par ON i.paralelo_id = par.id
    JOIN curso c ON par.curso_id = c.id
    WHERE 1=1
  `

  const params = []

  if (filters.fechaInicio) {
    sql += ` AND p.fecha_pago >= ?`
    params.push(filters.fechaInicio)
  }

  if (filters.fechaFin) {
    sql += ` AND p.fecha_pago <= ?`
    params.push(filters.fechaFin + " 23:59:59")
  }

  if (filters.curso) {
    sql += ` AND c.id = ?`
    params.push(filters.curso)
  }

  if (filters.tipoEstudiante) {
    sql += ` AND e.tipo_estudiante = ?`
    params.push(filters.tipoEstudiante)
  }

  if (filters.estado) {
    sql += ` AND p.estado = ?`
    params.push(filters.estado)
  }

  sql += ` ORDER BY p.fecha_pago DESC`

  return await db.query(sql, params)
}

// 2. Reporte de Personas Académicas
async function getPersonasReport(filters) {
  // Estudiantes
  /*let sqlEstudiantes = `
    SELECT 
      e.id,
      e.nombre,
      e.apellido,
      e.email,
      e.telefono,
      e.tipo_estudiante,
      e.estado,
      e.fecha_registro,
      'estudiante' as rol
    FROM estudiante e
    WHERE 1=1
  `

  const paramsEstudiantes = []

  if (filters.tipoEstudiante) {
    sqlEstudiantes += ` AND e.tipo_estudiante = ?`
    paramsEstudiantes.push(filters.tipoEstudiante)
  }

  if (filters.fechaInicio) {
    sqlEstudiantes += ` AND e.fecha_registro >= ?`
    paramsEstudiantes.push(filters.fechaInicio)
  }

  if (filters.fechaFin) {
    sqlEstudiantes += ` AND e.fecha_registro <= ?`
    paramsEstudiantes.push(filters.fechaFin + " 23:59:59")
  }*/

  // Instructores
  let sqlInstructores = `
    SELECT 
      i.id,
      i.nombre,
      i.apellido,
      i.email,
      i.telefono,
      NULL as tipo_estudiante,
      i.estado,
      i.fecha_registro,
      'instructor' as rol
    FROM instructor i
    WHERE 1=1
  `

  const paramsInstructores = []

  if (filters.fechaInicio) {
    sqlInstructores += ` AND i.fecha_registro >= ?`
    paramsInstructores.push(filters.fechaInicio)
  }

  if (filters.fechaFin) {
    sqlInstructores += ` AND i.fecha_registro <= ?`
    paramsInstructores.push(filters.fechaFin + " 23:59:59")
  }

  //const estudiantes = await db.query(sqlEstudiantes, paramsEstudiantes)
  const instructores = await db.query(sqlInstructores, paramsInstructores)

  return [...instructores].sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))
}

// 3. Reporte de Cursos
async function getCursosReport(filters) {
  let sql = `
    SELECT 
      c.*,
      COUNT(DISTINCT p.id) as total_paralelos,
      COUNT(DISTINCT i.id) as total_inscripciones
    FROM curso c
    LEFT JOIN paralelo p ON c.id = p.curso_id
    LEFT JOIN inscripcion i ON p.id = i.paralelo_id
    WHERE 1=1
  `

  const params = []

  if (filters.curso) {
    sql += ` AND c.id = ?`
    params.push(filters.curso)
  }

  if (filters.estado) {
    sql += ` AND c.estado = ?`
    params.push(filters.estado)
  }

  sql += ` GROUP BY c.id ORDER BY c.nombre`

  return await db.query(sql, params)
}

// 7. Reporte de Notas + Curso + Paralelo + Instructor
async function getNotasReport(filters) {
  let sql = `
    SELECT 
      i.id as inscripcion_id,
      i.calificacion_final,
      i.certificado_generado,
      i.certificado_fecha,
      e.id as estudiante_id,
      e.nombre as estudiante_nombre,
      e.apellido as estudiante_apellido,
      e.tipo_estudiante,
      c.nombre as curso_nombre,
      c.codigo as curso_codigo,
      p.nombre_paralelo,
      inst.nombre as instructor_nombre,
      inst.apellido as instructor_apellido
    FROM inscripcion i
    JOIN estudiante e ON i.estudiante_id = e.id
    JOIN paralelo p ON i.paralelo_id = p.id
    JOIN curso c ON p.curso_id = c.id
    JOIN instructor inst ON p.instructor_id = inst.id
    WHERE 1=1
  `

  const params = []

  if (filters.curso) {
    sql += ` AND c.id = ?`
    params.push(filters.curso)
  }

  if (filters.paralelo) {
    sql += ` AND p.id = ?`
    params.push(filters.paralelo)
  }

  if (filters.instructor) {
    sql += ` AND inst.id = ?`
    params.push(filters.instructor)
  }

  if (filters.tipoEstudiante) {
    sql += ` AND e.tipo_estudiante = ?`
    params.push(filters.tipoEstudiante)
  }

  sql += ` ORDER BY c.nombre, p.nombre_paralelo, e.apellido, e.nombre`

  return await db.query(sql, params)
}

// 9. Reporte de Porcentajes por Curso
async function getPorcentajesReport(filters) {
  let sql = `
    SELECT 
      c.id as curso_id,
      c.nombre as curso_nombre,
      c.codigo as curso_codigo,
      COUNT(i.id) as total_estudiantes,
      COUNT(CASE WHEN i.calificacion_final >= 51 THEN 1 END) as aprobados,
      COUNT(CASE WHEN i.calificacion_final < 51 AND i.calificacion_final IS NOT NULL THEN 1 END) as reprobados,
      ROUND(COUNT(CASE WHEN i.calificacion_final >= 51 THEN 1 END) * 100.0 / NULLIF(COUNT(i.id), 0), 2) as porcentaje_aprobados,
      ROUND(COUNT(CASE WHEN i.calificacion_final < 51 AND i.calificacion_final IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(i.id), 0), 2) as porcentaje_reprobados,
      ROUND(AVG(i.calificacion_final), 2) as promedio_general
    FROM curso c
    JOIN paralelo p ON c.id = p.curso_id
    LEFT JOIN inscripcion i ON p.id = i.paralelo_id
    WHERE 1=1
  `

  const params = []

  if (filters.curso) {
    sql += ` AND c.id = ?`
    params.push(filters.curso)
  }

  sql += ` GROUP BY c.id ORDER BY c.nombre`

  return await db.query(sql, params)
}

// 10. Reporte de Egresados
async function getEgresadosReport(filters) {
  let sql = `
    SELECT 
      e.nombre as estudiante_nombre,
      e.apellido as estudiante_apellido,
      e.email as estudiante_email,
      e.tipo_estudiante,
      c.nombre as curso_nombre,
      c.codigo as curso_codigo,
      p.nombre_paralelo,
      i.calificacion_final,
      i.certificado_generado,
      i.certificado_fecha,
      inst.nombre as instructor_nombre,
      inst.apellido as instructor_apellido
    FROM inscripcion i
    JOIN estudiante e ON i.estudiante_id = e.id
    JOIN paralelo p ON i.paralelo_id = p.id
    JOIN curso c ON p.curso_id = c.id
    JOIN instructor inst ON p.instructor_id = inst.id
    WHERE i.estado = 'completada' AND i.calificacion_final >= 51
  `

  const params = []

  if (filters.curso) {
    sql += ` AND c.id = ?`
    params.push(filters.curso)
  }

  if (filters.tipoEstudiante) {
    sql += ` AND e.tipo_estudiante = ?`
    params.push(filters.tipoEstudiante)
  }

  if (filters.fechaInicio) {
    sql += ` AND i.certificado_fecha >= ?`
    params.push(filters.fechaInicio)
  }

  if (filters.fechaFin) {
    sql += ` AND i.certificado_fecha <= ?`
    params.push(filters.fechaFin + " 23:59:59")
  }

  sql += ` ORDER BY i.certificado_fecha DESC, e.apellido, e.nombre`

  return await db.query(sql, params)
}

// Funciones adicionales simplificadas para los otros reportes
async function getCursosParalelosReport(filters) {
  return []
}

async function getCursosInstructoresReport(filters) {
  return []
}

async function getCompletoReport(filters) {
  return []
}

async function getAprobadosReprobadosReport(filters) {
  return []
}
