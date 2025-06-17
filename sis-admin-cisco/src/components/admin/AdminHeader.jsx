"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { FiBell, FiSearch, FiUser, FiX, FiLoader } from "react-icons/fi"
import api from "@/libs/api"

export default function AdminHeader() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const searchRef = useRef(null)
  const notificationRef = useRef(null)

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications()
    // Actualizar notificaciones cada minuto
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  // Manejar clics fuera de los dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cargar notificaciones
  const loadNotifications = async () => {
    try {
      const response = await api.get("/notificaciones")
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
      // Si hay error 401, el interceptor ya maneja la redirección
    }
  }

  // Buscar en tiempo real
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true)
        try {
          const response = await api.get(`/buscar?q=${encodeURIComponent(searchTerm)}`)
          setSearchResults(response.data.results || [])
          setShowSearchResults(true)
        } catch (error) {
          console.error("Error en búsqueda:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchTerm])

  // Marcar notificación como leída
  const markAsRead = async (notificationId, url = null) => {
    try {
      await api.put(`/notificaciones/${notificationId}/read`)

      // Actualizar estado local
      setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, leida: 1 } : notif)))
      setUnreadCount((prev) => Math.max(0, prev - 1))

      // Navegar si hay URL
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    }
  }

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  // Manejar clic en resultado de búsqueda
  const handleSearchResultClick = (result) => {
    setShowSearchResults(false)
    setSearchTerm("")
    // Navegar según el tipo de resultado
    switch (result.type) {
      case "estudiante":
        window.location.href = `/admin/usuarios/estudiantes?search=${result.id}`
        break
      case "instructor":
        window.location.href = `/admin/usuarios/instructores?search=${result.id}`
        break
      case "curso":
        window.location.href = `/admin/cursos?search=${result.id}`
        break
      case "pago":
        window.location.href = `/admin/pagos?search=${result.id}`
        break
      default:
        break
    }
  }

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await api.post("/logout")
      window.location.href = "/"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Redirigir de todas formas en caso de error
      window.location.href = "/"
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center flex-1">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {isSearching ? (
                <FiLoader className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <FiSearch className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
              placeholder="Buscar estudiantes, cursos, pagos..."
            />
            {searchTerm && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FiX className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}

            {/* Resultados de búsqueda */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.title}</p>
                        <p className="text-xs text-gray-500">{result.subtitle}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {result.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No se encontraron resultados para "{searchTerm}"
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center ml-4 space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="p-1 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">Ver notificaciones</span>
              <FiBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1  w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b flex items-center justify-between">
                  <span>Notificaciones</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">{unreadCount} nuevas</span>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markAsRead(notification.id, notification.url_destino)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                          !notification.leida ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm ${!notification.leida ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                            >
                              {notification.titulo}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.mensaje}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.fecha_creacion).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!notification.leida && <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">No hay notificaciones</div>
                  )}
                </div>
                <Link
                  href="/admin/notificaciones"
                  className="block px-4 py-2 text-sm text-center text-blue-600 hover:bg-gray-100 border-t"
                  onClick={() => setShowNotifications(false)}
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white">
                <FiUser className="w-5 h-5" />
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link
                  href="/admin/perfil"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Mi Perfil
                </Link>
                <Link
                  href="/admin/configuracion"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Configuración
                </Link>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
