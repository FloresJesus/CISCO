"use client"

import EstudianteTable from "@/components/admin/estudiantes/EstudiantesTable"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import api from "@/libs/api"


export default function EstudiantesPage() {
  const params = useParams()
  const paraleloId = params.id
  const [paralelo, setParalelo] = useState(null)
  const [cursoId, setCursoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchParalelo = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/admin/paralelos/${paraleloId}`)
        setParalelo(data)
        setCursoId(data.curso_id)
      } catch (err) {
        console.error("Error al cargar el paralelo:", err)
        setError("Error al cargar la información del paralelo. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    if (paraleloId) {
      fetchParalelo()
    }
  }, [paraleloId])

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
  console.log("Paralelo:", paralelo.id)
  return (
    <div className="p-6">
      <EstudianteTable paraleloId={paralelo.id} />
    </div>
  )
}