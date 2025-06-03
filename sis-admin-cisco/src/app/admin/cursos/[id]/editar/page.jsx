import { notFound } from "next/navigation"
import CursoForm from "@/components/admin/cursos/CursoForm"
import { getCursoById } from "@/libs/data"

export async function generateMetadata({ params }) {
  const curso = await getCursoById(params.id)
  if (!curso) return { title: "Curso no encontrado" }

  return {
    title: `Editar ${curso.nombre} | Panel Administrativo`,
    description: `Editar el curso ${curso.nombre}`,
  }
}

export default async function EditarCursoPage({ params }) {
  const curso = await getCursoById(params.id)

  if (!curso) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <CursoForm curso={curso} />
    </div>
  )
}
