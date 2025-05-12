"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

export default function AdminAuthCheck({ children }) {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Si ya terminó de cargar y el usuario no está autenticado, redirigir al login
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/admin")
      return
    }

    // Si el usuario está autenticado pero no es admin, redirigir a la página principal
    if (!loading && isAuthenticated && user?.rol !== "admin") {
      router.push("/")
      return
    }

    // Si el usuario es admin, permitir acceso
    if (!loading && isAuthenticated && user?.rol === "admin") {
      setIsAdmin(true)
    }
  }, [loading, isAuthenticated, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
      </div>
    )
  }

  return children
}
