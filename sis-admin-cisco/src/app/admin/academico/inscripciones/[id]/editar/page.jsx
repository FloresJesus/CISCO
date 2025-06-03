"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import InscripcionForm from "@/components/admin/inscripciones/InscripcionForm"
import { FaArrowLeft } from "react-icons/fa"
import api from "@/libs/api"

export default function EditarInscripcionPage() {
  const params = useParams()
  const router = useRouter()
  const [inscripcion, setInscripcion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInscripcion = async () => {
      try {
        const { data } = await api.get(`/admin/inscripciones/${params.id}`)
        setInscripcion(data)
      } catch (err) {
        console.error("Error al cargar inscripción:", err)
        setError("No se pudo cargar la información de la inscripción")
      } finally {
        setLoading(false)
      }
    }

    fetchInscripcion()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h3 className="text-lg font-medium">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(`/admin/academico/inscripciones/${params.id}`)}
          className="text-ciscoBlue hover:text-ciscoDarkBlue flex items-center"
        >
          <FaArrowLeft className="mr-1" />
          Volver a Detalles
        </button>
        <h1 className="text-2xl font-bold text-dark">Editar Inscripción</h1>
      </div>

      <InscripcionForm inscripcion={inscripcion} />
    </div>
  )
}
