"use client"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FaBars, FaTimes, FaUserCircle, FaChevronDown, FaSearch, FaBell } from "react-icons/fa"
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
  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Cursos", href: "/cursos" },
    //{ name: "Recursos", href: "/recursos" },
    ...(user?.rol === "admin" ? [{ name: "Admin", href: "/admin" }] : []),
    ...(user?.rol === "instructor" ? [{ name: "Instructor", href: "/instructor" }] : []),
  ]

  // Enlaces del menú de usuario
  const userLinks = [
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
          <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <Image src="/images/logo3.png" width={120} height={40} alt="Logo" className="h-10 w-auto" priority />
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${pathname === link.href ? "text-celestial" : "text-white hover:text-celestial"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
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
                    router.push("/busqueda")
                    setIsMobileMenuOpen(false)
                  }}
                  className="p-2 text-white hover:text-celestial"
                >
                  <FaSearch size={16} />
                </button>

                <button
                  onClick={() => {
                    router.push("/notificaciones")
                    setIsMobileMenuOpen(false)
                  }}
                  className="p-2 text-white hover:text-celestial relative"
                >
                  <FaBell size={16} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {userData.photo ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
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
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaUserCircle size={24} className="text-gray-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-white max-w-[120px] truncate">{userData.name}</span>
                    <FaChevronDown
                      size={12}
                      className={`text-white transition-transform ${isProfileMenuOpen ? "transform rotate-180" : ""}`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900 truncate">{userData.name}</p>
                        <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                      </div>
                      {userLinks.map((link) =>
                        link.action ? (
                          <button
                            key={link.name}
                            onClick={link.action}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {link.name}
                          </button>
                        ) : (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => {
                              setIsProfileMenuOpen(false)
                              setIsMobileMenuOpen(false)
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  className="text-sm font-medium text-white hover:text-celestial"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-celestial hover:bg-ciscoBlue px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Botón Mobile */}
          <button
            className="md:hidden p-2 text-white hover:text-celestial focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Menú Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-ciscoDarkBlue pb-4 px-4 rounded-b-lg shadow-xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === link.href ? "bg-ciscoBlue text-white" : "text-white hover:bg-ciscoBlue/80"}`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-celestial/20 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 flex items-center gap-3 mb-2">
                      {userData.photo ? (
                        <div className="relative w-10 h-10">
                          <Image
                            src={userData.photo || "/placeholder.svg"}
                            fill
                            alt="Foto de perfil"
                            className="rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/images/default-avatar.png"
                            }}
                          />
                        </div>
                      ) : (
                        <FaUserCircle size={32} className="text-white" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{userData.name}</p>
                        <p className="text-xs text-white/80 truncate">{userData.email}</p>
                      </div>
                    </div>

                    {userLinks.map((link) =>
                      link.action ? (
                        <button
                          key={link.name}
                          onClick={link.action}
                          className="w-full text-left px-3 py-2 text-sm font-medium text-white hover:bg-ciscoBlue/80 rounded-md"
                        >
                          {link.name}
                        </button>
                      ) : (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm font-medium text-white hover:bg-ciscoBlue/80 rounded-md"
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
                      className="block px-3 py-2 text-sm font-medium text-white hover:bg-ciscoBlue/80 rounded-md"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-white bg-celestial hover:bg-ciscoBlue rounded-md"
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
