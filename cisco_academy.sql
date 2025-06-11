CREATE DATABASE IF NOT EXISTS cisco_academy;
USE cisco_academy;

-- Tabla de usuarios (base para todos los roles)
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'instructor', 'estudiante') NOT NULL DEFAULT 'estudiante',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    token_verificacion VARCHAR(255),
    token_recuperacion VARCHAR(255),
    token_expiracion DATETIME,
    INDEX idx_usuario_email (email),
    INDEX idx_usuario_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de instructores (detalles específicos)
CREATE TABLE instructor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255),
    fecha_nacimiento DATE,
    especialidad VARCHAR(100),
    certificaciones_cisco TEXT,
    biografia TEXT,
    estado ENUM('activo', 'inactivo', 'vacaciones', 'licencia') NOT NULL DEFAULT 'activo',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    INDEX idx_instructor_usuario (usuario_id),
    INDEX idx_instructor_email (email),
    INDEX idx_instructor_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de estudiantes (detalles específicos)
CREATE TABLE estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255),
    fecha_nacimiento DATE,
    estado ENUM('activo', 'inactivo', 'suspendido', 'egresado') NOT NULL DEFAULT 'activo',
	tipo_estudiante ENUM('interno', 'externo') NOT NULL DEFAULT 'externo',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    INDEX idx_estudiante_usuario (usuario_id),
    INDEX idx_estudiante_email (email),
    INDEX idx_estudiante_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de cursos (catálogo general)
CREATE TABLE curso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_semanas INT NOT NULL,
    horas_totales INT NOT NULL,
    nivel ENUM('introductorio', 'intermedio', 'avanzado', 'experto') NOT NULL,
    categoria ENUM('ccna', 'cyberops', 'devnet', 'iot', 'otros') NOT NULL,
    estado ENUM('disponible', 'no_disponible', 'en_desarrollo') NOT NULL DEFAULT 'disponible',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    imagen_portada VARCHAR(255),	
    costo_matricula DECIMAL(10,2) NOT NULL,
    INDEX idx_curso_codigo (codigo),
    INDEX idx_curso_categoria (categoria),
    INDEX idx_curso_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de paralelos (ediciones/grupos de un curso)
CREATE TABLE paralelo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    instructor_id INT NOT NULL,
    codigo_paralelo VARCHAR(20) NOT NULL UNIQUE,
    nombre_paralelo VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    horario TEXT NOT NULL,
    aula VARCHAR(50),
    estado ENUM('planificado', 'en_progreso', 'completado', 'cancelado') NOT NULL DEFAULT 'planificado',
    max_estudiantes INT NOT NULL DEFAULT 20,
    FOREIGN KEY (curso_id) REFERENCES curso(id),
    FOREIGN KEY (instructor_id) REFERENCES instructor(id),
    INDEX idx_paralelo_curso (curso_id),
    INDEX idx_paralelo_instructor (instructor_id),
    INDEX idx_paralelo_estado (estado),
    INDEX idx_paralelo_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de inscripciones (matrículas)
CREATE TABLE inscripcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    paralelo_id INT NOT NULL,
    fecha_inscripcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activa', 'completada', 'cancelada', 'suspendida') NOT NULL DEFAULT 'activa',
    calificacion_final DECIMAL(3,1),
    certificado_generado TINYINT(1) NOT NULL DEFAULT 0,
    certificado_fecha DATETIME,
    FOREIGN KEY (estudiante_id) REFERENCES estudiante(id),
    FOREIGN KEY (paralelo_id) REFERENCES paralelo(id),
    UNIQUE KEY uk_inscripcion (estudiante_id, paralelo_id),
    INDEX idx_inscripcion_estudiante (estudiante_id),
    INDEX idx_inscripcion_paralelo (paralelo_id),
    INDEX idx_inscripcion_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de pagos (matrículas)
CREATE TABLE pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME NOT NULL,
    metodo_pago ENUM('transferencia', 'tarjeta', 'efectivo', 'otro') NOT NULL,
    referencia VARCHAR(100),
    estado ENUM('pendiente', 'completado', 'rechazado', 'reembolsado') NOT NULL DEFAULT 'pendiente',
    comprobante VARCHAR(255),
    observaciones TEXT,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripcion(id),
    INDEX idx_pago_inscripcion (inscripcion_id),
    INDEX idx_pago_estado (estado),
    INDEX idx_pago_fecha (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de módulos de cursos
CREATE TABLE modulo_curso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    orden INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_horas INT NOT NULL,
    FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE,
    INDEX idx_modulo_curso (curso_id, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de evaluaciones
CREATE TABLE evaluacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modulo_id INT NOT NULL,
    tipo ENUM('examen', 'tarea', 'proyecto', 'laboratorio') NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor_maximo DECIMAL(5,2) NOT NULL,
    fecha_publicacion DATETIME NOT NULL,
    fecha_limite DATETIME,
    FOREIGN KEY (modulo_id) REFERENCES modulo_curso(id) ON DELETE CASCADE,
    INDEX idx_evaluacion_modulo (modulo_id),
    INDEX idx_evaluacion_fechas (fecha_publicacion, fecha_limite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de calificaciones
CREATE TABLE calificacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluacion_id INT NOT NULL,
    inscripcion_id INT NOT NULL,
    puntuacion DECIMAL(5,2),
    fecha_calificacion DATETIME,
    comentarios TEXT,
    archivo_calificacion VARCHAR(255),
    FOREIGN KEY (evaluacion_id) REFERENCES evaluacion(id),
    FOREIGN KEY (inscripcion_id) REFERENCES inscripcion(id),
    UNIQUE KEY uk_calificacion (evaluacion_id, inscripcion_id),
    INDEX idx_calificacion_evaluacion (evaluacion_id),
    INDEX idx_calificacion_inscripcion (inscripcion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de asistencias
CREATE TABLE asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paralelo_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('presente', 'ausente', 'justificado', 'tardanza') NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (paralelo_id) REFERENCES paralelo(id),
    FOREIGN KEY (estudiante_id) REFERENCES estudiante(id),
    INDEX idx_asistencia_paralelo (paralelo_id),
    INDEX idx_asistencia_estudiante (estudiante_id),
    INDEX idx_asistencia_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de notificaciones
CREATE TABLE notificacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM('sistema', 'academica', 'pago', 'recordatorio') NOT NULL,
    leida TINYINT(1) NOT NULL DEFAULT 0,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    url_destino VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    INDEX idx_notificacion_usuario (usuario_id),
    INDEX idx_notificacion_leida (leida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de logs del sistema (solo para admin)
CREATE TABLE log_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(50) NOT NULL,
    entidad VARCHAR(50),
    entidad_id INT,
    detalles TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    INDEX idx_log_usuario (usuario_id),
    INDEX idx_log_accion (accion),
    INDEX idx_log_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para generar certificado mediante QR
CREATE TABLE certificado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NOT NULL,
    fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    url_verificacion VARCHAR(255) NOT NULL,
    qr_codigo BLOB,
    firmado_admin TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripcion(id) ON DELETE CASCADE,
    UNIQUE KEY uk_certificado_inscripcion (inscripcion_id),
    INDEX idx_certificado_emision (fecha_emision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;