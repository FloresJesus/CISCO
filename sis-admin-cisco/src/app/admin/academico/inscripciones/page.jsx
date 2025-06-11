"use client"
import { useRouter } from "next/navigation"
import InscripcionesList from "@/components/admin/inscripciones/InscripcionesList"
import { FaUserPlus } from "react-icons/fa"

export default function InscripcionesPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      

      <InscripcionesList />
    </div>
  )
}
