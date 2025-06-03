"use client"

import { useState, useEffect } from "react"
import { FiSave, FiCheck, FiX, FiSettings, FiMail, FiLock, FiDatabase, FiFileText } from "react-icons/fi"
import api from "@/libs/api"

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados para cada sección de configuración
  const [configGeneral, setConfigGeneral] = useState({
    nombre_academia: "",
    logo_url: "",
    direccion: "",
    telefono: "",
    sitio_web: "",
    descripcion: "",
  })

  const [configEmail, setConfigEmail] = useState({
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_password: "",
    email_from: "",
    email_reply_to: "",
  })

  const [configCertificados, setConfigCertificados] = useState({
    plantilla_certificado: "",
    firma_digital_url: "",
    sello_url: "",
    texto_certificado: "",
    validez_dias: 0,
  })

  const [configSeguridad, setConfigSeguridad] = useState({
    dias_expiracion_password: 90,
    intentos_login_max: 5,
    tiempo_bloqueo_minutos: 30,
    politica_password: "",
    habilitar_2fa: false,
  })

  const [configBackup, setConfigBackup] = useState({
    frecuencia_backup: "diario",
    hora_backup: "02:00",
    retener_backups: 7,
    ubicacion_backup: "",
  })

  // Cargar configuraciones
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      try {
        const response = await api.get("/admin/configuracion")

        // Distribuir configuraciones por categoría
        const { general, email, certificados, seguridad, backup } = response.data

        setConfigGeneral(general)
        setConfigEmail(email)
        setConfigCertificados(certificados)
        setConfigSeguridad(seguridad)
        setConfigBackup(backup)
      } catch (error) {
        console.error("Error al cargar configuraciones:", error)
        setError("Error al cargar las configuraciones. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  // Guardar configuraciones
  const guardarConfiguracion = async () => {
    setSaving(true)
    try {
      // Combinar todas las configuraciones
      const configData = {
        general: configGeneral,
        email: configEmail,
        certificados: configCertificados,
        seguridad: configSeguridad,
        backup: configBackup,
      }

      await api.put("/configuracion", configData)

      setSuccess("Configuración guardada correctamente")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error al guardar configuraciones:", error)
      setError("Error al guardar las configuraciones")
      setTimeout(() => setError(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  // Realizar backup manual
  const realizarBackupManual = async () => {
    try {
      await api.post("/configuracion/backup")
      setSuccess("Backup iniciado correctamente")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error al iniciar backup:", error)
      setError("Error al iniciar el backup")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Enviar email de prueba
  const enviarEmailPrueba = async () => {
    try {
      await api.post("/configuracion/email/test")
      setSuccess("Email de prueba enviado correctamente")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error al enviar email de prueba:", error)
      setError("Error al enviar el email de prueba")
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark">Configuración</h1>
            <p className="text-gray-600 mt-2">Administración de configuraciones del sistema</p>
          </div>
          <div>
            <button
              onClick={guardarConfiguracion}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-ciscoBlue text-white rounded-md hover:bg-ciscoDarkBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheck className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Tabs de navegación */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "general"
                    ? "border-ciscoBlue text-ciscoBlue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiSettings className="h-4 w-4" />
                General
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "email"
                    ? "border-ciscoBlue text-ciscoBlue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiMail className="h-4 w-4" />
                Email
              </button>
              <button
                onClick={() => setActiveTab("certificados")}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "certificados"
                    ? "border-ciscoBlue text-ciscoBlue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiFileText className="h-4 w-4" />
                Certificados
              </button>
              <button
                onClick={() => setActiveTab("seguridad")}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "seguridad"
                    ? "border-ciscoBlue text-ciscoBlue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiLock className="h-4 w-4" />
                Seguridad
              </button>
              <button
                onClick={() => setActiveTab("backup")}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "backup"
                    ? "border-ciscoBlue text-ciscoBlue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiDatabase className="h-4 w-4" />
                Backup
              </button>
            </nav>
          </div>

          {/* Contenido de las tabs */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ciscoBlue"></div>
                <p className="mt-4 text-gray-600">Cargando configuraciones...</p>
              </div>
            ) : (
              <>
                {/* Tab General */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Configuración General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Academia</label>
                        <input
                          type="text"
                          value={configGeneral.nombre_academia}
                          onChange={(e) => setConfigGeneral({ ...configGeneral, nombre_academia: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL del Logo</label>
                        <input
                          type="text"
                          value={configGeneral.logo_url}
                          onChange={(e) => setConfigGeneral({ ...configGeneral, logo_url: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input
                          type="text"
                          value={configGeneral.direccion}
                          onChange={(e) => setConfigGeneral({ ...configGeneral, direccion: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                          type="text"
                          value={configGeneral.telefono}
                          onChange={(e) => setConfigGeneral({ ...configGeneral, telefono: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                        <input
                          type="text"
                          value={configGeneral.sitio_web}
                          onChange={(e) => setConfigGeneral({ ...configGeneral, sitio_web: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                          value={configGeneral.descripcion}
                          onChange={(e) => setConfigGeneral({ ...configGeneral, descripcion: e.target.value })}
                          rows={4}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Email */}
                {activeTab === "email" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-800">Configuración de Email</h2>
                      <button
                        onClick={enviarEmailPrueba}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Enviar Email de Prueba
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Servidor SMTP</label>
                        <input
                          type="text"
                          value={configEmail.smtp_host}
                          onChange={(e) => setConfigEmail({ ...configEmail, smtp_host: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puerto SMTP</label>
                        <input
                          type="text"
                          value={configEmail.smtp_port}
                          onChange={(e) => setConfigEmail({ ...configEmail, smtp_port: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario SMTP</label>
                        <input
                          type="text"
                          value={configEmail.smtp_user}
                          onChange={(e) => setConfigEmail({ ...configEmail, smtp_user: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña SMTP</label>
                        <input
                          type="password"
                          value={configEmail.smtp_password}
                          onChange={(e) => setConfigEmail({ ...configEmail, smtp_password: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Remitente</label>
                        <input
                          type="email"
                          value={configEmail.email_from}
                          onChange={(e) => setConfigEmail({ ...configEmail, email_from: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email para Respuestas</label>
                        <input
                          type="email"
                          value={configEmail.email_reply_to}
                          onChange={(e) => setConfigEmail({ ...configEmail, email_reply_to: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Certificados */}
                {activeTab === "certificados" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Configuración de Certificados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla de Certificado</label>
                        <select
                          value={configCertificados.plantilla_certificado}
                          onChange={(e) =>
                            setConfigCertificados({ ...configCertificados, plantilla_certificado: e.target.value })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        >
                          <option value="default">Plantilla por defecto</option>
                          <option value="formal">Plantilla formal</option>
                          <option value="moderna">Plantilla moderna</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Firma Digital</label>
                        <input
                          type="text"
                          value={configCertificados.firma_digital_url}
                          onChange={(e) =>
                            setConfigCertificados({ ...configCertificados, firma_digital_url: e.target.value })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL del Sello</label>
                        <input
                          type="text"
                          value={configCertificados.sello_url}
                          onChange={(e) => setConfigCertificados({ ...configCertificados, sello_url: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validez en Días</label>
                        <input
                          type="number"
                          value={configCertificados.validez_dias}
                          onChange={(e) =>
                            setConfigCertificados({ ...configCertificados, validez_dias: Number(e.target.value) })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Certificado</label>
                        <textarea
                          value={configCertificados.texto_certificado}
                          onChange={(e) =>
                            setConfigCertificados({ ...configCertificados, texto_certificado: e.target.value })
                          }
                          rows={4}
                          placeholder="Texto personalizado que aparecerá en los certificados..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Seguridad */}
                {activeTab === "seguridad" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Configuración de Seguridad</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Días para Expiración de Contraseña
                        </label>
                        <input
                          type="number"
                          value={configSeguridad.dias_expiracion_password}
                          onChange={(e) =>
                            setConfigSeguridad({
                              ...configSeguridad,
                              dias_expiracion_password: Number(e.target.value),
                            })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Máximo Intentos de Login</label>
                        <input
                          type="number"
                          value={configSeguridad.intentos_login_max}
                          onChange={(e) =>
                            setConfigSeguridad({ ...configSeguridad, intentos_login_max: Number(e.target.value) })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tiempo de Bloqueo (minutos)
                        </label>
                        <input
                          type="number"
                          value={configSeguridad.tiempo_bloqueo_minutos}
                          onChange={(e) =>
                            setConfigSeguridad({
                              ...configSeguridad,
                              tiempo_bloqueo_minutos: Number(e.target.value),
                            })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Habilitar Autenticación de Dos Factores
                        </label>
                        <div className="mt-2">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={configSeguridad.habilitar_2fa}
                              onChange={(e) =>
                                setConfigSeguridad({ ...configSeguridad, habilitar_2fa: e.target.checked })
                              }
                              className="rounded border-gray-300 text-ciscoBlue shadow-sm focus:border-ciscoBlue focus:ring focus:ring-ciscoBlue focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Activar 2FA</span>
                          </label>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Política de Contraseñas</label>
                        <textarea
                          value={configSeguridad.politica_password}
                          onChange={(e) =>
                            setConfigSeguridad({ ...configSeguridad, politica_password: e.target.value })
                          }
                          rows={3}
                          placeholder="Describe los requisitos para las contraseñas..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Backup */}
                {activeTab === "backup" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-800">Configuración de Backup</h2>
                      <button
                        onClick={realizarBackupManual}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Realizar Backup Manual
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia de Backup</label>
                        <select
                          value={configBackup.frecuencia_backup}
                          onChange={(e) => setConfigBackup({ ...configBackup, frecuencia_backup: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        >
                          <option value="diario">Diario</option>
                          <option value="semanal">Semanal</option>
                          <option value="mensual">Mensual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Backup</label>
                        <input
                          type="time"
                          value={configBackup.hora_backup}
                          onChange={(e) => setConfigBackup({ ...configBackup, hora_backup: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Retener Backups (días)</label>
                        <input
                          type="number"
                          value={configBackup.retener_backups}
                          onChange={(e) =>
                            setConfigBackup({ ...configBackup, retener_backups: Number(e.target.value) })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación de Backup</label>
                        <input
                          type="text"
                          value={configBackup.ubicacion_backup}
                          onChange={(e) => setConfigBackup({ ...configBackup, ubicacion_backup: e.target.value })}
                          placeholder="/ruta/a/backups"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ciscoBlue focus:border-ciscoBlue"
                        />
                      </div>
                    </div>

                    {/* Información adicional sobre backups */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiDatabase className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Información sobre Backups</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Los backups automáticos se ejecutan según la frecuencia configurada</li>
                              <li>Se mantienen los backups según el número de días especificado</li>
                              <li>Los backups incluyen toda la base de datos del sistema</li>
                              <li>Puedes realizar backups manuales en cualquier momento</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
