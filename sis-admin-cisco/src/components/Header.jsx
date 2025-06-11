"use client"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaChevronDown,
  FaSearch,
  FaBell,
  FaHome,
  FaBook,
  FaCertificate,
  FaChartBar,
} from "react-icons/fa"
import { useAuth } from "@/components/auth/AuthProvider"

const Header = () => {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const profileMenuRef = useRef(null)
  const [showHeader, setShowHeader] = useState(true)

  // Ocultar header en rutas de admin y auth
  useEffect(() => {
    setShowHeader(!(pathname?.startsWith("/admin") || pathname?.startsWith("/auth")))
  }, [pathname])

  // Efecto para cerrar menús al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
      setIsMobileMenuOpen(false)
      setIsProfileMenuOpen(false)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Efecto para cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Mostrar skeleton loading mientras se verifica la sesión
  if (loading) {
    return (
      <header className="fixed top-0 w-full z-50 bg-primary text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-10 w-32 bg-primary-dark rounded animate-pulse"></div>
          <div className="h-8 w-8 rounded-full bg-primary-dark animate-pulse"></div>
        </div>
      </header>
    )
  }

  // Enlaces de navegación basados en el rol del usuario
  const getNavLinks = () => {
    if (user?.rol === "estudiante") {
      return [
        { name: "Dashboard", href: "/estudiante/dashboard", icon: FaHome },
        { name: "Mis Cursos", href: "/estudiante/cursos", icon: FaBook },
        { name: "Certificados", href: "/estudiante/certificados", icon: FaCertificate },
        { name: "Calificaciones", href: "/estudiante/calificaciones", icon: FaChartBar },
      ]
    }

    return [
      { name: "Inicio", href: "/" },
      { name: "Cursos", href: "/cursos" },
      ...(user?.rol === "admin" ? [{ name: "Admin", href: "/admin" }] : []),
      ...(user?.rol === "instructor" ? [{ name: "Instructor", href: "/instructor" }] : []),
    ]
  }

  const navLinks = getNavLinks()

  // Enlaces del menú de usuario
  const getUserLinks = () => {
    if (user?.rol === "estudiante") {
      return [
        { name: "Mi Perfil", href: "/estudiante/perfil" },
        { name: "Configuración", href: "/estudiante/configuracion" },
        { name: "Mis Pagos", href: "/estudiante/pagos" },
        { name: "Asistencias", href: "/estudiante/asistencias" },
        {
          name: "Cerrar Sesión",
          action: () => {
            logout()
            setIsProfileMenuOpen(false)
            setIsMobileMenuOpen(false)
          },
        },
      ]
    }

    return [
      { name: "Mi Perfil", href: "/perfil" },
      { name: "Configuración", href: "/configuracion" },
      ...(user?.rol === "estudiante" ? [{ name: "Mis Cursos", href: "/mis-cursos" }] : []),
      {
        name: "Cerrar Sesión",
        action: () => {
          logout()
          setIsProfileMenuOpen(false)
          setIsMobileMenuOpen(false)
        },
      },
    ]
  }

  const userLinks = getUserLinks()

  // Función para obtener datos del usuario para mostrar
  const getUserDisplayData = () => {
    if (!user) return { name: "", email: "", photo: null }

    // Para estudiantes e instructores
    if (user.rol === "estudiante" || user.rol === "instructor") {
      return {
        name: `${user.nombre || ""} ${user.apellido || ""}`.trim() || user.email.split("@")[0],
        email: user.email,
        photo: user.foto_perfil,
      }
    }

    // Para admins u otros roles
    return {
      name: user.nombre || user.email.split("@")[0],
      email: user.email,
      photo: user.foto_perfil,
    }
  }

  const userData = getUserDisplayData()

  if (!showHeader) {
    return null
  }

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-primary shadow-md" : "bg-primary/90"} ${isMobileMenuOpen ? "bg-primary" : ""}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={user?.rol === "estudiante" ? "/estudiante/dashboard" : "/"}
            className="flex items-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image src="/images/logo3.png" width={120} height={40} alt="Logo" className="h-10 w-auto" priority />
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === link.href ? "text-celestial" : "text-white hover:text-celestial"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon && <link.icon size={16} />}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Acciones Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    router.push(user?.rol === "estudiante" ? "/estudiante/buscar" : "/busqueda")
                    setIsMobileMenuOpen(false)
                  }}
                  className="p-2 text-white hover:text-celestial transition-colors"
                  aria-label="Buscar"
                >
                  <FaSearch size={16} />
                </button>

                <button
                  onClick={() => {
                    router.push(user?.rol === "estudiante" ? "/estudiante/notificaciones" : "/notificaciones")
                    setIsMobileMenuOpen(false)
                  }}
                  className="p-2 text-white hover:text-celestial relative transition-colors"
                  aria-label="Notificaciones"
                >
                  <FaBell size={16} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none hover:bg-primary-dark/50 rounded-lg px-2 py-1 transition-colors"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                  >
                    {userData.photo ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-celestial/30">
                        <Image
                          src={userData.photo || "/placeholder.svg"}
                          width={32}
                          height={32}
                          alt="Foto de perfil"
                          className="object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/images/default-avatar.png"
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-celestial/20 flex items-center justify-center">
                        <FaUserCircle size={24} className="text-celestial" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-white max-w-[120px] truncate">{userData.name}</span>
                    <FaChevronDown
                      size={12}
                      className={`text-white transition-transform ${isProfileMenuOpen ? "transform rotate-180" : ""}`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{userData.name}</p>
                        <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                        {user?.rol === "estudiante" && (
                          <p className="text-xs text-celestial font-medium mt-1">Estudiante</p>
                        )}
                      </div>
                      {userLinks.map((link, index) =>
                        link.action ? (
                          <button
                            key={`user-link-${index}`}
                            onClick={link.action}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {link.name}
                          </button>
                        ) : (
                          <Link
                            key={`user-link-${index}`}
                            href={link.href}
                            onClick={() => {
                              setIsProfileMenuOpen(false)
                              setIsMobileMenuOpen(false)
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {link.name}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white hover:text-celestial transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-celestial hover:bg-ciscoBlue px-4 py-2 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Botón Mobile */}
          <button
            className="md:hidden p-2 text-white hover:text-celestial focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Menú Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-ciscoDarkBlue pb-4 px-4 rounded-b-lg shadow-xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={`mobile-link-${index}`}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href ? "bg-ciscoBlue text-white" : "text-white hover:bg-ciscoBlue/80"
                  }`}
                >
                  {link.icon && <link.icon size={18} />}
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-celestial/20 pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-3 flex items-center gap-3 mb-3 bg-primary/30 rounded-lg">
                      {userData.photo ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={userData.photo || "/placeholder.svg"}
                            width={48}
                            height={48}
                            alt="Foto de perfil"
                            className="rounded-full object-cover border-2 border-celestial/30"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/images/default-avatar.png"
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-celestial/20 flex items-center justify-center">
                          <FaUserCircle size={32} className="text-celestial" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{userData.name}</p>
                        <p className="text-xs text-white/80 truncate">{userData.email}</p>
                        {user?.rol === "estudiante" && (
                          <p className="text-xs text-celestial font-medium mt-1">Estudiante</p>
                        )}
                      </div>
                    </div>

                    {userLinks.map((link, index) =>
                      link.action ? (
                        <button
                          key={`mobile-user-link-${index}`}
                          onClick={link.action}
                          className="w-full text-left px-3 py-2 text-sm font-medium text-white hover:bg-ciscoBlue/80 rounded-md transition-colors"
                        >
                          {link.name}
                        </button>
                      ) : (
                        <Link
                          key={`mobile-user-link-${index}`}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm font-medium text-white hover:bg-ciscoBlue/80 rounded-md transition-colors"
                        >
                          {link.name}
                        </Link>
                      ),
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-white hover:bg-ciscoBlue/80 rounded-md transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-white bg-celestial hover:bg-ciscoBlue rounded-md transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header