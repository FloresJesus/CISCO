import { notFound } from "next/navigation"
import CursoDetail from "@/components/admin/cursos/CursoDetail"
import { getCursoById } from "@/libs/data"

export async function generateMetadata({ params }) {
  const id = await params.id
  const curso = await getCursoById(id)
  if (!curso) return { title: "Curso no encontrado" }

  return {
    title: `${curso.nombre} | Panel Administrativo`,
    description: `Detalles del curso ${curso.nombre}`,
  }
}

export default async function CursoDetailPage({ params }) {
  const id = await params.id
  const curso = await getCursoById(id)

  if (!curso) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <CursoDetail curso={curso} />
    </div>
  )
}
