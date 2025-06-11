"use client"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import api from "@/libs/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const verifySession = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/verify")
      setUser(data?.user || null)

      // Si el usuario está autenticado y tiene rol de admin, redirigir al panel administrativo
      // Solo redirigir si no está ya en una ruta de admin
      if (data?.user?.rol === "admin" && !pathname?.startsWith("/admin")) {
        router.push("/admin")
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [pathname, router])

  useEffect(() => {
    verifySession()
  }, [verifySession])

  const login = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await api.post("/login", credentials)
      await verifySession() // Verificar la sesión después de login

      // Redirigir según el rol después del login exitoso
      if (data?.user?.rol === "admin") {
        router.push("/admin")
      } else if (data?.user?.rol === "estudiante") {
        // Redirigir a la página principal o a la página anterior si no es admin
        router.push("/estudiante/dashboard")
      }

      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await api.post("/logout")
      setUser(null)
      // Redirigir a la página de inicio después de cerrar sesión
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        isAuthenticated: !!user,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)