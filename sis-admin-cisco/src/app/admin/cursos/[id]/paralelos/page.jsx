"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import ParalelosList from "@/components/admin/paralelos/ParalelosList"
import api from "@/libs/api"

export default function ParalelosPage() {
  const params = useParams()
  const cursoId = params.id
  const [curso, setCurso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCurso = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/admin/cursos/${cursoId}`)
        setCurso(data)
      } catch (err) {
        console.error("Error al cargar el curso:", err)
        setError("Error al cargar la información del curso. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    if (cursoId) {
      fetchCurso()
    }
  }, [cursoId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  return <ParalelosList cursoId={cursoId} cursoNombre={curso?.nombre} />
}
