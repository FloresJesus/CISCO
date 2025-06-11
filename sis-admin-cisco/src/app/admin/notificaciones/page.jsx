"use client"

import { useState, useEffect } from "react"
import { FiBell, FiTrash2, FiCheck, FiCheckCircle, FiFilter } from "react-icons/fi"
import api from "@/libs/api"

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, read
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    loadNotifications()
  }, [currentPage, filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      })

      if (filter === "unread") {
        params.append("unread", "true")
      }

      const response = await api.get(`/notificaciones?${params}`)
      setNotifications(response.data.notifications || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notificaciones/${id}/read`)
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, leida: 1 } : notif)))
    } catch (error) {
      console.error("Error al marcar como leída:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put("/notificaciones/read-all")
      setNotifications((prev) => prev.map((notif) => ({ ...notif, leida: 1 })))
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
    }
  }

  const deleteNotification = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta notificación?")) {
      return
    }

    try {
      await api.delete(`/notificaciones/${id}`)
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    } catch (error) {
      console.error("Error al eliminar notificación:", error)
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "sistema":
        return "bg-blue-100 text-blue-800"
      case "academica":
        return "bg-green-100 text-green-800"
      case "pago":
        return "bg-yellow-100 text-yellow-800"
      case "recordatorio":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FiBell className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiCheckCircle className="w-4 h-4" />
            <span>Marcar todas como leídas</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4 mb-6">
        <FiFilter className="w-5 h-5 text-gray-500" />
        <div className="flex space-x-2">
          {[
            { key: "all", label: "Todas" },
            { key: "unread", label: "No leídas" },
            { key: "read", label: "Leídas" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setFilter(key)
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                !notification.leida ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`font-semibold ${!notification.leida ? "text-gray-900" : "text-gray-700"}`}>
                      {notification.titulo}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.tipo)}`}>
                      {notification.tipo}
                    </span>
                    {!notification.leida && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                  </div>
                  <p className="text-gray-600 mb-2">{notification.mensaje}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.fecha_creacion).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!notification.leida && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Marcar como leída"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Eliminar notificación"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-500">
              {filter === "unread"
                ? "No tienes notificaciones sin leer"
                : "Cuando recibas notificaciones, aparecerán aquí"}
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <div className="text-sm text-gray-700">
            Mostrando {(currentPage - 1) * pagination.limit + 1} a{" "}
            {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} notificaciones
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                )
              }
              return null
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
