"use client"
import { useRouter } from "next/navigation"
import InscripcionesList from "@/components/admin/inscripciones/InscripcionesList"
import { FaUserPlus } from "react-icons/fa"

export default function InscripcionesPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">Gestión de Inscripciones</h1>
        <button
          onClick={() => router.push("/admin/academico/inscripciones/nueva")}
          className="bg-ciscoBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ciscoDarkBlue transition-colors"
        >
          <FaUserPlus /> Nueva Inscripción
        </button>
      </div>

      <InscripcionesList />
    </div>
  )
}
