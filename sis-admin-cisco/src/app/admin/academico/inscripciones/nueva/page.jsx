"use client"

import { useRouter } from "next/navigation"
import InscripcionForm from "@/components/admin/inscripciones/InscripcionForm"
import { FaArrowLeft } from "react-icons/fa"

export default function NuevaInscripcionPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/admin/academico/inscripciones")}
          className="text-ciscoBlue hover:text-ciscoDarkBlue flex items-center"
        >
          <FaArrowLeft className="mr-1" />
          Volver a Inscripciones
        </button>
        <h1 className="text-2xl font-bold text-dark">Nueva Inscripción</h1>
      </div>

      <InscripcionForm />
    </div>
  )
}
